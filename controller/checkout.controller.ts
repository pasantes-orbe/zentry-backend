// controller/checkout.controller.ts
import { Request, Response } from "express";
import db from "../models";
import Server from "../models/server";
import { Model, ModelStatic } from "sequelize";
import { CheckoutInterface } from "../interfaces/checkout.interface";

// ---------- Helpers ----------
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);

// ---------- Modelos (tipado laxo) ----------
const CheckoutModel = db.checkout as unknown as ModelStatic<Model<any, any>>;
const CheckinModel  = db.checkin  as unknown as ModelStatic<Model<any, any>>;

class checkOutController {
  public async create(req: Request, res: Response) {
    const { id_checkin, observation } = req.body;

    try {
      // ¿ya existe un checkout para ese checkin?
      const checkout_exists = await CheckoutModel.findOne({
        where: { id_checkin },
      });

      if (checkout_exists) {
        return res.status(400).json({
          msg: "Este check-out ya está registrado",
        });
      }

      // crear checkout
      const newCheckout = (await CheckoutModel.create({
        id_checkin,
        observation,
        date: new Date().toISOString(),
      })) as Model<any, any>;

      // buscar con include del checkin asociado
      const data = await CheckoutModel.findByPk(getVal(newCheckout, "id"), {
        include: [{ model: CheckinModel, as: "checkin" }],
      });

      // notificar por socket
      const server = Server.instance;
      server.io.emit("notificar-checkout", {
        msg: `Check-Out registrado - Detalles: ${getVal(newCheckout, "observation")}`,
        data,
      });

      // respuesta
      return res.json({
        msg: "Checkout registrado con éxito",
        data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Error interno en el servidor",
        error,
      });
    }
  }
}

export default checkOutController;
