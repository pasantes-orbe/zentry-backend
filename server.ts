// server.ts
import 'dotenv/config'; // 1) variables de entorno
import './config/cloudinary'; // 2) configura Cloudinary una sola vez

import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import os from 'os';

import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import propertyRoutes from './routes/property.routes';
import recurrentRoutes from './routes/recurrent.routes';
import countriesRoutes from './routes/country.routes';
import authRoutes from './routes/auth.routes';
import amenityRoutes from './routes/amenity.routes';
import ownersRoutes from './routes/owner.routes';
import reservationRoutes from './routes/reservation.routes';
import guardRoutes from './routes/guard.routes';
import checkIn from './routes/checkin.routes';
import checkOut from './routes/checkout.routes';
import antipanic from './routes/antipanic.routes';
import pushNotifications from './routes/push_notifications.routes';
import notificationRoutes from './routes/notification.routes';
import invitationRoutes from './routes/invitations.routes';
import userPropertiesRoutes from './routes/user_properties.routes';

import SocketController from './sockets/controller';
import db from './models'; // index.ts exporta { sequelize, ...modelos }

class Server {
  private static _instance: Server;
  private server: HTTPServer;
  public io: SocketIOServer;
  private app: Application;
  private port: number;

  private apiPaths = {
    users: '/api/users',
    roles: '/api/roles',
    properties: '/api/properties',
    recurrents: '/api/recurrents',
    auth: '/api/auth',
    countries: '/api/countries',
    amenities: '/api/amenities',
    owners: '/api/owners',
    reservations: '/api/reservations',
    guards: '/api/guards',
    checkin: '/api/checkin',
    checkout: '/api/checkout',
    antipanic: '/api/antipanic',
    user_properties: '/api/user-properties',
    // OJO: ambos apuntan a /api/notifications (si querés separarlos, cambiá uno)
    push_notifications: '/api/notifications',
    notifications: '/api/notifications',
    invitation: '/api/invitation',
  };

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;

    // Para Render/Proxies
    this.app.set('trust proxy', 1);

    this.server = createServer(this.app);

    this.io = new SocketIOServer(this.server, {
      cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] },
    });

    this.middlewares();
    this.routes();
    this.sockets();

    // Nota: iniciás el server desde app.ts con:
    // await Server.instance.startServer();
  }

  public static get instance(): Server {
    return this._instance || (this._instance = new this());
  }

  private middlewares() {
    // CORS por ambiente
    const localOrigins = ['http://localhost:4200', 'http://localhost:8100'];
    const envOrigins = [
      process.env.FRONTEND_BASE_URL,
      process.env.FRONTEND_URL,
      process.env.RENDER_EXTERNAL_URL, // Render expone esta para el dominio público del servicio
    ].filter(Boolean) as string[];

    const allowedOrigins = [...localOrigins, ...envOrigins];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Permite herramientas como Postman (sin origin)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          return callback(null, true); // relajar en esta etapa; si querés, cambialo a error
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // fileUpload PRIMERO (para multipart/form-data)
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: os.tmpdir(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      })
    );

    // Parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Healthcheck simple (Render usa esto a veces)
    this.app.get('/', (_req, res) => {
      res.json({
        ok: true,
        service: 'zentry-backend',
        env: process.env.NODE_ENV || 'development',
        time: new Date().toISOString(),
      });
    });
  }

  private routes() {
    this.app.use(this.apiPaths.users, userRoutes);
    this.app.use(this.apiPaths.roles, roleRoutes);
    this.app.use(this.apiPaths.properties, propertyRoutes);
    this.app.use(this.apiPaths.recurrents, recurrentRoutes);

    console.log('🔧 Registrando rutas...');
    console.log('Auth route path:', this.apiPaths.auth);
    this.app.use(this.apiPaths.auth, authRoutes);
    console.log('✅ Ruta auth registrada');

    this.app.use(this.apiPaths.countries, countriesRoutes);
    this.app.use(this.apiPaths.amenities, amenityRoutes);
    this.app.use(this.apiPaths.owners, ownersRoutes);
    this.app.use(this.apiPaths.reservations, reservationRoutes);
    this.app.use(this.apiPaths.guards, guardRoutes);
    this.app.use(this.apiPaths.checkin, checkIn);
    this.app.use(this.apiPaths.checkout, checkOut);
    this.app.use(this.apiPaths.antipanic, antipanic);
    this.app.use(this.apiPaths.user_properties, userPropertiesRoutes);

    // Ambos en /api/notifications: primero push (si tiene endpoints más específicos),
    // luego notifications genéricas para no “pisar” rutas.
    this.app.use(this.apiPaths.push_notifications, pushNotifications);
    this.app.use(this.apiPaths.notifications, notificationRoutes);

    this.app.use(this.apiPaths.invitation, invitationRoutes);
  }

  private sockets() {
    const controller = new SocketController();
    controller.setIO(this.io); // inyectar io

    this.io.on('connection', (socket: Socket) => {
      console.log('Socket conectado:', socket.id);
      controller.propietarioConectado(socket);
      controller.notificarCheckIn(socket);
      controller.escucharAntipanico(socket);
      controller.escucharNuevoConfirmedByOwner(socket);
      controller.escucharAntipanicoFinalizado(socket);
      controller.escucharNuevaPosicionGuardia(socket);
      controller.escucharGuardDisconnected(socket);
      controller.escucharServiceApprovedByGuard(socket);
      controller.escucharServiceApprovedByAdmin(socket);
    });
  }

  public async startServer() {
    try {
      await (db as any).sequelize.authenticate();
      console.log('Database Online: Autenticación exitosa.');

      this.server.listen(this.port, () => {
        console.log(
          `Servidor corriendo en http://localhost:${this.port} (NODE_ENV=${process.env.NODE_ENV || 'development'})`
        );
      });
    } catch (error) {
      console.error('Error al sincronizar la base de datos:', error);
      process.exit(1);
    }
  }
}

export default Server;
