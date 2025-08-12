//import dotenv from "dotenv";
//import Server from "./models/server";

// Config .env
//dotenv.config({
//    path: "./.env"
//});
//console.log(process.env.TZ);

//require('./models/associations');


//const server = Server.instance;
//server.startServer(); 



//app.ts
import dotenv from "dotenv";
import Server from "./models/server";

// Configurar dotenv para cargar las variables de entorno desde el archivo .env
dotenv.config({
    path: "./.env"
});

// Puedes dejar el console.log si te es útil para depurar la zona horaria
console.log(process.env.TZ);

// *** ¡CAMBIO AQUÍ! ***
// Importar el objeto 'db' que ahora contiene:
// 1. La instancia de Sequelize (db.sequelize)
// 2. Todos tus modelos inicializados (db.User, db.Role, etc.)
// 3. Las asociaciones YA configuradas entre ellos (porque models/index.js las ejecutó)
const db = require('./models'); // Usamos 'require' porque models/index.js usa 'module.exports'

const server = Server.instance; // Esto inicializa tu servidor Express

// *** ¡CAMBIO CRUCIAL: Sincronización de la base de datos! ***
// Esto es lo que va a crear o actualizar tus tablas en PostgreSQL.
// db.sequelize.sync({ force: true }) hará que cada vez que inicies la app,
// borre las tablas existentes y las cree de nuevo con la definición de tus modelos.
// ¡Usa { force: true } solo en desarrollo! En producción, podrías perder datos.
db.sequelize.sync({ force: true })
  .then(() => {
    console.log('¡Base de datos sincronizada correctamente! Todas las tablas deberían estar ahí.');
    // Si la sincronización es exitosa, entonces iniciamos el servidor Express.
    server.startServer();
  })
  .catch((err: Error) => {
    console.error('Error al sincronizar la base de datos:', err);
    // Si hay un error crítico al sincronizar la DB, lo mejor es salir de la aplicación.
    process.exit(1); 
  });