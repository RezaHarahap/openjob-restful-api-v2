const amqp = require('amqplib');

const queue = process.env.RABBITMQ_QUEUE || 'job_applications';
const url = process.env.AMQP_URL || `amqp://${encodeURIComponent(process.env.RABBITMQ_USER || 'guest')}:${encodeURIComponent(process.env.RABBITMQ_PASSWORD || 'guest')}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

exports.publishApplication = async (applicationId) => {
  let connection;
  try {
    connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify({ application_id: applicationId })), { persistent: true });
    await channel.close();
  } finally {
    if (connection) await connection.close();
  }
};
