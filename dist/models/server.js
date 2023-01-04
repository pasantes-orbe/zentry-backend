"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const role_routes_1 = __importDefault(require("../routes/role.routes"));
const property_routes_1 = __importDefault(require("../routes/property.routes"));
const recurrent_routes_1 = __importDefault(require("../routes/recurrent.routes"));
const country_routes_1 = __importDefault(require("../routes/country.routes"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const amenity_routes_1 = __importDefault(require("../routes/amenity.routes"));
const owner_routes_1 = __importDefault(require("../routes/owner.routes"));
const reservation_routes_1 = __importDefault(require("../routes/reservation.routes"));
const guard_routes_1 = __importDefault(require("../routes/guard.routes"));
const checkin_routes_1 = __importDefault(require("../routes/checkin.routes"));
const checkout_routes_1 = __importDefault(require("../routes/checkout.routes"));
const connection_1 = __importDefault(require("../DB/connection"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
class Server {
    constructor() {
        this.apiPaths = {
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
            checkout: '/api/checkout'
        };
        this.app = (0, express_1.default)();
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
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.default.sync({ alter: true });
        });
    }
    dbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.default.authenticate();
                console.log("Database Online");
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    middlewares() {
        // Cors
        const corsOptions = {
            credentials: true,
            origin: '*'
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use(express_1.default.json());
        this.app.use((0, express_fileupload_1.default)({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }
    routes() {
        this.app.use(this.apiPaths.users, user_routes_1.default);
        this.app.use(this.apiPaths.roles, role_routes_1.default);
        this.app.use(this.apiPaths.properties, property_routes_1.default);
        this.app.use(this.apiPaths.recurrents, recurrent_routes_1.default);
        this.app.use(this.apiPaths.auth, auth_routes_1.default);
        this.app.use(this.apiPaths.countries, country_routes_1.default);
        this.app.use(this.apiPaths.amenities, amenity_routes_1.default);
        this.app.use(this.apiPaths.owners, owner_routes_1.default);
        this.app.use(this.apiPaths.reservations, reservation_routes_1.default);
        this.app.use(this.apiPaths.guards, guard_routes_1.default);
        this.app.use(this.apiPaths.checkin, checkin_routes_1.default);
        this.app.use(this.apiPaths.checkout, checkout_routes_1.default);
    }
    sockets() {
        this.io.on("connection", (socket) => {
            console.log('Conectado', socket.id); // x8WIv7-mJelg7on_ALbx
            socket.on('disconnect', () => {
                console.log('Desconectado', socket.id);
            });
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log("Servidor corriendo", this.port);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map