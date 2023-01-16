"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketController {
    notificarCheckIn(client) {
        client.on('notificar-check-in', (payload) => {
            console.log("Mensaje recibido", payload); // recibo el check-in creado, el cual debo pasar al usuario propietario
            client.broadcast.emit('notificacion-check-in', payload);
        });
    }
    escucharAntipanico(client) {
        client.on('notificar-antipanico', (payload) => {
            const { res, ownerName, ownerLastName } = payload;
            const address = res['antipanic']['address'];
            const antipanicAdvice = {
                ownerName,
                ownerLastName,
                address
            };
            console.log(antipanicAdvice);
            client.broadcast.emit('notificacion-antipanico', antipanicAdvice);
        });
    }
    escucharNuevoConfirmedByOwner(client) {
        client.on('notificar-nuevo-confirmedByOwner', (payload) => {
            console.log(payload);
            client.broadcast.emit('notificacion-nuevo-confirmedByOwner', payload);
        });
    }
    disconnect(client) {
        client.on('disconnect', () => {
            console.log('Desconectado', client.id);
        });
    }
}
exports.default = SocketController;
//# sourceMappingURL=controller.js.map