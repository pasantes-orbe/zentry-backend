import dotenv from "dotenv";
import Server from "./models/server";

require('./models/associations');
// Config .env
dotenv.config({
    path: "./.env"
});

const server = Server.instance;
server.listen();

