import { Socket } from "socket.io/dist/socket";

class SocketController{

    public mensaje( client: Socket ){

        client.on('mensaje', (payload) => {
            console.log("Mensaje recibido", payload);
        })

    }

    public disconnect( client: Socket ){

        client.on('disconnect', () => {
            console.log('Desconectado', client.id);
        })

    }

}


export default SocketController