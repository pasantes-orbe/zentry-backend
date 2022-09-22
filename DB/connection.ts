import { Sequelize } from 'sequelize';

const db = new Sequelize('Countries', 'postgres', '', {
    host: 'localhost',
    dialect: 'postgres',
});

export default db;