import dotenv from "dotenv";
import Server from "./models/server";

// Config .env
dotenv.config({
    path: "./.env"
});
console.log(process.env.TZ);

require('./models/associations');


const server = Server.instance;
server.listen();

