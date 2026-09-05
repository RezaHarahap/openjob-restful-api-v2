require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const required = ['RABBITMQ_HOST', 'MAIL_HOST', 'MAIL_PORT'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
});
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: process.env.MAIL_USER ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD } : undefined,
});
const queue = process.env.RABBITMQ_QUEUE || 'job_applications';
const amqpUrl = process.env.AMQP_URL || `amqp://${encodeURIComponent(process.env.RABBITMQ_USER || 'guest')}:${encodeURIComponent(process.env.RABBITMQ_PASSWORD || 'guest')}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT || 5672}`;

const applicationData = async (id) => {
  const { rows } = await pool.query(`
    SELECT a.id, a.created_at, applicant.name AS applicant_name,
      applicant.email AS applicant_email, owner.email AS owner_email,
      j.title AS job_title
    FROM applications a
    JOIN users applicant ON applicant.id = a.user_id
    JOIN jobs j ON j.id = a.job_id
    JOIN users owner ON owner.id = j.created_by
    WHERE a.id = $1
  `, [id]);
  return rows[0];
};

const notifyOwner = async (applicationId) => {
  const data = await applicationData(applicationId);
  if (!data) throw new Error(`Application ${applicationId} not found`);
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'OpenJob <no-reply@openjob.local>',
    to: data.owner_email,
    subject: `Lamaran baru untuk ${data.job_title}`,
    text: [
      `Ada lamaran baru untuk posisi ${data.job_title}.`,
      `Nama pelamar: ${data.applicant_name}`,
      `Email pelamar: ${data.applicant_email}`,
      `Tanggal lamaran: ${new Date(data.created_at).toISOString()}`,
    ].join('\n'),
  });
  console.log(`Notification for ${applicationId} sent to job owner ${data.owner_email}`);
};

const run = async () => {
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1);
  console.log(`OpenJob consumer is waiting on queue ${queue}`);
  channel.consume(queue, async (message) => {
    if (!message) return;
    try {
      const payload = JSON.parse(message.content.toString());
      if (!payload.application_id || Object.keys(payload).length !== 1) throw new Error('Invalid message payload');
      await notifyOwner(payload.application_id);
      channel.ack(message);
    } catch (error) {
      console.error('Failed to process message:', error.message);
      channel.nack(message, false, false);
    }
  });
  const shutdown = async () => { await channel.close(); await connection.close(); await pool.end(); process.exit(0); };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
};

run().catch((error) => { console.error(error); process.exit(1); });
