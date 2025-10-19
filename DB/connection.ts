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

//import { Sequelize } from 'sequelize';
//import Role from '../models/roles.model';
//import User from '../models/user.model';
//import CountryModel from '../models/country.model'; // Asegúrate de que este es el nombre de tu modelo de país
//import GuardCountry from '../models/guard_country.model';
//import UserProperties from '../models/user_properties.model'; // Si existe, si no, bórralo
//import Property from '../models/property.model'; // Si existe, si no, bórralo




// Declaramos la instancia de Sequelize, pero no la inicializamos directamente aquí.
// Usaremos una función para obtenerla, lo que asegura que esté lista cuando se acceda.
//let dbInstance: Sequelize | null = null; 

//const getDbInstance = (): Sequelize => {
    // Si la instancia aún no ha sido creada, la creamos.
//    if (!sequelizeInstance) {
//        sequelizeInstance = new Sequelize('countryapp', 'postgres', '1234', { // Tus credenciales actuales
//            host: 'localhost', 
//            dialect: 'postgres',
//            port: 5432, 
//            logging: false
//        });
//    }
//    return sequelizeInstance;
//};

// Esta función solo se encargará de autenticar la conexión a la base de datos.
// La sincronización de modelos se moverá a 'server.ts' (o donde llames a este servicio).
//const authenticateDb = async () => {
//    const db = getDbInstance(); // Obtenemos la instancia para autenticar
//    try {
//        await db.authenticate();
//        console.log('Conexión a la base de datos exitosa (autenticación).');
//    } catch (error) {
//        console.error('Error al conectar a la base de datos:', error);
//        process.exit(1);
//    }
//};

// Exportamos la función para obtener la instancia y la función de autenticación.
// Ya no exportamos 'db' directamente, ni la función 'connectDB' con lógica de sincronización.
//export { getDbInstance, authenticateDb };


// DB/connection.ts
import { Sequelize } from "sequelize";

// Configuración de la conexión a la base de datos
const dbName = process.env.DB_NAME || 'countryapp';
const dbUser = process.env.DB_USER || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPassword = process.env.DB_PASSWORD || '1235'; //1234

let dbInstance: Sequelize | null = null;

// Función para obtener la instancia única de Sequelize
export function getDbInstance(): Sequelize {
    if (!dbInstance) {
        dbInstance = new Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            dialect: 'postgres',
            logging: false, // Desactiva el logging de las consultas SQL, puedes cambiarlo a true para depurar
        });
    }
    return dbInstance;
}

// Función para autenticar la conexión a la base de datos
export async function authenticateDb(): Promise<void> {
    const db = getDbInstance();
    try {
        await db.authenticate();
        console.log('Conexión a la base de datos exitosa (autenticación).');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        throw error; // Propagar el error para que el servidor no inicie si la DB falla
    }
}