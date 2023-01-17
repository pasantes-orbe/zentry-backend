"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
let db;
// LOCAL
try {
    db = new sequelize_1.Sequelize('Countries', 'postgres', 'admin', {
        host: 'localhost',
        dialect: 'postgres',
    });
}
catch (error) {
    throw new Error("No se pudo conectar con la base de datos");
}
// PRODUCTION
/*try {
    db = new Sequelize('qegbbqka', 'qegbbqka', 's0BlHlZEfD1gPRUqxtAc1IMMVFkxTGMy', {
        host: 'kesavan.db.elephantsql.com',
        dialect: 'postgres',
    });
} catch (error) {
    throw new Error("No se pudo conectar con la base de datos")
}
*/
exports.default = db;
//# sourceMappingURL=connection.js.map