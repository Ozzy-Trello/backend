const Config = require('@/config').Config;

module.exports = {
  dialect: 'postgres',
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  username: Config.DB_USER,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  logging: false // set true untuk melihat SQL queries
};