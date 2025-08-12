import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models";
import Server from "../models/server";
import { CheckoutInterface } from "../interfaces/checkout.interface";

// Desestructuramos los modelos necesarios del objeto 'db' con los nombres correctos
const { checkout, checkin } = db;

class checkOutController {
  public async create(req: Request, res: Response) {
    const { id_checkin, observation } = req.body;

    try {
      const checkout_exists = await checkout.findOne({
        where: { id_checkin }
      });

      if (checkout_exists) {
        return res.status(400).json({
          msg: "Este check-out ya está registrado",
        });
      }

      const newCheckout: CheckoutInterface = await checkout.create({
        id_checkin,
        observation,
        date: new Date().toISOString()
      });

      const data = await checkout.findByPk(newCheckout.id, {
        include: [{ model: checkin, as: "checkin" }]
      });

      const server = Server.instance;
      server.io.emit("notificar-checkout", {
        msg: `Check-Out registrado - Detalles: ${newCheckout.observation}`,
        data,
      });

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
