import express, { Application } from "express";
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
        notifications: '/api/notifications'

    }

    private constructor() {
        this.app = express();
        this.port = process.env.PORT || "3000";
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server,{
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
        return this._instance || ( this._instance = new this() ) ;
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
            useTempFiles : true,
            tempFileDir : '/tmp/'
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
        this.app.use(this.apiPaths.notifications, notificationRoutes)

    }

    sockets(){
        const controller = new SocketController();

        this.io.on("connection", (socket: Socket) => {
            console.log('Conectado' , socket.id); 
            controller.propietarioConectado(socket)
            controller.disconnect(socket);
            controller.notificarCheckIn(socket);
            controller.escucharAntipanico(socket);
            controller.escucharNuevoConfirmedByOwner(socket)
            controller.escucharAntipanicoFinalizado(socket)
            controller.escucharNuevaPosicionGuardia(socket)
            controller.escucharGuardDisconnected(socket)
          });
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log("Servidor corriendo", this.port);
        })
    }

}

export default Server;