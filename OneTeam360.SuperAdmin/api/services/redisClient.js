const redis = require('redis');

const port = process.env.REDIS_PORT_NO;
const host = process.env.REDIS_HOST;
const auth = process.env.REDIS_ACCESS_KEY;

const client = redis.createClient(port, host, {auth_pass: auth, tls: {servername: host}, enable_offline_queue: false});

client.on('connect', () => {
  sails.log('LOG : REDIS CONNECTED');
});

client.on('error', (error) => {
  sails.log('LOG : REDIS ERROR ',error);
});

module.exports = { redisClient: client };
