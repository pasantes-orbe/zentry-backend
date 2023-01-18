import { Socket } from "socket.io/dist/socket";

class SocketController{

    public notificarCheckIn( client: Socket ){

        client.on('notificar-check-in', (payload) => {
            console.log("Mensaje recibido", payload);       // recibo el check-in creado, el cual debo pasar al usuario propietario
            
            client.broadcast.emit('notificacion-check-in', payload)

        })

    }

    public escucharAntipanico(client: Socket){

        client.on('notificar-antipanico', (payload) => {

            const {res, ownerName, ownerLastName} = payload

                const address = res['antipanic']['address'];
                const id = res['antipanic']['id']
            const antipanicAdvice = {
                ownerName,
                ownerLastName,
                address,
                id
            }

            console.log(antipanicAdvice)
            
            client.broadcast.emit('notificacion-antipanico', antipanicAdvice)


        })
    }

    public escucharAntipanicoFinalizado(client: Socket){

        client.on('notificar-antipanico-finalizado', (payload) => {

            console.log(payload)
            console.log("Hola Mundo")
            
            
            client.broadcast.emit('notificacion-antipanico-finalizado', 
                payload,
             )


        })
    }

    
    public escucharNuevoConfirmedByOwner(client: Socket){

        client.on('notificar-nuevo-confirmedByOwner', (payload) => {

            console.log(payload)

            
            
            client.broadcast.emit('notificacion-nuevo-confirmedByOwner', 
                payload,
             )


        })
    }

    
    


    public disconnect( client: Socket ){

        client.on('disconnect', () => {
            console.log('Desconectado', client.id);
        })

    }

}


export default SocketController