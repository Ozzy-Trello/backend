import { Sequelize } from 'sequelize';
import { Config } from '@/config';

export default new Sequelize({
    dialect: 'postgres', // atau 'mysql', 'sqlite', 'mariadb'
    host: Config.DB_HOST,
    port: Config.DB_PORT,
    username: Config.DB_USER,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // logging: false // set true untuk melihat SQL queries
    logging: console.log
});