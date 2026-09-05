const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const pool = require('../database/pool');
const auth = require('../middleware/auth');
const makeId = require('../utils/id');

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try { await fs.mkdir(uploadDir, { recursive: true }); cb(null, uploadDir); } catch (error) { cb(error); }
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${makeId('document')}.pdf`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
});

router.post('/', auth, (req, res, next) => upload.single('document')(req, res, async (error) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ status: 'failed', message: 'File exceeds maximum size of 5 MB' });
  if (error) return next(error);
  if (!req.file) return res.status(400).json({ status: 'failed', message: 'File is required and must be a PDF' });
  try {
    const id = makeId('document');
    await pool.query('INSERT INTO documents(id,user_id,filename,original_name,mime_type,size,path) VALUES($1,$2,$3,$4,$5,$6,$7)', [id, req.auth.id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.file.path]);
    return res.status(201).json({ status: 'success', data: { documentId: id, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size } });
  } catch (dbError) {
    await fs.unlink(req.file.path).catch(() => {});
    return next(dbError);
  }
}));

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id,filename,original_name AS "originalName",size,created_at FROM documents ORDER BY created_at ASC');
    res.json({ status: 'success', data: { documents: rows } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT path,original_name FROM documents WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Document not found' });
    res.type('application/pdf');
    res.set('Content-Disposition', `inline; filename="${path.basename(rows[0].original_name).replace(/"/g, '')}"`);
    return res.sendFile(path.resolve(rows[0].path));
  } catch (error) { return next(error); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM documents WHERE id=$1 AND user_id=$2 RETURNING path', [req.params.id, req.auth.id]);
    if (!rows[0]) return res.status(404).json({ status: 'failed', message: 'Document not found' });
    await fs.unlink(rows[0].path).catch((error) => { if (error.code !== 'ENOENT') throw error; });
    return res.json({ status: 'success', message: 'Document deleted' });
  } catch (error) { return next(error); }
});

module.exports = router;
