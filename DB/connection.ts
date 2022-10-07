import { Sequelize } from 'sequelize';

// LOCAL
const db = new Sequelize('Countries', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
});

// PRODUCTION
// const db = new Sequelize('qegbbqka', 'qegbbqka', 's0BlHlZEfD1gPRUqxtAc1IMMVFkxTGMy', {
//     host: 'kesavan.db.elephantsql.com',
//     dialect: 'postgres',
// });

export default db;