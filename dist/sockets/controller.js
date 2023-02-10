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
const GuardsUbicationControl_1 = __importDefault(require("../classes/GuardsUbicationControl"));
const Notifications_1 = __importDefault(require("../classes/Notifications"));
const OwnersConnectedControl_1 = __importDefault(require("../classes/OwnersConnectedControl"));
const user_model_1 = __importDefault(require("../models/user.model"));
class SocketController {
    constructor() {
        this.guardsUbication = new GuardsUbicationControl_1.default();
        this.ownerControl = new OwnersConnectedControl_1.default();
        this.notifications = new Notifications_1.default();
    }
    notificarCheckIn(client) {
        client.on('notificar-check-in', (payload) => __awaiter(this, void 0, void 0, function* () {
            console.log("Mensaje recibido", payload);
            console.log("OWNER ID DESDE EL PAYLOAD", payload['id_owner']);
            // recibo el check-in creado, el cual debo pasar al usuario propietario
            const id_owner = payload['id_owner']; // con el id_owner envio la notificacion
            const guest_name = payload['guest_name']; // con el id_owner envio la notificacion
            const guest_lastname = payload['guest_lastname']; // con el id_owner envio la notificacion
            const dni = payload['DNI']; // con el id_owner envio la notificacion
            const user = yield user_model_1.default.findByPk(id_owner);
            console.log("ESTE ES EL ID QUE SE PASA AL CREAR EL CHECKIN", id_owner);
            this.notifications.notifyAExternal_User_By_ID(String(id_owner), `Tienes un nuevo Check-in para Autorizar: ${guest_name} ${guest_lastname} - DNI: ${dni}`, `${user.name}`, 'Nueva Solicitud de Check-in');
            const owner = this.ownerControl.getownersByUserId(id_owner);
            if (owner) {
                client.to(owner.id_socket).emit('notificacion-check-in', payload);
            }
            else {
                return;
            }
        }));
    }
    escucharAntipanico(client) {
        client.on('notificar-antipanico', (payload) => {
            const { res, ownerName, ownerLastName } = payload;
            const address = res['antipanic']['address'];
            const id = res['antipanic']['id'];
            const id_country = res['antipanic']['id_country'];
            this.notifications.notifyAllGuards(String(id_country), `Antipanico activado por ${ownerName} ${ownerLastName} de direccion ${address}`, 'Antipanico Activado', 'Antipanico');
            const antipanicAdvice = {
                ownerName,
                ownerLastName,
                address,
                id
            };
            console.log(antipanicAdvice);
            client.broadcast.emit('notificacion-antipanico', antipanicAdvice);
        });
    }
    escucharAntipanicoFinalizado(client) {
        client.on('notificar-antipanico-finalizado', (payload) => {
            console.log(payload);
            const owner = this.ownerControl.getownersByUserId(payload['antipanic']['ownerId']);
            console.log("Este es el id del socket", owner.id_socket);
            if (owner) {
                console.log("ESTE ES EL PAYLOD", payload);
                client.to(owner.id_socket).emit('notificacion-antipanico-finalizado', payload);
            }
            else {
                return;
            }
        });
    }
    escucharNuevoConfirmedByOwner(client) {
        client.on('notificar-nuevo-confirmedByOwner', (payload) => __awaiter(this, void 0, void 0, function* () {
            console.log("Estos son los datos enviados", payload);
            const id_owner = payload['id_owner'];
            const id_country = payload['id_country'];
            const guest_name = payload['guest_name'];
            const guest_lastname = payload['guest_lastname']; // con el id_owner envio la notificacion
            const dni = payload['DNI'];
            const owner = yield user_model_1.default.findByPk(payload['id_owner']);
            if (payload['check_out'] == true) {
                yield this.notifications.notifyAExternal_User_By_ID(String(id_owner), `El Vigilador confirmó la salida de ${guest_name} ${guest_lastname} - ${dni}`, `${owner.name}`, 'Nuevo Check-out');
            }
            else if (payload['confirmed_by_owner'] == false) {
                yield this.notifications.notifyAllGuards(id_country, `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} se actualizó a denegado por el propietario`, `Vigiladores`, `Rechazo de Propietario`);
            }
            else if (payload['confirmed_by_owner'] == true && payload['check_in'] == false) {
                yield this.notifications.notifyAllGuards(id_country, `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} ya fue autorizado por el propietario correspondiente`, `Vigiladores`, `Nueva Confirmacion del Propietario`);
            }
            else if (payload['confirmed_by_owner'] == true && payload['check_in'] == true) {
                yield this.notifications.notifyAExternal_User_By_ID(String(id_owner), `El Vigilador confirmó la entrada de ${guest_name} ${guest_lastname} - ${dni}`, `${owner.name}`, 'Nuevo Check-in');
            }
            client.broadcast.emit('notificacion-nuevo-confirmedByOwner', payload);
        }));
    }
    propietarioConectado(client) {
        client.on('owner-connected', (payload) => {
            console.log(payload);
            console.log("SOCKET DESDE EL CUAL SE CONECTO --------------------------------------------------------");
            console.log(client.id);
            this.ownerControl.addowner(payload, client.id);
            const allOwners = this.ownerControl.getowners();
        });
    }
    escucharNuevaPosicionGuardia(client) {
        client.on('nueva-posicion-guardia', (payload) => {
            const { lat, lng, id_user, id_country, user_name, user_lastname } = payload;
            console.log(lat, lng, id_user, id_country, user_name, user_lastname);
            this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname);
            const allGuards = this.guardsUbication.getGuards();
            client.broadcast.emit('get-actives-guards', allGuards);
        });
    }
    escucharOwnerDisconnected(client) {
        client.on('disconnect-owner', (payload) => {
            console.log(payload);
            this.ownerControl.deleteowner(payload);
        });
    }
    escucharGuardDisconnected(client) {
        client.on('disconnectGuardUbication', (payload) => {
            console.log(payload);
            this.guardsUbication.deleteGuard(payload);
            client.broadcast.emit('guardDisconnected', {});
        });
    }
    notifiyOwner() {
    }
    disconnect(client) {
        client.on('disconnect', () => {
            console.log('Desconectado', client.id);
        });
    }
}
exports.default = SocketController;
//# sourceMappingURL=controller.js.map