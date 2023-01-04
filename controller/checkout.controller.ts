import { Request, Response } from "express";
import CheckIn from "../classes/CheckIn";
import CheckOutModel from "../models/checkout.model";

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
        checkout.save();

        return res.send({
            msg: "Checkout registrado con éxito"
        })

    }

}

export default checkOutController