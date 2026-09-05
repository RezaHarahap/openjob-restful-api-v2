const { verifyAccessToken } = require('../utils/tokens');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'failed', message: 'Authentication required' });
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.auth = { id: payload.id };
    return next();
  } catch (error) {
    return res.status(401).json({ status: 'failed', message: 'Invalid access token' });
  }
};
