import express, { Application } from "express";
import cors from "cors";

import userRoutes from "../routes/user.routes";
import roleRoutes from "../routes/role.routes";
import propertyRoutes from "../routes/property.routes";
import recurrentRoutes from "../routes/recurrent.routes";
import countriesRoutes from "../routes/country.routes";
import authRoutes from "../routes/auth.routes";
import amenityRoutes from "../routes/amenity.routes";
import db from "../DB/connection";

import fileUpload from "express-fileupload";

class Server {

    private app: Application;
    private port: string;
    private apiPaths = {
        users: '/api/users',
        roles: '/api/roles',
        properties: '/api/properties',
        recurrents: '/api/recurrents',
        auth: '/api/auth',
        countries: '/api/countries',
        amenities: '/api/amenities'
    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "3000";


        // App routes
        this.dbConnection();
        this.middlewares();
        this.sync();
        this.routes();


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
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo", this.port);
        })
    }

}

export default Server;