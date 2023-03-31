"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
let db;
console.log(process.env.PORT);
// LOCAL
try {
    db = new sequelize_1.Sequelize('postgres', 'admindb', 'bu38kuZUpa', {
        host: 'localhost',
        dialect: 'postgres',
        dialectOptions: {
            useUTC: false, // -->Add this line. for reading from database
        },
        timezone: "+05:30"
    });
}
catch (error) {
    throw new Error("No se pudo conectar con la base de datos");
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
exports.default = db;
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
//# sourceMappingURL=connection.js.map