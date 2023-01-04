"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketController {
    mensaje(client) {
        client.on('mensaje', (payload) => {
            console.log("Mensaje recibido", payload);
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