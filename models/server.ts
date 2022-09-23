import express, { Application } from "express";
import cors from "cors";

import userRoutes from "../routes/user.routes";
import roleRoutes from "../routes/role.routes";
import db from "../DB/connection";

class Server{

    private app: Application;
    private port: string;
    private apiPaths = {
        users: '/api/users',
        roles: '/api/roles'
    }

    constructor(){
        this.app    = express();
        this.port   = process.env.PORT || "3000";

        
        // App routes
        this.dbConnection();
        this.middlewares();
        this.sync();
        this.routes();
        

    }

    async sync(){
        await db.sync({alter: true});
    }

    async dbConnection(){

        try {
            await db.authenticate();
            console.log("Database Online");
        } catch (error: any) {
            throw new Error( error );
        }

    }

    middlewares() {
        // Cors
        this.app.use( cors() );

        this.app.use( express.json() );
    }

    routes(){
        this.app.use( this.apiPaths.users, userRoutes );
        this.app.use( this.apiPaths.roles, roleRoutes );
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log("Servidor corriendo", this.port);
        } )
    }

}

export default Server;