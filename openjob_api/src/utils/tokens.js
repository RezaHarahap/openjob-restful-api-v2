const jwt = require('jsonwebtoken');
const { accessTokenKey, refreshTokenKey } = require('../config');

const generateAccessToken = (id) => jwt.sign({ id }, accessTokenKey, { expiresIn: '3h' });
const generateRefreshToken = (id) => jwt.sign({ id }, refreshTokenKey, { expiresIn: '7d' });
const verifyAccessToken = (token) => jwt.verify(token, accessTokenKey);
const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenKey);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
