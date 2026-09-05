const express = require('express');
const pool = require('../database/pool');
const cache = require('../services/cache');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { application, applicationStatus } = require('../validators');
const makeId = require('../utils/id');
const { publishApplication } = require('../services/messageBroker');
const router = express.Router();
const select = `SELECT a.id,a.user_id,a.job_id,a.status,a.created_at,u.name AS user_name,j.title AS job_title FROM applications a JOIN users u ON u.id=a.user_id JOIN jobs j ON j.id=a.job_id`;

const cachedList = (kind, param) => async (req, res, next) => {
  try {
    const value = req.params[param]; const key = `applications:${kind}:${value}`; const hit = await cache.get(key);
    if (hit) { res.set('X-Data-Source', 'cache'); return res.json(hit); }
    const column = kind === 'user' ? 'user_id' : 'job_id';
    const { rows } = await pool.query(`${select} WHERE a.${column}=$1 ORDER BY a.created_at ASC`, [value]);
    const body = { status: 'success', data: { applications: rows } }; await cache.set(key, body);
    res.set('X-Data-Source', 'database'); return res.json(body);
  } catch (e) { return next(e); }
};

router.use(auth);
router.get('/user/:userId', cachedList('user', 'userId'));
router.get('/job/:jobId', cachedList('job', 'jobId'));
router.get('/', async (req, res, next) => { try { const { rows } = await pool.query(`${select} ORDER BY a.created_at ASC`); res.json({ status: 'success', data: { applications: rows } }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => {
  try {
    const key = `application:${req.params.id}`; const hit = await cache.get(key);
    if (hit) { res.set('X-Data-Source', 'cache'); return res.json(hit); }
    const { rows } = await pool.query(`${select} WHERE a.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Application not found' });
    const body = { status: 'success', data: rows[0] }; await cache.set(key, body);
    res.set('X-Data-Source', 'database'); return res.json(body);
  } catch (e) { return next(e); }
});
router.post('/', validate(application), async (req, res, next) => {
  try {
    const id = makeId('application'); const { user_id, job_id, status } = req.body;
    await pool.query('INSERT INTO applications(id,user_id,job_id,status) VALUES($1,$2,$3,$4)', [id, user_id, job_id, status]);
    await cache.del(`applications:user:${user_id}`, `applications:job:${job_id}`);
    publishApplication(id).catch((error) => console.error('RabbitMQ publish failed:', error.message));
    return res.status(201).json({ status: 'success', data: { id, user_id, job_id, status } });
  } catch (e) {
    if (e.code === '23503') return res.status(400).json({ status: 'failed', message: 'User or job not found' });
    if (e.code === '23505') return res.status(400).json({ status: 'failed', message: 'Application already exists' });
    return next(e);
  }
});
router.put('/:id', validate(applicationStatus), async (req, res, next) => {
  try {
    const { rows } = await pool.query('UPDATE applications SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING user_id,job_id', [req.body.status, req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Application not found' });
    await cache.del(`application:${req.params.id}`, `applications:user:${rows[0].user_id}`, `applications:job:${rows[0].job_id}`);
    return res.json({ status: 'success', message: 'Application updated' });
  } catch (e) { return next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM applications WHERE id=$1 RETURNING user_id,job_id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Application not found' });
    await cache.del(`application:${req.params.id}`, `applications:user:${rows[0].user_id}`, `applications:job:${rows[0].job_id}`);
    return res.json({ status: 'success', message: 'Application deleted' });
  } catch (e) { return next(e); }
});
module.exports = router;
