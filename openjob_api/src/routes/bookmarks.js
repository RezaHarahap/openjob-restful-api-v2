const express = require('express');
const pool = require('../database/pool');
const cache = require('../services/cache');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.get('/', async (req, res, next) => {
  try {
    const key = `bookmarks:${req.auth.id}`; const hit = await cache.get(key);
    if (hit) { res.set('X-Data-Source', 'cache'); return res.json(hit); }
    const { rows } = await pool.query('SELECT b.id,b.user_id,b.job_id,b.created_at,j.title FROM bookmarks b JOIN jobs j ON j.id=b.job_id WHERE b.user_id=$1 ORDER BY b.created_at ASC', [req.auth.id]);
    const body = { status: 'success', data: { bookmarks: rows } }; await cache.set(key, body);
    res.set('X-Data-Source', 'database'); return res.json(body);
  } catch (e) { return next(e); }
});
module.exports = router;
