"use strict";
//import { Sequelize } from 'sequelize';
//let db: Sequelize;
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// PRODUCTION ORBE COUNTRIES
/*try {
    db = new Sequelize('railway', 'postgres', 'dFAE11e-21451Age5AeFgF6612Gba3cF', {
         host: 'viaduct.proxy.rlwy.net',
         dialect: 'postgres',
         port: 35230
     });
} catch (error) {
    throw new Error("No se pudo conectar con la base de datos")
}*/
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
//export default db;  
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
const sequelize_1 = require("sequelize");
const db = new sequelize_1.Sequelize('countryapp', 'postgres', '12345', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
});
// Función para probar conexión y mostrar errores concretos
function conectarDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.authenticate();
            console.log('Conexión a la base de datos exitosa');
        }
        catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            process.exit(1); // Termina el proceso si no se conecta
        }
    });
}
conectarDB();
exports.default = db;
//# sourceMappingURL=connection.js.map