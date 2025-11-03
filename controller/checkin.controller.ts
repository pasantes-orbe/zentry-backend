// controller/checkin.controller.ts
import { Request, Response } from "express";
import { Op, Model } from "sequelize";
import { getModels } from "../models/getModels";
import CheckIn from "../classes/CheckIn";
import Server from "../server";
import Guard from "../classes/Guard";

// ---------- Helpers de acceso seguros ----------
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);

// ---------- Modelos (obtener dentro de cada método) ----------

class CheckInController {
  public async create(req: Request, res: Response) {
    try {
      // 1) Normalización de confirmed_by_owner
      const confirmedByOwner =
        req.body.confirmed_by_owner === "true" ||
        req.body.confirmed_by_owner === true;
      req.body.confirmed_by_owner = confirmedByOwner;

      // 2) Estados iniciales
      req.body.check_in = false;
      req.body.check_out = false;

      // 3) Normalización de opcionales
      req.body.transport = req.body.transport?.trim() || null;
      req.body.details = req.body.details?.trim() || null;
      req.body.id_guard = req.body.id_guard || null;

      // 4) Patente
      if (req.body.patent) {
        req.body.patent = req.body.patent.toUpperCase().trim() || null;
      } else {
        req.body.patent = null;
      }

      // 5) Validación de guard (si vino)
      if (req.body.id_guard) {
        const guardExists = await new Guard().exists(req.body.id_guard);
        if (!guardExists) {
          console.log("--------Guardia no existe--------");
          req.body.id_guard = null;
        }
      }

      const { checkin } = getModels();
      const newCheckIn = await checkin.create(req.body);

      // Emitir por socket
      const server = Server.instance;
      if (confirmedByOwner) {
        server.io.emit("notificarNuevoConfirmedByOwner", {
          msg: `Visita rápida de ${req.body.guest_lastname} ${req.body.guest_name} autorizada por propietario.`,
          checkIn: newCheckIn,
        });
      } else {
        server.io.emit("notificar-checkin", {
          msg: `${req.body.guest_lastname} ${req.body.guest_name} está solicitando check-in`,
          checkIn: newCheckIn,
        });
      }

      return res.status(201).json({
        msg: "Autorización de Visita Rápida registrada exitosamente",
        checkIn: newCheckIn,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al crear Check-In" });
    }
  }

  public async approve(req: Request, res: Response) {
    try {
      const id = Number(req.params.id_checkin);
      const { checkin } = getModels();
      const checkIn = await checkin.findByPk(id);

      if (!checkIn) {
        return res.status(404).json({ msg: "Check-In no existe" });
      }

      await new CheckIn().approve(id);

      return res.json({ msg: "Check-In aprobado", checkIn });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al aprobar Check-In" });
    }
  }

  public async ownerConfirm(req: Request, res: Response) {
    try {
      const id = Number(req.params.id_checkin);
      const { checkin } = getModels();
      const checkIn = await checkin.findByPk(id);

      if (!checkIn) {
        return res.status(404).json({ msg: "Check-In no existe" });
      }

      await new CheckIn().ownerConfirm(id);

      const server = Server.instance;
      server.io.emit("checkin-confirmado-por-propietario", {
        msg: `Check-in de ${checkIn.getDataValue(
          "guest_name"
        )} ${checkIn.getDataValue("guest_lastname")} confirmado`,
        checkIn,
      });

      return res.json({ msg: "Check-In confirmado por propietario", checkIn });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al confirmar Check-In" });
    }
  }

  public async changeStatus(req: Request, res: Response) {
    try {
      const { id_checkin } = req.params;
      const { new_status } = req.body;

      const { checkin } = getModels();
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
      const { id_country } = req.params;
      const { checkin, user } = getModels();
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
      const { id_country } = req.params;
      const { checkin, user } = getModels();
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
      const { id_country } = req.params;
      const responseArray: any[] = [];
      const { checkin, checkout } = getModels();
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

  public async getCheckOutFalse(req: Request, res: Response) {
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
      const { id_owner } = req.params;
      const { checkin } = getModels();
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
      const { id_owner } = req.params;
      const TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0, 0);
      const NOW = new Date();
      NOW.setHours(23, 59, 59, 999);

      const { checkin, user } = getModels();
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

