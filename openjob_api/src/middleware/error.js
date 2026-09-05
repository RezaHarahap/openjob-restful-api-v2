module.exports = (err, req, res, next) => {
  console.error(err);
  if (err && err.code === '23505') {
    return res.status(409).json({ status: 'failed', message: 'Data already exists' });
  }
  if (err && err.code === '23503') {
    return res.status(400).json({ status: 'failed', message: 'Referenced data does not exist' });
  }
  return res.status(500).json({ status: 'error', message: 'Internal server error' });
};
