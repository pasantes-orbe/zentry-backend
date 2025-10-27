// sockets/controller.ts
import axios from "axios";
import { Socket } from "socket.io"; 
import { Server as SocketIOServer } from "socket.io";
import GuardUbicationControl from "../classes/GuardsUbicationControl";
import Notifications from "../classes/Notifications";
import OwnersConnectedControl from "../classes/OwnersConnectedControl";
import db from "../models"; // Importamos el objeto db centralizado

// Desestructuramos los modelos necesarios
const { user, guard_country } = db;

class SocketController {
    public guardsUbication: GuardUbicationControl = new GuardUbicationControl();
    public ownerControl: OwnersConnectedControl = new OwnersConnectedControl();
    public notifications: Notifications = new Notifications();
    private cleanupInterval: NodeJS.Timeout | null = null;
    private io: SocketIOServer | null = null;

    constructor() {
        // Iniciar limpieza automática de guardias inactivos cada 30 segundos
        this.startGuardCleanup();
    }

    // Método para inyectar la instancia de io
    public setIO(io: SocketIOServer) {
        this.io = io;
        console.log('[SocketController] Instancia de Socket.IO configurada');
    }

    private startGuardCleanup() {
        if (this.cleanupInterval) return; // Evitar múltiples intervalos
        
        this.cleanupInterval = setInterval(() => {
            const activeGuards = this.guardsUbication.cleanInactiveGuards();
            console.log(`[SocketController] Guardias activos: ${activeGuards.length}`);
            
            // Emitir lista actualizada después de limpiar
            if (this.io) {
                this.io.emit('get-actives-guards', activeGuards);
            }
        }, 30000); // Cada 30 segundos
        
        console.log('[SocketController] Sistema de limpieza de guardias inactivos iniciado');
    }

    public notificarCheckIn(client: Socket) {
        client.on('notificar-check-in', async (payload) => {
            console.log("Mensaje recibido", payload);
            console.log("OWNER ID DESDE EL PAYLOAD", payload['id_owner']);
            // recibo el check-in creado, el cual debo pasar al usuario propietario
            const id_owner = payload['id_owner']; // con el id_owner envio la notificacion
            const guest_name = payload['guest_name']; // con el id_owner envio la notificacion
            const guest_lastname = payload['guest_lastname']; // con el id_owner envio la notificacion
            const dni = payload['DNI']; // con el id_owner envio la notificacion
            const owner = await user.findByPk(id_owner)
            console.log("ESTE ES EL ID QUE SE PASA AL CREAR EL CHECKIN", id_owner);
            this.notifications.notifyAExternal_User_By_ID(String(id_owner),
                `Tienes un nuevo Check-in para Autorizar: ${guest_name} ${guest_lastname} - DNI: ${dni}`,
                `${owner?.name}`,
                'Nueva Solicitud de Check-in')
            const ownerConnected = this.ownerControl.getownersByUserId(id_owner)
            if (ownerConnected) {
                client.to(ownerConnected.id_socket).emit('notificacion-check-in', payload)
            } else {
                return
            }
        })
    }
    public escucharAntipanico(client: Socket) {
        client.on('notificar-antipanico', (payload) => {
            const { res, ownerName, ownerLastName } = payload
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
    public escucharAntipanicoFinalizado(client: Socket) {
        client.on('notificar-antipanico-finalizado', (payload) => {
            console.log(payload)
            const owner = this.ownerControl.getownersByUserId(payload['antipanic']['ownerId'])
            // ✅ Corregido: no acceder a owner.id_socket antes de verificar que exista
            if (owner) {
                console.log("Este es el id del socket", owner.id_socket)
                console.log("ESTE ES EL PAYLOD", payload)
                client.broadcast.emit('notificacion-antipanico-finalizado', payload);
                client.to(owner.id_socket).emit('notificacion-antipanico-finalizado', payload)
            } else {
                return
            }
        })
    }

    public escucharNuevoConfirmedByOwner(client: Socket) {
        client.on('notificar-nuevo-confirmedByOwner', async (payload) => {
            console.log("Estos son los datos enviados", payload)
            const id_owner = payload['id_owner']
            const id_country = payload['id_country']
            const guest_name = payload['guest_name'];
            const guest_lastname = payload['guest_lastname'];
            const dni = payload['DNI'];
            const owner = await user.findByPk(payload['id_owner'])
            if (payload['check_out'] == true) {
                const notificationSend = await this.notifications.notifyAExternal_User_By_ID(String(id_owner),
                    `El Vigilador confirmó la salida de ${guest_name} ${guest_lastname} - ${dni}`,
                    `${owner?.name}`,
                    'Nuevo Check-out')
                if (notificationSend) {
                    client.broadcast.emit('notificacion-nuevo-confirmedByOwner',
                        payload,
                    )
                }
            } else if (payload['confirmed_by_owner'] == false) {
                const notificationSend = await this.notifications.notifyAllGuards(id_country,
                    `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} se actualizó a denegado por el propietario`,
                    `Vigiladores`,
                    `Rechazo de Propietario`)
                if (notificationSend) {
                    client.broadcast.emit('notificacion-nuevo-confirmedByOwner',
                        payload,
                    )
                }
            }
            else if (payload['confirmed_by_owner'] == true && payload['check_in'] == false) {
                const notificationSend = await this.notifications.notifyAllGuards(id_country,
                    `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} ya fue autorizado por el propietario correspondiente`,
                    `Vigiladores`,
                    `Nueva Confirmacion del Propietario`)
                if (notificationSend) {
                    client.broadcast.emit('notificacion-nuevo-confirmedByOwner',
                        payload,
                    )
                }
            }
            else if (payload['confirmed_by_owner'] == true && payload['check_in'] == true) {
                const notificationSend = await this.notifications.notifyAExternal_User_By_ID(String(id_owner),
                    `El Vigilador confirmó la entrada de ${guest_name} ${guest_lastname} - ${dni}`,
                    `${owner?.name}`,
                    'Nuevo Check-in'
                )
                if (notificationSend) {
                    client.broadcast.emit('notificacion-nuevo-confirmedByOwner',
                        payload,
                    )
                }
            }
        })
    }
    public propietarioConectado(client: Socket) {
        client.on('owner-connected', (payload) => {
            console.log(payload);
            console.log("SOCKET DESDE EL CUAL SE CONECTO --------------------------------------------------------")
            console.log(client.id)
            this.ownerControl.addowner(payload, client.id)
            const allOwners = this.ownerControl.getowners()
        })
    }
    public escucharNuevaPosicionGuardia(client: Socket) {
        // Mantener compatibilidad con evento antiguo
        client.on('nueva-posicion-guardia', (payload) => {
            const { lat, lng, id_user, id_country, user_name, user_lastname } = payload
            console.log(`[Socket] Ubicación recibida (evento antiguo): Guardia ${id_user} en (${lat}, ${lng})`);
            this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname)
            const allGuards = this.guardsUbication.getGuards()
            
            // Emitir a TODOS los clientes usando io.emit
            if (this.io) {
                this.io.emit('get-actives-guards', allGuards);
                console.log(`[Socket] Emitido 'get-actives-guards' a todos los clientes. Total guardias: ${allGuards.length}`);
            }
        })

        // Nuevo evento compatible con el frontend actualizado
        client.on('update-guard-location', (payload) => {
            const { lat, lng, id_user, id_country, user_name, user_lastname } = payload
            console.log(`[Socket] Ubicación actualizada: Guardia ${id_user} (${user_name} ${user_lastname}) en (${lat}, ${lng})`);
            
            // Guardar/actualizar ubicación
            this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname)
            const allGuards = this.guardsUbication.getGuards()
            
            // ✅ CRÍTICO: Emitir a TODOS los clientes usando io.emit
            if (this.io) {
                this.io.emit('get-actives-guards', allGuards);
                console.log(`[Socket] ✅ Emitido 'get-actives-guards' a TODOS los clientes. Total guardias: ${allGuards.length}`);
            } else {
                console.error('[Socket] ❌ ERROR: io no está configurado. No se puede emitir.');
            }
        })
    }

    public escucharOwnerDisconnected(client: Socket) {
        client.on('disconnect-owner', (payload) => {
            console.log(payload)
            this.ownerControl.deleteowner(payload)
        })
    }

    public escucharGuardDisconnected(client: Socket) {
        client.on('disconnectGuardUbication', (payload) => {
            console.log(payload)
            this.guardsUbication.deleteGuard(payload)
            client.broadcast.emit('guardDisconnected', {})
        })
    }

    public notifiyOwner() {
    }


    public notificarReservaActualizada(ownerUserID: number, updatedReservation: any) {

        const ownerConnected = this.ownerControl.getownersByUserId(ownerUserID);

        if (ownerConnected && ownerConnected.id_socket && this.io) {
            // 2. Emitir el evento al socket específico del owner
            this.io.to(ownerConnected.id_socket).emit('reservation-status-updated', updatedReservation);
            console.log(`[WS] Notificación de reserva actualizada enviada al Owner: ${ownerUserID} (${ownerConnected.id_socket})`);
        } else {
            console.warn(`[WS] Owner ${ownerUserID} no conectado o IO no configurado. No se pudo enviar 'reservation-status-updated' directamente.`);
            // Opcional: aquí podrías integrar notificación push fallback si aplica.
        }
    }

} 

export default SocketController