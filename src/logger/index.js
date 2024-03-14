const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timeStamp: pino.stdTimeFunctions.isoTime
});
module.exports = logger;