import dotenv from "dotenv";
import Server from "./models/server";

require('./models/associations');
// Config .env
dotenv.config();

const server = new Server();
server.listen();

