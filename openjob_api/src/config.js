require('dotenv').config();

module.exports = {
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT || 3000),
  accessTokenKey: process.env.ACCESS_TOKEN_KEY,
  refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
};
