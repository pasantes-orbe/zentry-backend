"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
let db;
// LOCAL
try {
    db = new sequelize_1.Sequelize('Countries', 'admin', 'admin', {
        host: 'localhost',
        dialect: 'postgres',
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
//# sourceMappingURL=connection.js.map