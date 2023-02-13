import { Sequelize } from 'sequelize';



let db: Sequelize;

// LOCAL
try {
    db = new Sequelize('Countries', 'admin', 'admin', {
        host: 'localhost',
        dialect: 'postgres',
    });
 } catch (error) {
     throw new Error("No se pudo conectar con la base de datos")
 }

// PRODUCTION
/*try {
    db = new Sequelize('railway', 'postgres', 'K4bKPagGIjAVGQ5TOZby', {
         host: 'containers-us-west-164.railway.app',
         dialect: 'postgres',
         port: 7068
     });
} catch (error) {
    throw new Error("No se pudo conectar con la base de datos")
}
*/



/*
 try {
     db = new Sequelize('Countries', 'postgres', 'admin', {
         host: 'localhost',
         dialect: 'postgres',
     });
 } catch (error) {
     throw new Error("No se pudo conectar con la base de datos")
 }
*/
export default db;
/*
db = new Sequelize('Countries', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
});
*/