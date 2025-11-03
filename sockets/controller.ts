// sockets/controller.ts
import axios from "axios";
import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import GuardUbicationControl from "../classes/GuardsUbicationControl";
import Notifications from "../classes/Notifications";
import OwnersConnectedControl from "../classes/OwnersConnectedControl";
import { getModels } from "../models/getModels";
import { Model } from "sequelize";

// ---- helpers de acceso seguro a campos de Sequelize ----
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);

// Los modelos se obtienen dentro de cada método/handler con getModels()

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
    console.log("[SocketController] Instancia de Socket.IO configurada");
  }

  private startGuardCleanup() {
    if (this.cleanupInterval) return; // Evitar múltiples intervalos

<<<<<<< HEAD
    public notificarCheckIn(client: Socket) {
        client.on('notificar-check-in', async (payload) => {
            console.log("Mensaje recibido", payload);
            console.log("OWNER ID DESDE EL PAYLOAD", payload['id_owner']);
            // recibo el check-in creado, el cual debo pasar al usuario propietario
            const id_owner = payload['id_owner']; // con el id_owner envio la notificacion
            const guest_name = payload['guest_name']; // con el id_owner envio la notificacion
            const guest_lastname = payload['guest_lastname']; // con el id_owner envio la notificacion
            const dni = payload['DNI']; // con el id_owner envio la notificacion
            
            // Si no hay propietario (id_owner es null/0), no crear notificación
            if (!id_owner || id_owner === 0 || id_owner === null) {
                console.log('[Socket] Check-in sin propietario, no se crea notificación para owner');
                return;
            }
            
            const owner = await user.findByPk(id_owner)
            console.log("ESTE ES EL ID QUE SE PASA AL CREAR EL CHECKIN", id_owner);
            // Fallback: crear notificación en DB (sin push) para que aparezca en la campanita
            try {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, '0');
                const mm = String(now.getMinutes()).padStart(2, '0');
                const hora = `${hh}:${mm}`;
                await notification.create({
                    id_user: Number(id_owner),
                    title: 'Vigilador',
                    content: `Ingreso de visitante (${guest_name} ${guest_lastname}, ${hora}) autorizado por vigilador`,
                    read: false,
                });
            } catch (e) {
                console.error('[Socket] Error creando notificación de check-in en DB:', e);
            }
            const ownerConnected = this.ownerControl.getownersByUserId(id_owner)
=======
    this.cleanupInterval = setInterval(() => {
      const activeGuards = this.guardsUbication.cleanInactiveGuards();
      console.log(`[SocketController] Guardias activos: ${activeGuards.length}`);
>>>>>>> 0c266a20978be401cfc35abac3708f9c0cc0e32f

      // Emitir lista actualizada después de limpiar
      if (this.io) {
        this.io.emit("get-actives-guards", activeGuards);
      }
    }, 30000); // Cada 30 segundos

    console.log("[SocketController] Sistema de limpieza de guardias inactivos iniciado");
  }

  public notificarCheckIn(client: Socket) {
    client.on("notificar-check-in", async (payload) => {
      console.log("Mensaje recibido", payload);
      console.log("OWNER ID DESDE EL PAYLOAD", payload["id_owner"]);

      const id_owner = payload["id_owner"];
      const guest_name = payload["guest_name"];
      const guest_lastname = payload["guest_lastname"];
      const dni = payload["DNI"];

      const { user, notification } = getModels();
      const owner = await (user as any).findByPk(id_owner);
      console.log("ESTE ES EL ID QUE SE PASA AL CREAR EL CHECKIN", id_owner);

      // Fallback: crear notificación en DB (sin push) para que aparezca en la campanita
      try {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const hora = `${hh}:${mm}`;

        await (notification as any).create({
          id_user: Number(id_owner),
          title: "Vigilador",
          content: `Ingreso de visitante (${guest_name} ${guest_lastname}, ${hora}) autorizado por vigilador`,
          read: false,
        });
      } catch (e) {
        console.error("[Socket] Error creando notificación de check-in en DB:", e);
      }

      const ownerConnected = this.ownerControl.getownersByUserId(id_owner);

      if (ownerConnected) {
        client.to(ownerConnected.id_socket).emit("notificacion-check-in", payload);
      } else {
        return;
      }
    });
  }

  public escucharAntipanico(client: Socket) {
    client.on("notificar-antipanico", (payload) => {
      try {
        console.log("[Socket] Antipánico activado recibido:", payload);

        const { res, ownerName, ownerLastName } = payload;

        if (!res || !res.antipanic) {
          console.error("[Socket] ❌ Payload inválido: falta res.antipanic");
          return;
        }

        const address = res["antipanic"]["address"];
        const id = res["antipanic"]["id"];
        const id_country = res["antipanic"]["id_country"];

        this.notifications.notifyAllGuards(
          String(id_country),
          `Antipanico activado por ${ownerName} ${ownerLastName} de direccion ${address}`,
          "Antipanico Activado",
          "Antipanico"
        );

        const antipanicAdvice = {
          ownerName,
          ownerLastName,
          address,
          id,
        };

        console.log("[Socket] ✅ Emitiendo notificación de antipánico:", antipanicAdvice);
        client.broadcast.emit("notificacion-antipanico", antipanicAdvice);
      } catch (error) {
        console.error("[Socket] ❌ Error al procesar antipánico:", error);
      }
    });
  }

  public escucharAntipanicoFinalizado(client: Socket) {
    client.on("notificar-antipanico-finalizado", (payload) => {
      try {
        console.log("[Socket] Antipánico finalizado recibido:", payload);

        const owner = this.ownerControl.getownersByUserId(payload["antipanic"]["ownerId"]);

        if (!owner) {
          console.warn(
            "[Socket] ⚠️ Owner no está conectado (ID:",
            payload["antipanic"]["ownerId"],
            ")"
          );
          client.broadcast.emit("notificacion-antipanico-finalizado", payload);
          return;
        }

        if (!owner.id_socket) {
          console.warn("[Socket] ⚠️ Owner sin id_socket válido");
          client.broadcast.emit("notificacion-antipanico-finalizado", payload);
          return;
        }

        console.log("[Socket] ✅ Owner conectado, id_socket:", owner.id_socket);
        console.log("[Socket] Payload a enviar:", payload);

        client.broadcast.emit("notificacion-antipanico-finalizado", payload);
        client.to(owner.id_socket).emit("notificacion-antipanico-finalizado", payload);
      } catch (error) {
        console.error("[Socket] ❌ Error al notificar finalización de antipánico:", error);
      }
    });
  }

  public escucharNuevoConfirmedByOwner(client: Socket) {
    client.on("notificar-nuevo-confirmedByOwner", async (payload) => {
      console.log("Estos son los datos enviados", payload);
      const id_owner = payload["id_owner"];
      const id_country = payload["id_country"];
      const guest_name = payload["guest_name"];
      const guest_lastname = payload["guest_lastname"];
      const dni = payload["DNI"];

      const { user } = getModels();
      const owner = await (user as any).findByPk(payload["id_owner"]);
      const ownerName = getVal(owner, "name");

      if (payload["check_out"] == true) {
        const notificationSend =
          await this.notifications.notifyAExternal_User_By_ID(
            String(id_owner),
            `El Vigilador confirmó la salida de ${guest_name} ${guest_lastname} - ${dni}`,
            `${ownerName}`,
            "Nuevo Check-out"
          );
        if (notificationSend) {
          client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        }
      } else if (payload["confirmed_by_owner"] == false) {
        const notificationSend = await this.notifications.notifyAllGuards(
          id_country,
          `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} se actualizó a denegado por el propietario`,
          `Vigiladores`,
          `Rechazo de Propietario`
        );
        if (notificationSend) {
          client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        }
      } else if (payload["confirmed_by_owner"] == true && payload["check_in"] == false) {
        const notificationSend = await this.notifications.notifyAllGuards(
          id_country,
          `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} ya fue autorizado por el propietario correspondiente`,
          `Vigiladores`,
          `Nueva Confirmacion del Propietario`
        );
        if (notificationSend) {
          client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        }
      } else if (payload["confirmed_by_owner"] == true && payload["check_in"] == true) {
        const notificationSend =
          await this.notifications.notifyAExternal_User_By_ID(
            String(id_owner),
            `El Vigilador confirmó la entrada de ${guest_name} ${guest_lastname} - ${dni}`,
            `${ownerName}`,
            "Nuevo Check-in"
          );
        if (notificationSend) {
          client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        }
      }
    });
  }

  public propietarioConectado(client: Socket) {
    client.on("owner-connected", (payload) => {
      console.log(payload);
      console.log(
        "SOCKET DESDE EL CUAL SE CONECTO --------------------------------------------------------"
      );
      console.log(client.id);
      this.ownerControl.addowner(payload, client.id);
      const allOwners = this.ownerControl.getowners();
    });
  }

  public escucharNuevaPosicionGuardia(client: Socket) {
    // Mantener compatibilidad con evento antiguo
    client.on("nueva-posicion-guardia", (payload) => {
      const { lat, lng, id_user, id_country, user_name, user_lastname } = payload;
      console.log(
        `[Socket] Ubicación recibida (evento antiguo): Guardia ${id_user} en (${lat}, ${lng})`
      );
      this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname);
      const allGuards = this.guardsUbication.getGuards();

      // Emitir a TODOS los clientes usando io.emit
      if (this.io) {
        this.io.emit("get-actives-guards", allGuards);
        console.log(
          `[Socket] Emitido 'get-actives-guards' a todos los clientes. Total guardias: ${allGuards.length}`
        );
      }
    });

    // Nuevo evento compatible con el frontend actualizado
    client.on("update-guard-location", (payload) => {
      const { lat, lng, id_user, id_country, user_name, user_lastname } = payload;
      console.log(
        `[Socket] Ubicación actualizada: Guardia ${id_user} (${user_name} ${user_lastname}) en (${lat}, ${lng})`
      );

      // Guardar/actualizar ubicación
      this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname);
      const allGuards = this.guardsUbication.getGuards();

      // ✅ CRÍTICO: Emitir a TODOS los clientes usando io.emit
      if (this.io) {
        this.io.emit("get-actives-guards", allGuards);
        console.log(
          `[Socket] ✅ Emitido 'get-actives-guards' a TODOS los clientes. Total guardias: ${allGuards.length}`
        );
      } else {
        console.error("[Socket] ❌ ERROR: io no está configurado. No se puede emitir.");
      }
    });
  }

  public escucharOwnerDisconnected(client: Socket) {
    client.on("disconnect-owner", (payload) => {
      console.log(payload);
      this.ownerControl.deleteowner(payload);
    });
  }

  public escucharGuardDisconnected(client: Socket) {
    client.on("disconnectGuardUbication", (payload) => {
      console.log(payload);
      this.guardsUbication.deleteGuard(payload);
      client.broadcast.emit("guardDisconnected", {});
    });
  }

  public notifiyOwner() {}

  public notificarReservaActualizada(ownerUserID: number, updatedReservation: any) {
    const ownerConnected = this.ownerControl.getownersByUserId(ownerUserID);

    if (ownerConnected && ownerConnected.id_socket && this.io) {
      this.io
        .to(ownerConnected.id_socket)
        .emit("reservation-status-updated", updatedReservation);
      console.log(
        `[WS] Notificación de reserva actualizada enviada al Owner: ${ownerUserID} (${ownerConnected.id_socket})`
      );
    } else {
      console.warn(
        `[WS] Owner ${ownerUserID} no conectado o IO no configurado. No se pudo enviar 'reservation-status-updated' directamente.`
      );
    }
  }
}

<<<<<<< HEAD
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
    // ✅ Escuchar cuando un guardia aprueba un servicio sin propietario
    public escucharServiceApprovedByGuard(client: Socket) {
        client.on('service-approved-by-guard', async (payload) => {
            console.log('[Socket] Guardia aprobó servicio:', payload);
            
            // Reemitir a todos los clientes (admin y otros guardias)
            client.broadcast.emit('service-approved-by-guard', payload);
            
            console.log('[Socket] Evento service-approved-by-guard reemitido a todos los clientes');
        });
    }

    // ✅ Escuchar cuando un admin aprueba un servicio sin propietario
    public escucharServiceApprovedByAdmin(client: Socket) {
        client.on('service-approved-by-admin', async (payload) => {
            console.log('[Socket] Admin aprobó servicio:', payload);
            
            // Reemitir a todos los clientes (guardias)
            client.broadcast.emit('service-approved-by-admin', payload);
            
            console.log('[Socket] Evento service-approved-by-admin reemitido a todos los clientes');
        });
    }

} 

export default SocketController
=======
export default SocketController;
>>>>>>> 0c266a20978be401cfc35abac3708f9c0cc0e32f
