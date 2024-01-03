import { Sequelize } from 'sequelize';



let db: Sequelize;



    // // LOCAL
    // try {
    //     db = new Sequelize('postgres', 'admindb', 'bu38kuZUpa', {
    //         host: 'localhost',
    //         dialect: 'postgres',
    //         dialectOptions: {
    //             useUTC: false, // -->Add this line. for reading from database
    //         },
    //         timezone: "+05:30"
    //     });
    // } catch (error) {
    //     throw new Error("No se pudo conectar con la base de datos")
    // }

// PRODUCTION ORBE COUNTRIES
try {
    db = new Sequelize('railway', 'postgres', 'dFAE11e-21451Age5AeFgF6612Gba3cF', {
         host: 'viaduct.proxy.rlwy.net',
         dialect: 'postgres',
         port: 35230 
     });
} catch (error) {
    throw new Error("No se pudo conectar con la base de datos")
}




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


// db = new Sequelize('postgres', 'admindb', 'bu38kuZUpa', {
//     host: 'localhost',
//     dialect: 'postgres',
//     dialectOptions: {
//         useUTC: false, // -->Add this line. for reading from database
//     },
//     timezone: "+05:30"
// });