const { time } = require('console');

const Config = require('@/config').Config;

module.exports = {
  dialect: 'postgres',
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  username: Config.DB_USER,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  timezone: 'Asia/Jakarta',
  dialectOptions: {
    useUTC: false, // for reading from database
    dateStrings: true,
    typeCast: function (field, next) {
      if (field.type === 'DATETIME') {
        return field.string();
      }
      return next();
    },
  },
  logging: false // set true untuk melihat SQL queries
};