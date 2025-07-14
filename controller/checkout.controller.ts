/*12-7-25
import { Request, Response } from "express";
import CheckIn from "../classes/CheckIn";
import CheckInModel from "../models/checkin.model";
import CheckOutModel from "../models/checkout.model";
import Server from "../models/server";

class checkOutController {

    public async create(req: Request, res: Response){

        const { id_checkin, details } = req.body

        const checkout_exists = await CheckOutModel.findOne({
            where: {
                id_checkin
            }
        });

        if(checkout_exists){
            return res.status(400).send({
                msg: `Este check-out ya está registrado`
            })
        }

        const checkout = new CheckOutModel(req.body);
        const ck = await checkout.save();

        const data = await CheckOutModel.findByPk(ck.id, {
            include: [CheckInModel]
        });
        const server = Server.instance;
        server.io.emit('notificar-checkout', {msg:`Check-Out de ${data.checkin.guest_name} ${data.checkin.guest_lastname} registrado
        - Detalles: ${data.details}` , data});

        return res.send({
            msg: "Checkout registrado con éxito",
            data
        })

    }

}

export default checkOutController*/

import { Request, Response } from "express";
import CheckOutModel from "../models/checkout.model";
import CheckInModel from "../models/checkin.model";
import Server from "../models/server";
import { CheckoutInterface } from "../interfaces/checkout.interface";

class checkOutController {
    public async create(req: Request, res: Response) {
        const { idCheckin, observation } = req.body;

        try {
            const checkout_exists = await CheckOutModel.findOne({
                where: { idCheckin }
            });

            if (checkout_exists) {
                return res.status(400).json({
                    msg: "Este check-out ya está registrado",
                });
            }

            // Creo el checkout con la interfaz para tipado
            const checkout: CheckoutInterface = await CheckOutModel.create({
                idCheckin,
                observation,
                date: new Date().toISOString()
            });

            // Busco con la relación para el socket
            const data = await CheckOutModel.findByPk(checkout.id, {
                include: [{ model: CheckInModel, as: "checkin" }]
            });

            // Emito evento socket
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
