import { Sequelize } from 'sequelize';



let db: Sequelize;

// LOCAL
// try {
//     db = new Sequelize('Countries', 'postgres', 'admin', {
//         host: 'localhost',
//         dialect: 'postgres',
//     });
// } catch (error) {
//     throw new Error("No se pudo conectar con la base de datos")
// }

// PRODUCTION
try {
    db = new Sequelize('qegbbqka', 'qegbbqka', 's0BlHlZEfD1gPRUqxtAc1IMMVFkxTGMy', {
        host: 'kesavan.db.elephantsql.com',
        dialect: 'postgres',
    });
} catch (error) {
    throw new Error("No se pudo conectar con la base de datos")
}


export default db;