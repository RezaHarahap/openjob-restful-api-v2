const express = require('express');
const pool = require('../database/pool');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createJob, updateJob } = require('../validators');
const makeId = require('../utils/id');

const router = express.Router();
const fields = [
  'company_id', 'category_id', 'title', 'description', 'job_type',
  'experience_level', 'location_type', 'location_city', 'salary_min',
  'salary_max', 'is_salary_visible', 'status',
];
const select = `SELECT j.id,j.company_id,j.category_id,j.title,j.description,
  j.job_type,j.experience_level,j.location_type,j.location_city,j.salary_min,
  j.salary_max,j.is_salary_visible,j.status,c.name AS company_name,
  cat.name AS category_name
  FROM jobs j
  JOIN companies c ON c.id=j.company_id
  JOIN categories cat ON cat.id=j.category_id`;

router.get('/company/:companyId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${select} WHERE j.company_id=$1 ORDER BY j.created_at ASC`, [req.params.companyId]);
    return res.json({ status: 'success', data: { jobs: rows } });
  } catch (error) { return next(error); }
});

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${select} WHERE j.category_id=$1 ORDER BY j.created_at ASC`, [req.params.categoryId]);
    return res.json({ status: 'success', data: { jobs: rows } });
  } catch (error) { return next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const values = [];
    const conditions = [];
    if (req.query.title) {
      values.push(`%${req.query.title}%`);
      conditions.push(`j.title ILIKE $${values.length}`);
    }
    if (req.query['company-name']) {
      values.push(`%${req.query['company-name']}%`);
      conditions.push(`c.name ILIKE $${values.length}`);
    }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`${select}${where} ORDER BY j.created_at ASC`, values);
    return res.json({ status: 'success', data: { jobs: rows } });
  } catch (error) { return next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${select} WHERE j.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Job not found' });
    return res.json({ status: 'success', data: rows[0] });
  } catch (error) { return next(error); }
});

router.post('/', auth, validate(createJob), async (req, res, next) => {
  try {
    const id = makeId('job');
    const values = fields.map((field) => req.body[field] ?? null);
    const placeholders = fields.map((_, index) => `$${index + 2}`).join(',');
    await pool.query(
      `INSERT INTO jobs(id,${fields.join(',')},created_by) VALUES($1,${placeholders},$${fields.length + 2})`,
      [id, ...values, req.auth.id],
    );
    return res.status(201).json({ status: 'success', data: { id } });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ status: 'failed', message: 'Company or category not found' });
    return next(error);
  }
});

router.put('/:id', auth, validate(updateJob), async (req, res, next) => {
  try {
    // Partial update: only columns explicitly sent by the client are changed.
    const changedFields = fields.filter((field) => Object.hasOwn(req.body, field));
    const values = changedFields.map((field) => req.body[field]);
    const assignments = changedFields.map((field, index) => `${field}=$${index + 1}`);
    assignments.push('updated_at=CURRENT_TIMESTAMP');
    const { rowCount } = await pool.query(
      `UPDATE jobs SET ${assignments.join(',')} WHERE id=$${values.length + 1}`,
      [...values, req.params.id],
    );
    if (!rowCount) return res.status(404).json({ status: 'failed', message: 'Job not found' });
    return res.json({ status: 'success', message: 'Job updated' });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ status: 'failed', message: 'Company or category not found' });
    return next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ status: 'failed', message: 'Job not found' });
    return res.json({ status: 'success', message: 'Job deleted' });
  } catch (error) { return next(error); }
});

module.exports = router;
