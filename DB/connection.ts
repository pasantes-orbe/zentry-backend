import { Sequelize } from 'sequelize';

const db = new Sequelize('Countries', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
});

export default db;