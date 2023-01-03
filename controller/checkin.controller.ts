import { Request, Response } from "express";
import CheckInModel from "../models/checkin.model";

class checkInController {

    public create(req: Request, res: Response){

        const {
            guest_name,
            guest_lastname,
            dni,
            income_date,
            transport,
            patent,
            details,
            id_guard,
            id_owner,
            confirmed_by_owner
        } = req.body

        //TODO: Cuando "confirmed_by_owner" no venga en la request hacerlo FALSE

        if(!confirmed_by_owner){
            req.body.confirmed_by_owner = false
        } else {
            req.body.confirmed_by_owner = true
        }

        //TODO: id_guard debe ser numérico, controlarlo

        return res.send(req.body);

        // const newCheckin = new CheckInModel()

    }

}

export default checkInController