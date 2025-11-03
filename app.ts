// src/app.ts (o app.ts si estás en raíz)
import 'dotenv/config';
import 'reflect-metadata';
import Server from './server';
import db from './models';

console.log('Zona horaria configurada:', process.env.TZ || '(no definida)');

(async () => {
  try {
    // En dev podés usar { alter: true }. En prod: sin alter/force.
    await db.sequelize.sync({ alter: true });
    console.log('¡Base de datos sincronizada correctamente! Todas las tablas deberían estar ahí.');

    const server = Server.instance;
    server.startServer();
  } catch (err) {
    console.error('Error al sincronizar la base de datos:', err);
    process.exit(1);
  }
})();
