import dotenv from "dotenv";
import Server from "./models/server";

require('./models/associations');
// Config .env
dotenv.config();

const server = Server.instance;
server.listen();

