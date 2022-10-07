"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// LOCAL
const db = new sequelize_1.Sequelize('Countries', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
});
// PRODUCTION
// const db = new Sequelize('qegbbqka', 'qegbbqka', 's0BlHlZEfD1gPRUqxtAc1IMMVFkxTGMy', {
//     host: 'kesavan.db.elephantsql.com',
//     dialect: 'postgres',
// });
exports.default = db;
//# sourceMappingURL=connection.js.map