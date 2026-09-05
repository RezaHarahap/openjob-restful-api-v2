const crypto = require('crypto');
module.exports = (prefix) => `${prefix}-${crypto.randomUUID()}`;
