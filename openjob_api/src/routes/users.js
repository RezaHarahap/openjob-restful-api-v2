const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/pool');
const cache = require('../services/cache');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators');
const makeId = require('../utils/id');
const router = express.Router();

router.post('/', validate(v.user), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if ((await pool.query('SELECT 1 FROM users WHERE email=$1', [email])).rowCount) return res.status(400).json({ status: 'failed', message: 'Email already registered' });
    const id = makeId('user'); const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users(id,name,email,password,role) VALUES($1,$2,$3,$4,$5)', [id, name, email, hash, role]);
    return res.status(201).json({ status: 'success', data: { id } });
  } catch (e) { return next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const key = `user:${req.params.id}`; const hit = await cache.get(key);
    if (hit) { res.set('X-Data-Source', 'cache'); return res.json(hit); }
    const { rows } = await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'User not found' });
    const body = { status: 'success', data: rows[0] }; await cache.set(key, body);
    res.set('X-Data-Source', 'database'); return res.json(body);
  } catch (e) { return next(e); }
});
router.put('/:id', auth, validate(v.userUpdate), async (req, res, next) => {
  try {
    if (req.auth.id !== req.params.id) return res.status(403).json({ status: 'failed', message: 'Forbidden' });
    const payload = { ...req.body };
    if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);
    const fields = Object.keys(payload); const values = Object.values(payload);
    const set = fields.map((field, index) => `${field}=$${index + 1}`).join(',');
    const result = await pool.query(`UPDATE users SET ${set} WHERE id=$${fields.length + 1}`, [...values, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ status: 'failed', message: 'User not found' });
    await cache.del(`user:${req.params.id}`);
    return res.json({ status: 'success', message: 'User updated' });
  } catch (e) { return next(e); }
});
module.exports = router;
