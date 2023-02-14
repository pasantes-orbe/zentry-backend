import axios from "axios";
import { Socket } from "socket.io/dist/socket";
import GuardUbicationControl from "../classes/GuardsUbicationControl";
import Notifications from "../classes/Notifications";
import OwnersConnectedControl from "../classes/OwnersConnectedControl";
import GuardCountry from "../models/guard_country.model";
import User from "../models/user.model";
class SocketController{

    public guardsUbication: GuardUbicationControl = new GuardUbicationControl(); 
    public ownerControl: OwnersConnectedControl = new OwnersConnectedControl();
    public notifications : Notifications = new Notifications();
    

    public notificarCheckIn( client: Socket ){

        client.on('notificar-check-in', async (payload) => {

            console.log("Mensaje recibido", payload);

            console.log("OWNER ID DESDE EL PAYLOAD",payload['id_owner']);
                                                                             // recibo el check-in creado, el cual debo pasar al usuario propietario
            const id_owner = payload['id_owner'];                       // con el id_owner envio la notificacion
            const guest_name = payload['guest_name'];                       // con el id_owner envio la notificacion
            const guest_lastname = payload['guest_lastname'];                       // con el id_owner envio la notificacion
            const dni = payload['DNI'];                       // con el id_owner envio la notificacion

            const user = await User.findByPk(id_owner)
            console.log("ESTE ES EL ID QUE SE PASA AL CREAR EL CHECKIN", id_owner);
            this.notifications.notifyAExternal_User_By_ID(String(id_owner),
                `Tienes un nuevo Check-in para Autorizar: ${guest_name} ${guest_lastname} - DNI: ${dni}`,
                `${user.name}`, 
                'Nueva Solicitud de Check-in')
            

            const owner = this.ownerControl.getownersByUserId(id_owner)

            if(owner){
                client.to(owner.id_socket).emit('notificacion-check-in', payload)
            } else {
                return
            }

        })

    }

    public escucharAntipanico(client: Socket){

        client.on('notificar-antipanico', (payload) => {

         

            const {res, ownerName, ownerLastName} = payload


            const address = res['antipanic']['address'];
            const id = res['antipanic']['id']
            const id_country = res['antipanic']['id_country']

            this.notifications.notifyAllGuards(
                String(id_country),
                `Antipanico activado por ${ownerName} ${ownerLastName} de direccion ${address}`,
                'Antipanico Activado',
                'Antipanico'
            )
            
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
            const owner = this.ownerControl.getownersByUserId(payload['antipanic']['ownerId'])

            console.log("Este es el id del socket", owner.id_socket)
            if(owner){
                console.log("ESTE ES EL PAYLOD", payload)
                client.broadcast.emit('notificacion-antipanico-finalizado', payload);
                client.to(owner.id_socket).emit('notificacion-antipanico-finalizado', payload)
            } else {
                return
            }

        })
    }

    
    public escucharNuevoConfirmedByOwner(client: Socket){

        client.on('notificar-nuevo-confirmedByOwner', async (payload) => {

            console.log("Estos son los datos enviados", payload)
            
            const id_owner = payload ['id_owner']
            const id_country = payload ['id_country']
            const guest_name = payload['guest_name'];                       
            const guest_lastname = payload['guest_lastname'];                       // con el id_owner envio la notificacion
            const dni = payload['DNI'];         
            const owner = await User.findByPk(payload['id_owner'])

            if(payload['check_out'] == true){

            await this.notifications.notifyAExternal_User_By_ID(String(id_owner),
            `El Vigilador confirmó la salida de ${guest_name} ${guest_lastname} - ${dni}`,
            `${owner.name}`, 
            'Nuevo Check-out')

            } else if(payload['confirmed_by_owner'] == false){

                await this.notifications.notifyAllGuards(id_country,
                    `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} se actualizó a denegado por el propietario`,
                    `Vigiladores`,
                    `Rechazo de Propietario`)

            } 

            else if(payload['confirmed_by_owner'] == true && payload['check_in'] == false){

                await this.notifications.notifyAllGuards(id_country,
                    `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} ya fue autorizado por el propietario correspondiente`,
                    `Vigiladores`,
                    `Nueva Confirmacion del Propietario`)

            }   
            else if( payload['confirmed_by_owner'] == true && payload['check_in'] == true){

                await this.notifications.notifyAExternal_User_By_ID(String(id_owner),
                `El Vigilador confirmó la entrada de ${guest_name} ${guest_lastname} - ${dni}`,
                `${owner.name}`, 
                'Nuevo Check-in'

                )
               
            }


            client.broadcast.emit('notificacion-nuevo-confirmedByOwner', 
                payload,
             )

             


        })
    }

    public propietarioConectado(client: Socket){
        client.on('owner-connected', (payload) =>{
            console.log(payload); 
            console.log("SOCKET DESDE EL CUAL SE CONECTO --------------------------------------------------------")
            console.log(client.id)
            this.ownerControl.addowner(payload, client.id)
            const allOwners = this.ownerControl.getowners()        
        })  

    }
    

    public escucharNuevaPosicionGuardia(client: Socket){

        client.on('nueva-posicion-guardia', (payload) => {
            
            const {lat, lng, id_user, id_country, user_name, user_lastname} = payload
            console.log(lat, lng, id_user, id_country, user_name, user_lastname)

            this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname)

            const allGuards = this.guardsUbication.getGuards()        


            client.broadcast.emit('get-actives-guards', allGuards)

        })
    }


    public escucharOwnerDisconnected(client: Socket){

        client.on('disconnect-owner', (payload) => {
            
            console.log(payload)

            this.ownerControl.deleteowner(payload)            



        })
    }


    public escucharGuardDisconnected(client: Socket){

        client.on('disconnectGuardUbication', (payload) => {
            
            console.log(payload)

            this.guardsUbication.deleteGuard(payload)
            

            client.broadcast.emit('guardDisconnected', {})


        })
    }

    public notifiyOwner(){

    }

    // public disconnect( client: Socket ){

    //     client.on('disconnect', () => {
    //         console.log('Desconectado', client.id);
    //     })

    // }


}



    

export default SocketController