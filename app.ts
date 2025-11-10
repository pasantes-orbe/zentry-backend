// src/app.ts (o app.ts si estás en raíz)
import 'dotenv/config';
import 'reflect-metadata';
import Server from './server';
import db from './models';

console.log('Zona horaria configurada:', process.env.TZ || '(no definida)');

(async () => {
  try {
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      await db.sequelize.sync({ alter: true });
    } else {
      await db.sequelize.sync();
    }
    console.log('¡Base de datos sincronizada correctamente! Todas las tablas deberían estar ahí.');

    const server = Server.instance;
    server.startServer();
  } catch (err) {
    console.error('Error al sincronizar la base de datos:', err);
    process.exit(1);
  }
})();
