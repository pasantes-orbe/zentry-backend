// controllers/checkout.controller.ts

import { Request, Response } from "express";
import CheckOutModel from "../models/checkout.model";
import CheckInModel from "../models/checkin.model";
import Server from "../models/server";
import { CheckoutInterface } from "../interfaces/checkout.interface";

class checkOutController {
  public async create(req: Request, res: Response) {
    const { id_checkin, observation } = req.body;

    try {
      const checkout_exists = await CheckOutModel.findOne({
        where: { id_checkin }
      });

      if (checkout_exists) {
        return res.status(400).json({
          msg: "Este check-out ya está registrado",
        });
      }

      const checkout: CheckoutInterface = await CheckOutModel.create({
        id_checkin,
        observation,
        date: new Date().toISOString()
      });

      const data = await CheckOutModel.findByPk(checkout.id, {
        include: [{ model: CheckInModel, as: "checkin" }]
      });

      const server = Server.instance;
      server.io.emit("notificar-checkout", {
        msg: `Check-Out registrado - Detalles: ${checkout.observation}`,
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
