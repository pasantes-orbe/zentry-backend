"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./models/server"));
// Config .env
dotenv_1.default.config({
    path: "./.env"
});
console.log(process.env.TZ);
require('./models/associations');
const server = server_1.default.instance;
server.listen();
//# sourceMappingURL=app.js.map