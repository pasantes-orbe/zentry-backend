// sockets/controller.ts
import axios from "axios";
import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import GuardUbicationControl from "../classes/GuardsUbicationControl";
import Notifications from "../classes/Notifications";
import OwnersConnectedControl from "../classes/OwnersConnectedControl";
import { getModels } from "../models/getModels";

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

    this.cleanupInterval = setInterval(() => {
      const activeGuards = this.guardsUbication.cleanInactiveGuards();
      console.log(`[SocketController] Guardias activos: ${activeGuards.length}`);

      // Emitir lista actualizada después de limpiar
      if (this.io) {
        this.io.emit("get-actives-guards", activeGuards);
      }
    }, 30000); // Cada 30s

    console.log("[SocketController] Sistema de limpieza de guardias inactivos iniciado");
  }

  public notificarCheckIn(client: Socket) {
    client.on("notificar-check-in", async (payload) => {
      try {
        console.log("Mensaje recibido", payload);
        const id_owner = payload["id_owner"];
        const guest_name = payload["guest_name"];
        const guest_lastname = payload["guest_lastname"];

        // Si no hay propietario, no notificar a owner
        if (!id_owner) {
          console.log("[Socket] Check-in sin propietario; no se notifica a owner.");
          return;
        }

        const { user, notification } = getModels();
        const owner = await (user as any).findByPk(id_owner);
        console.log("Owner para notificar:", getVal(owner, "id"));

        // Crear notificación en DB (campanita)
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

        // Emitir en tiempo real al owner si está conectado
        const ownerConnected = this.ownerControl.getownersByUserId(id_owner);
        if (ownerConnected && ownerConnected.id_socket && this.io) {
          this.io.to(ownerConnected.id_socket).emit("notificacion-check-in", payload);
        }
      } catch (e) {
        console.error("[Socket] Error en notificarCheckIn:", e);
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

        const antipanicAdvice = { ownerName, ownerLastName, address, id };
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

        client.broadcast.emit("notificacion-antipanico-finalizado", payload);
        if (owner && owner.id_socket && this.io) {
          this.io.to(owner.id_socket).emit("notificacion-antipanico-finalizado", payload);
        }
      } catch (error) {
        console.error("[Socket] ❌ Error al notificar finalización de antipánico:", error);
      }
    });
  }

  public escucharNuevoConfirmedByOwner(client: Socket) {
    client.on("notificar-nuevo-confirmedByOwner", async (payload) => {
      try {
        console.log("Estos son los datos enviados", payload);
        const id_owner = payload["id_owner"];
        const id_country = payload["id_country"];
        const guest_name = payload["guest_name"];
        const guest_lastname = payload["guest_lastname"];
        const dni = payload["DNI"];

        const { user } = getModels();
        const owner = await (user as any).findByPk(id_owner);
        const ownerName = getVal(owner, "name");

        if (payload["check_out"] === true) {
          const ok = await this.notifications.notifyAExternal_User_By_ID(
            String(id_owner),
            `El Vigilador confirmó la salida de ${guest_name} ${guest_lastname} - ${dni}`,
            `${ownerName}`,
            "Nuevo Check-out"
          );
          if (ok) client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        } else if (payload["confirmed_by_owner"] === false) {
          const ok = await this.notifications.notifyAllGuards(
            id_country,
            `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} se actualizó a denegado por el propietario`,
            `Vigiladores`,
            `Rechazo de Propietario`
          );
          if (ok) client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        } else if (payload["confirmed_by_owner"] === true && payload["check_in"] === false) {
          const ok = await this.notifications.notifyAllGuards(
            id_country,
            `El Check-in: ${guest_name} ${guest_lastname} - DNI: ${dni} ya fue autorizado por el propietario correspondiente`,
            `Vigiladores`,
            `Nueva Confirmacion del Propietario`
          );
          if (ok) client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        } else if (payload["confirmed_by_owner"] === true && payload["check_in"] === true) {
          const ok = await this.notifications.notifyAExternal_User_By_ID(
            String(id_owner),
            `El Vigilador confirmó la entrada de ${guest_name} ${guest_lastname} - ${dni}`,
            `${ownerName}`,
            "Nuevo Check-in"
          );
          if (ok) client.broadcast.emit("notificacion-nuevo-confirmedByOwner", payload);
        }
      } catch (e) {
        console.error("[Socket] Error en escucharNuevoConfirmedByOwner:", e);
      }
    });
  }

  public propietarioConectado(client: Socket) {
    client.on("owner-connected", (payload) => {
      console.log(payload);
      console.log("SOCKET CONECTADO -------------------------------", client.id);
      this.ownerControl.addowner(payload, client.id);
    });
  }

  public escucharNuevaPosicionGuardia(client: Socket) {
    // Evento antiguo (compat)
    client.on("nueva-posicion-guardia", (payload) => {
      const { lat, lng, id_user, id_country, user_name, user_lastname } = payload;
      console.log(`[Socket] Ubicación recibida (antiguo): Guardia ${id_user} en (${lat}, ${lng})`);
      this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname);
      const allGuards = this.guardsUbication.getGuards();

      if (this.io) {
        this.io.emit("get-actives-guards", allGuards);
        console.log(
          `[Socket] Emitido 'get-actives-guards' a todos. Total guardias: ${allGuards.length}`
        );
      }
    });

    // Evento nuevo
    client.on("update-guard-location", (payload) => {
      const { lat, lng, id_user, id_country, user_name, user_lastname } = payload;
      console.log(
        `[Socket] Ubicación actualizada: Guardia ${id_user} (${user_name} ${user_lastname}) en (${lat}, ${lng})`
      );

      this.guardsUbication.addGuard(lat, lng, id_user, id_country, user_name, user_lastname);
      const allGuards = this.guardsUbication.getGuards();

      if (this.io) {
        this.io.emit("get-actives-guards", allGuards);
        console.log(
          `[Socket] ✅ Emitido 'get-actives-guards' a TODOS. Total guardias: ${allGuards.length}`
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
      this.io.to(ownerConnected.id_socket).emit("reservation-status-updated", updatedReservation);
      console.log(
        `[WS] Notificación de reserva actualizada enviada al Owner: ${ownerUserID} (${ownerConnected.id_socket})`
      );
    } else {
      console.warn(
        `[WS] Owner ${ownerUserID} no conectado o IO no configurado. No se pudo enviar 'reservation-status-updated' directamente.`
      );
    }
  }

  // ✅ Guardia aprueba un servicio sin propietario
  public escucharServiceApprovedByGuard(client: Socket) {
    client.on("service-approved-by-guard", async (payload) => {
      console.log("[Socket] Guardia aprobó servicio:", payload);
      client.broadcast.emit("service-approved-by-guard", payload);
      console.log("[Socket] Evento service-approved-by-guard reemitido a todos los clientes");
    });
  }

  // ✅ Admin aprueba un servicio sin propietario
  public escucharServiceApprovedByAdmin(client: Socket) {
    client.on("service-approved-by-admin", async (payload) => {
      console.log("[Socket] Admin aprobó servicio:", payload);
      client.broadcast.emit("service-approved-by-admin", payload);
      console.log("[Socket] Evento service-approved-by-admin reemitido a todos los clientes");
    });
  }
}

export default SocketController;
