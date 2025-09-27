/*import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import roleRoutes from "../routes/role.routes";
import propertyRoutes from "../routes/property.routes";
import recurrentRoutes from "../routes/recurrent.routes";
import countriesRoutes from "../routes/country.routes";
import authRoutes from "../routes/auth.routes";
import amenityRoutes from "../routes/amenity.routes";
import ownersRoutes from "../routes/owner.routes";
import reservationRoutes from "../routes/reservation.routes";
import guardRoutes from "../routes/guard.routes";
import checkIn from "../routes/checkin.routes";
import checkOut from "../routes/checkout.routes";
import antipanic from "../routes/antipanic.routes";
import pushNotifications from "../routes/push_notifications.routes";
import notificationRoutes from "../routes/notification.routes";
import invitationRoutes from "../routes/invitations.routes";
import db from "../DB/connection";
import fileUpload from "express-fileupload";
import { Socket } from "socket.io";
import SocketController from "../sockets/controller";

class Server {
    private static _instance: Server;
    private server: any;
    public io: any;
    private app: Application;
    private port: string;
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
        push_notifications: '/api/notifications',
        notifications: '/api/notifications',
        invitation: '/api/invitation'
    }

    private constructor() {
        this.app = express();
        this.port = process.env.PORT || "3000";
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
            }
        });
        // App routes
        this.dbConnection();
        this.middlewares();
        this.sync();
        this.routes();
        this.sockets();
    }
    public static get instance(): Server {
        return this._instance || (this._instance = new this());
    }
    async sync() {
        await db.sync({ alter: true });
    }
    async dbConnection() {
        try {
            await db.authenticate();
            console.log("Database Online");
        } catch (error: any) {
            throw new Error(error);
        }
    }
    middlewares() {
        // Cors
        const corsOptions = {
            credentials: true,
            origin: '*'
        }
        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }

    routes() {
        this.app.use(this.apiPaths.users, userRoutes);
        this.app.use(this.apiPaths.roles, roleRoutes);
        this.app.use(this.apiPaths.properties, propertyRoutes);
        this.app.use(this.apiPaths.recurrents, recurrentRoutes);
        this.app.use(this.apiPaths.auth, authRoutes);
        this.app.use(this.apiPaths.countries, countriesRoutes);
        this.app.use(this.apiPaths.amenities, amenityRoutes);
        this.app.use(this.apiPaths.owners, ownersRoutes);
        this.app.use(this.apiPaths.reservations, reservationRoutes);
        this.app.use(this.apiPaths.guards, guardRoutes);
        this.app.use(this.apiPaths.checkin, checkIn);
        this.app.use(this.apiPaths.checkout, checkOut);
        this.app.use(this.apiPaths.antipanic, antipanic);
        this.app.use(this.apiPaths.push_notifications, pushNotifications);
        this.app.use(this.apiPaths.notifications, notificationRoutes);
        this.app.use(this.apiPaths.invitation, invitationRoutes);

    }

    sockets() {
        const controller = new SocketController();
        this.io.on("connection", (socket: Socket) => {
            console.log('Conectado', socket.id);
            controller.propietarioConectado(socket)
            controller.notificarCheckIn(socket);
            controller.escucharAntipanico(socket);
            controller.escucharNuevoConfirmedByOwner(socket)
            controller.escucharAntipanicoFinalizado(socket)
            controller.escucharNuevaPosicionGuardia(socket)
            controller.escucharGuardDisconnected(socket)
            // controller.disconnect(socket);
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log("Servidor corriendo", this.port);
        })
    }
}

export default Server;*/

//models/server.ts
import express, { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import fileUpload from "express-fileupload";

import userRoutes from "../routes/user.routes";
import roleRoutes from "../routes/role.routes";
import propertyRoutes from "../routes/property.routes";
import recurrentRoutes from "../routes/recurrent.routes";
import countriesRoutes from "../routes/country.routes";
import authRoutes from "../routes/auth.routes";
import amenityRoutes from "../routes/amenity.routes";
import ownersRoutes from "../routes/owner.routes";
import reservationRoutes from "../routes/reservation.routes";
import guardRoutes from "../routes/guard.routes";
import checkIn from "../routes/checkin.routes";
import checkOut from "../routes/checkout.routes";
import antipanic from "../routes/antipanic.routes";
import pushNotifications from "../routes/push_notifications.routes";
import notificationRoutes from "../routes/notification.routes";
import invitationRoutes from "../routes/invitations.routes";
import userPropertiesRoutes from "../routes/user_properties.routes";

import { authenticateDb } from "../DB/connection";
import { getDbInstance } from "../DB/connection";

const db = getDbInstance();
const dbModels = require('./index') as any;

import SocketController from "../sockets/controller";

class Server {
    private static _instance: Server;
    private server: HTTPServer;
    public io: SocketIOServer;
    private app: Application;
    private port: number;

    private apiPaths = {
        users: "/api/users",
        roles: "/api/roles",
        properties: "/api/properties",
        recurrents: "/api/recurrents",
        auth: "/api/auth",
        countries: "/api/countries",
        amenities: "/api/amenities",
        owners: "/api/owners",
        reservations: "/api/reservations",
        guards: "/api/guards",
        checkin: "/api/checkin",
        checkout: "/api/checkout",
        antipanic: "/api/antipanic",
        user_properties: "/api/user-properties",
        push_notifications: "/api/notifications",
        notifications: "/api/notifications",
        invitation: "/api/invitation",
    };

    private constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;

        this.server = createServer(this.app);

        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*",
            },
        });

        this.middlewares();
        this.routes();
        this.sockets();
        //this.startServer();
    }

    public static get instance(): Server {
        return this._instance || (this._instance = new this());
    }

    //Conexion al servidor localhost:4200, lo que hay que tener en cuenta es que el puerto del front y del back son diferentes.
    //ademas hay que cambiar cuando se suba a produccion.
    middlewares() {
        const corsOptions = {
            credentials: true,
            origin: ["http://localhost:4200","http://localhost:8100"], //esto hay que cambiarlo cuando se suba a produccion.
            //Especifico para mi front que esta en el puerto 4200
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        };
        this.app.use(cors(corsOptions));
        // this.app.use(express.json()); // 🛑 ORIGINAL COMENTADO: Causa conflicto con la carga de archivos al ejecutarse primero.
        
        // ✅ CORRECCIÓN 1: fileUpload debe ir PRIMERO para procesar la data 'multipart/form-data' y el archivo.
        this.app.use(
            fileUpload({
                useTempFiles: true,
                tempFileDir: "/tmp/",
                // Opcional, pero se añade un límite para prevenir el error 'Unexpected end of form' por archivos grandes.
                limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
            })
        );

        // ✅ CORRECCIÓN 2: express.json() se ejecuta AHORA.
        this.app.use(express.json());
        
        // this.app.use( // 🛑 ORIGINAL COMENTADO: El fileUpload se ha movido arriba y se le han añadido los límites.
        //     fileUpload({
        //         useTempFiles: true,
        //         tempFileDir: "/tmp/",
        //     })
        // );
    }

    routes() {
        this.app.use(this.apiPaths.users, userRoutes);
        this.app.use(this.apiPaths.roles, roleRoutes);
        this.app.use(this.apiPaths.properties, propertyRoutes);
        this.app.use(this.apiPaths.recurrents, recurrentRoutes);
        
        console.log('🔧 Registrando rutas...');
        console.log('Auth route path:', this.apiPaths.auth); // Debe mostrar: /api/auth
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
        this.app.use(this.apiPaths.push_notifications, pushNotifications);
        this.app.use(this.apiPaths.notifications, notificationRoutes);
        this.app.use(this.apiPaths.invitation, invitationRoutes);
    }

    sockets() {
        const controller = new SocketController();

        this.io.on("connection", (socket: Socket) => {
            console.log("Conectado", socket.id);
            controller.propietarioConectado(socket);
            controller.notificarCheckIn(socket);
            controller.escucharAntipanico(socket);
            controller.escucharNuevoConfirmedByOwner(socket);
            controller.escucharAntipanicoFinalizado(socket);
            controller.escucharNuevaPosicionGuardia(socket);
            controller.escucharGuardDisconnected(socket);
        });
    }

    async startServer() {
        try {
            await authenticateDb();
            console.log('Database Online: Autenticación exitosa.');

            

            // Sincronización de tablas MANUAL
            //await dbModels.role.sync({ force: true });
            //console.log('Tabla "role" sincronizada.');
            //await dbModels.country.sync({ force: true });
            //console.log('Tabla "country" sincronizada.');
            //await dbModels.property.sync({ force: true });
            //console.log('Tabla "property" sincronizada.');
            //await dbModels.amenity.sync({ force: true });
            //console.log('Tabla "amenity" sincronizada.');
            //await dbModels.user.sync({ force: true });
            //console.log('Tabla "user" sincronizada.');
            //await dbModels.owner_country.sync({ force: true });
            //console.log('Tabla "owner_country" sincronizada.');
            //await dbModels.guard_country.sync({ force: true });
            //console.log('Tabla "guard_country" sincronizada.');
            //await dbModels.user_properties.sync({ force: true });
            //console.log('Tabla "user_properties" sincronizada.');
            //await dbModels.guard_schedule.sync({ force: true });
            //console.log('Tabla "guard_schedule" sincronizada.');
            //await dbModels.antipanic.sync({ force: true });
            //console.log('Tabla "antipanic" sincronizada.');
            //await dbModels.reservation.sync({ force: true });
            //console.log('Tabla "reservation" sincronizada.');
            //await dbModels.password_change_request.sync({ force: true }); 
            //console.log('Tabla "password_change_request" sincronizada.');
            //await dbModels.notification.sync({ force: true });
            //console.log('Tabla "notification" sincronizada.');
            //await dbModels.invitation.sync({ force: true });
            //console.log('Tabla "invitation" sincronizada.'); 
            //await dbModels.appid.sync({ force: true });
            //console.log('Tabla "appid" sincronizada.');
            //await dbModels.recurrent.sync({ force: true });
            //console.log('Tabla "recurrent" sincronizada.');
            //await dbModels.checkin.sync({ force: true });
            //console.log('Tabla "checkin" sincronizada.');
            //await dbModels.checkout.sync({ force: true });
            //console.log('Tabla "checkout" sincronizada.');


            this.server.listen(this.port, () => {
                console.log(`Servidor corriendo en http://localhost:${this.port}`);
            });
        } catch (error) {
            console.error("Error al sincronizar la base de datos:", error);
            process.exit(1);
        }
    }
}

export default Server;