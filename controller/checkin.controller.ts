import { Request, Response } from "express";
import { check } from "express-validator";
import CheckIn from "../classes/CheckIn";
import Guard from "../classes/Guard";
import CheckInModel from "../models/checkin.model";
import Server from "../models/server";
import User from "../models/user.model";

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

        // Emitir socket
        const server = Server.instance;
        server.io.emit('notificar-checkin', {msg: `${guest_lastname} ${guest_name} está solicitando check-in`, checkIn});

        return res.send({
            msg: "Check-In registrado exitosamente",
            checkIn
        });

    }

    public async approve(req: Request, res: Response){

        const { id_checkin } = req.params;
        
        const update = await new CheckIn().approve(+id_checkin);

        if(!update){
            return res.status(400).send({
                msg: "Check-in no existe o no fue aprobado por el propietario"
            })
        }

        // Emitir socket TODO: Debería enviarle SOLO al propietario que le interesa la notificación.
        const server = Server.instance;
        server.io.emit('checkin-aprobado', {msg: `Check-in de ${update.guest_lastname} ${update.guest_name} aprobado`, update});

        res.send(update);

    }

    public async ownerConfirm(req: Request, res: Response){

        const { id_checkin } = req.params;
        
        const update = await new CheckIn().ownerConfirm(+id_checkin);

        if(!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        }

        // Emitir socket TODO: Debería enviarle solo a los guardias esta notificación
        const server = Server.instance;
        server.io.emit('checkin-confirmado-por-propietario', {msg: `Check-in de ${update.guest_name} ${update.guest_lastname} confirmado`, update});

        res.send({
            msg: "Check-in confirmado",
            update
        });

    }

    public async getApproved(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                check_in: true
            },
            include: [User]
        })

        res.send(checkins);

    }
    public async getConfirmedByOwner(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                confirmed_by_owner: true
            },
            include: [User]
        })

        res.send(checkins);

    }

    public async getByOwner(req: Request, res: Response){

        const { id_owner } = req.params;

        const checkins = await CheckInModel.findAll({
            where: {
                id_owner
            },
            include: [{all:true}]
        })

        return res.send(checkins);

    }

}

export default checkInController