const express = require('express');
const pool = require('../database/pool');
const cache = require('../services/cache');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { company } = require('../validators');
const makeId = require('../utils/id');
const router = express.Router();

router.get('/', async (req, res, next) => { try { const { rows } = await pool.query('SELECT id,name,location,description FROM companies ORDER BY created_at ASC'); res.json({ status: 'success', data: { companies: rows } }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => {
  try {
    const key = `company:${req.params.id}`; const hit = await cache.get(key);
    if (hit) { res.set('X-Data-Source', 'cache'); return res.json(hit); }
    const { rows } = await pool.query('SELECT id,name,location,description FROM companies WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Company not found' });
    const body = { status: 'success', data: rows[0] }; await cache.set(key, body);
    res.set('X-Data-Source', 'database'); return res.json(body);
  } catch (e) { return next(e); }
});
router.post('/', auth, validate(company), async (req, res, next) => { try { const id = makeId('company'); const { name, location, description = null } = req.body; await pool.query('INSERT INTO companies(id,name,location,description,created_by) VALUES($1,$2,$3,$4,$5)', [id, name, location, description, req.auth.id]); await cache.del(`company:${id}`); res.status(201).json({ status: 'success', data: { id } }); } catch (e) { next(e); } });
router.put('/:id', auth, validate(company), async (req, res, next) => { try { const { name, location, description = null } = req.body; const r = await pool.query('UPDATE companies SET name=$1,location=$2,description=$3 WHERE id=$4', [name, location, description, req.params.id]); if (!r.rowCount) return res.status(404).json({ status: 'failed', message: 'Company not found' }); await cache.del(`company:${req.params.id}`); return res.json({ status: 'success', message: 'Company updated' }); } catch (e) { return next(e); } });
router.delete('/:id', auth, async (req, res, next) => { try { const r = await pool.query('DELETE FROM companies WHERE id=$1', [req.params.id]); if (!r.rowCount) return res.status(404).json({ status: 'failed', message: 'Company not found' }); await cache.del(`company:${req.params.id}`); return res.json({ status: 'success', message: 'Company deleted' }); } catch (e) { return next(e); } });
module.exports = router;
