import { Request, Response } from "express";
import { check } from "express-validator";
import CheckIn from "../classes/CheckIn";
import Guard from "../classes/Guard";
import CheckInModel from "../models/checkin.model";

class checkInController {

    public async create(req: Request, res: Response){

        const {
            guest_name,
            guest_lastname,
            DNI,
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

        if(patent){
            req.body.patent = req.body.patent.toUpperCase();
        }

        if(req.body.id_guard){

            const guard = await new Guard().exists(id_guard);
            // SI NO ES UN id_guard CORRESPONDIENTE A UN GUARDIA O INVÁLIDO lo tomará como NULL
            if(!guard){
                console.log("--------Guardia no existe--------");
                req.body.id_guard = null
            }

        }

        req.body.check_in = false;

        const checkIn = new CheckInModel(req.body);
        checkIn.save();

        return res.send({
            msg: "Check-In registrado exitosamente",
            checkIn
        });

    }

    public async approve(req: Request, res: Response){

        const { id_checkin } = req.params;
        
        const update = await new CheckIn().approve(+id_checkin);

        res.send(update);

    }

    public async getApproved(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                check_in: true
            }
        })

        res.send(checkins);

    }
    public async getConfirmedByOwner(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                confirmed_by_owner: true
            }
        })

        res.send(checkins);

    }

    public async getByOwner(req: Request, res: Response){

        const { id_owner } = req.params;

        const checkins = await CheckInModel.findAll({
            where: {
                id_owner
            }
        })

        return res.send(checkins);

    }

}

export default checkInController