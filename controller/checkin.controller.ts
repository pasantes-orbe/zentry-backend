// controller/checkin.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getModels } from "../models/getModels";
import CheckIn from "../classes/CheckIn";
import Server from "../server";
import Guard from "../classes/Guard";

// Helper chico para extraer DataValues sin romper si viene plano
const getVal = (row: any, key: string) =>
  row?.get ? row.get(key) : row?.[key];

class CheckInController {
  public async create(req: Request, res: Response) {
    try {
      const { checkin, notification } = getModels();

      // 1) Normalizar id_owner: 0/undefined -> null
      if (!req.body.id_owner || req.body.id_owner === 0) {
        req.body.id_owner = null;
      }

      // 2) Manejo de confirmed_by_owner
      const confirmedByOwner = req.body.id_owner
        ? (req.body.confirmed_by_owner === "true" ||
            req.body.confirmed_by_owner === true)
        : true; // Auto-confirmar si no hay propietario
      req.body.confirmed_by_owner = confirmedByOwner;

      // 3) Flags de estado iniciales
      req.body.check_in = false;
      req.body.check_out = false;

      // 4) Normalización de opcionales
      req.body.transport = req.body.transport?.trim() || null;
      req.body.details = req.body.details?.trim() || null;
      req.body.id_guard = req.body.id_guard || null;

      // 5) Patente a mayúsculas
      if (req.body.patent) {
        req.body.patent = req.body.patent.toUpperCase().trim() || null;
      } else {
        req.body.patent = null;
      }

      // 6) Verificación de guardia si viene
      if (req.body.id_guard) {
        const guardExists = await new Guard().exists(req.body.id_guard);
        if (!guardExists) {
          console.log("--------Guardia no existe--------");
          req.body.id_guard = null;
        }
      }

      // Crear el check-in
      const newCheckIn = await checkin.create(req.body);

      // Notificación al propietario (si hay)
      try {
        const hasOwner = !!getVal(newCheckIn, "id_owner");
        if (hasOwner && notification) {
          const title = "Vigilador";
          const content = `Solicitud de ingreso de ${getVal(
            newCheckIn,
            "guest_name"
          )} ${getVal(newCheckIn, "guest_lastname")} enviada por vigilador.`;

          // Crear notificación en DB para que el frontend tenga createdAt/id consistentes
          const created = await notification.create({
            id_user: getVal(newCheckIn, "id_owner"),
            title,
            content,
            read: false,
          });

          // Emitir socket normalizado: incluir los campos de la fila creada
          const server = Server.instance;
          const base = (created as any)?.toJSON?.() ?? created;
          server.io.emit("new-notification", {
            ...base,
            type: "checkin-request",
            checkin: newCheckIn,
          });
        }
      } catch (e) {
        console.log(
          "[create] No se pudo crear/emitir notificación al owner:",
          e
        );
      }

      // Notificar garita
      const server = Server.instance;
      if (confirmedByOwner) {
        const msgType = req.body.id_owner
          ? `Visita rápida de ${req.body.guest_lastname} ${req.body.guest_name} autorizada por propietario.`
          : `Check-in sin propietario: ${req.body.guest_lastname} ${req.body.guest_name} (${
              req.body.details || "Sin detalles"
            })`;

        server.io.emit("notificarNuevoConfirmedByOwner", {
          msg: msgType,
          checkIn: newCheckIn,
        });
      } else {
        server.io.emit("notificar-checkin", {
          msg: `${req.body.guest_lastname} ${req.body.guest_name} está solicitando check-in`,
          checkIn: newCheckIn,
        });
      }

      const responseMsg = req.body.id_owner
        ? "Autorización de Visita Rápida registrada exitosamente"
        : "Check-in sin propietario registrado. Pendiente de autorización de ingreso";

      return res.status(201).json({
        msg: responseMsg,
        checkIn: newCheckIn,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al crear Check-In" });
    }
  }

  public async approve(req: Request, res: Response) {
    try {
      const { checkin } = getModels();
      const id = Number(req.params.id_checkin);
      const row = await checkin.findByPk(id);

      if (!row) return res.status(404).json({ msg: "Check-In no existe" });

      // Marcar como ingresado
      await row.update({ check_in: true });

      // Emitir actualización
      const server = Server.instance;
      server.io.emit("refresh-checkins", { id });

      return res.json({
        msg: "Ingreso aprobado por guardia",
        checkIn: row,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al aprobar Check-In" });
    }
  }

  public async ownerConfirm(req: Request, res: Response) {
    try {
      const { checkin, user, notification } = getModels();
      const id = Number(req.params.id_checkin);

      const row = await checkin.findByPk(id, {
        include: [
          { model: user, as: "guardUser" },
          { model: user, as: "ownerUser" },
        ],
      });

      if (!row) return res.status(404).json({ msg: "Check-In no existe" });

      // Confirmar y marcar ingreso
      await checkin.update(
        { confirmed_by_owner: true, check_in: true },
        { where: { id } }
      );

      const updated = await checkin.findByPk(id, {
        include: [
          { model: user, as: "guardUser" },
          { model: user, as: "ownerUser" },
        ],
      });

      const server = Server.instance;
      const title = "Propietario";
      const content = `Autorizó a ${getVal(updated, "guest_name")} ${getVal(
        updated,
        "guest_lastname"
      )}`;

      const id_guard = getVal(updated, "id_guard");
      if (notification && id_guard) {
        await notification.create({
          title,
          content,
          id_user: id_guard,
          read: false,
        });
      }

      server.io.emit("new-notification", {
        id_user: id_guard,
        title,
        content,
        read: false,
        type: "checkin-owner-approved",
        checkin: updated,
      });

      server.io.emit("notificar-nuevo-confirmedByOwner", { checkIn: updated });

      return res.json({
        msg: "Check-In confirmado por propietario",
        checkIn: updated,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al confirmar Check-In" });
    }
  }

  public async changeStatus(req: Request, res: Response) {
    try {
      const { id_checkin } = req.params;
      const { new_status } = req.body;

      // El método de dominio ya opera con los modelos por dentro
      const update = await new CheckIn().changeStatus(+id_checkin, new_status);
      if (!update) {
        return res.status(404).json({ msg: "Check-in no existe" });
      }

      return res.json({ msg: "Check-in actualizado correctamente", update });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al actualizar estado" });
    }
  }

  public async getApproved(req: Request, res: Response) {
    try {
      const { checkin, user } = getModels();
      const { id_country } = req.params;

      const checkins = await checkin.findAll({
        where: { id_country, check_in: true },
        include: [
          { model: user, as: "guardUser" },
          { model: user, as: "ownerUser" },
        ],
      });

      return res.json(checkins);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al obtener checkins aprobados" });
    }
  }

  public async getConfirmedByOwner(req: Request, res: Response) {
    try {
      const { checkin, user } = getModels();
      const { id_country } = req.params;

      const checkins = await checkin.findAll({
        where: { confirmed_by_owner: true, check_in: false, id_country },
        include: [
          { model: user, as: "guardUser" },
          { model: user, as: "ownerUser" },
        ],
      });

      return res.json(checkins);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ msg: "Error al obtener checkins confirmados" });
    }
  }

  public async getRegisters(req: Request, res: Response) {
    try {
      const { checkin, checkout } = getModels();
      const { id_country } = req.params;
      const responseArray: any[] = [];

      const checkins = await checkin.findAll({
        where: { id_country, check_in: true },
      });

      for (const ci of checkins) {
        const idCheckin = getVal(ci, "id");
        const checkedOut = await checkout.findOne({
          where: { id_checkin: idCheckin },
        });

        responseArray.push({ checkin: ci, checkout: checkedOut });
      }

      return res.json(responseArray);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al obtener registros" });
    }
  }

  public async getCheckOutFalse(_req: Request, res: Response) {
    try {
      const { checkin, user } = getModels();

      const checkins = await checkin.findAll({
        where: { check_out: false, check_in: true, confirmed_by_owner: true },
        include: [
          { model: user, as: "guardUser" },
          { model: user, as: "ownerUser" },
        ],
      });

      return res.json(checkins);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ msg: "Error al obtener checkouts pendientes" });
    }
  }

  public async getByOwner(req: Request, res: Response) {
    try {
      const { checkin } = getModels();
      const { id_owner } = req.params;

      const checkins = await checkin.findAll({
        where: { id_owner },
        include: [{ all: true }],
      });

      return res.json(checkins);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ msg: "Error al obtener checkins por propietario" });
    }
  }

  public async checkOutConfirmed(req: Request, res: Response) {
    try {
      const { id_checkin } = req.params;
      const update = await new CheckIn().checkOutConfirm(+id_checkin);

      if (!update) {
        return res.status(404).json({ msg: "Check-in no existe" });
      }

      return res.json({ msg: "Check-out confirmado", update });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al confirmar check-out" });
    }
  }

  public async getcheckInsToday(req: Request, res: Response) {
    try {
      const { checkin, user } = getModels();
      const { id_owner } = req.params;

      const TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0, 0);

      const NOW = new Date();
      NOW.setHours(23, 59, 59, 999);

      const checkins = await checkin.findAll({
        where: {
          id_owner,
          income_date: {
            [Op.gt]: TODAY_START,
            [Op.lt]: NOW,
          },
        },
        include: [
          { model: user, as: "ownerUser" },
          { model: user, as: "guardUser" },
        ],
      });

      return res.json(checkins);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ msg: "Error al obtener checkins de hoy" });
    }
  }
}

export default new CheckInController();




