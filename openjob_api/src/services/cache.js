const { createClient } = require('redis');

let client;
let connecting;

const getClient = async () => {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });
    client.on('error', (error) => console.error('Redis error:', error.message));
  }
  if (!client.isOpen) {
    connecting ||= client.connect().finally(() => { connecting = undefined; });
    await connecting;
  }
  return client;
};

exports.get = async (key) => {
  const value = await (await getClient()).get(key);
  return value ? JSON.parse(value) : null;
};
exports.set = async (key, value) => (await getClient()).set(key, JSON.stringify(value), { EX: 3600 });
exports.del = async (...keys) => keys.length && (await getClient()).del(keys);
exports.close = async () => { if (client?.isOpen) await client.quit(); };
