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

export default checkOutController