import { Request, Response } from "express";
import { Op } from "sequelize";
import CheckInModel from "../models/checkin.model";
import CheckOutModel from "../models/checkout.model";
import User from "../models/user.model";
import CheckIn from "../classes/CheckIn"; // Clase lógica con métodos como approve(), ownerConfirm(), etc.
import Server from "../models/server";
import Guard from "../classes/Guard";

class CheckInController {

    public async create(req: Request, res: Response) {
        try {
            // Preparar algunos valores antes de crear el registro
            if (!req.body.confirmed_by_owner) req.body.confirmed_by_owner = false;
            else req.body.confirmed_by_owner = true;

            if (!req.body.check_out) req.body.check_out = false;
            else req.body.check_out = null;

            if (req.body.patent) {
                req.body.patent = req.body.patent.toUpperCase();
            }

            if (req.body.id_guard) {
                const guardExists = await new Guard().exists(req.body.id_guard);
                if (!guardExists) {
                    console.log("--------Guardia no existe--------");
                    req.body.id_guard = null;
                }
            }

            req.body.check_in = false; // Estado inicial

            const checkIn = await CheckInModel.create(req.body);

            // Emitir socket notificando nuevo check-in
            const server = Server.instance;
            server.io.emit('notificar-checkin', { msg: `${req.body.guest_lastname} ${req.body.guest_name} está solicitando check-in`, checkIn });

            return res.json({
                msg: "Check-In registrado exitosamente",
                checkIn
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al crear Check-In" });
        }
    }

    public async approve(req: Request, res: Response) {
        try {
            const id = Number(req.params.id_checkin);
            const checkIn = await CheckInModel.findByPk(id);

            if (!checkIn) {
                return res.status(404).json({ msg: "Check-In no existe" });
            }

            // Aquí podrías llamar un método de la clase CheckIn para la lógica
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
            const checkIn = await CheckInModel.findByPk(id);

            if (!checkIn) {
                return res.status(404).json({ msg: "Check-In no existe" });
            }

            await new CheckIn().ownerConfirm(id);

            const server = Server.instance;
            server.io.emit('checkin-confirmado-por-propietario', { msg: `Check-in de ${checkIn.getDataValue('guest_name')} ${checkIn.getDataValue('guest_lastname')} confirmado`, checkIn });

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
            const checkins = await CheckInModel.findAll({
                where: { id_country, check_in: true },
                include: [User]
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
            const checkins = await CheckInModel.findAll({
                where: { confirmed_by_owner: true, check_in: false, id_country },
                include: [User]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins confirmados" });
        }
    }

    public async getRegisters(req: Request, res: Response) {
        try {
            const { id_country } = req.params;
            const responseArray: any[] = [];

            const checkins = await CheckInModel.findAll({
                where: { id_country, check_in: true }
            });

            for (const checkin of checkins) {
                const checkout = await CheckOutModel.findOne({
                    where: { id_checkin: checkin.id }
                });

                responseArray.push({ checkin, checkout });
            }

            return res.json(responseArray);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener registros" });
        }
    }

    public async getCheckOutFalse(req: Request, res: Response) {
        try {
            const checkins = await CheckInModel.findAll({
                where: { check_out: false, check_in: true, confirmed_by_owner: true },
                include: [User]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkouts pendientes" });
        }
    }

    public async getByOwner(req: Request, res: Response) {
        try {
            const { id_owner } = req.params;
            const checkins = await CheckInModel.findAll({
                where: { id_owner },
                include: [{ all: true }]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins por propietario" });
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
            const TODAY_START = new Date().setHours(0, 0, 0, 0);
            const NOW = new Date().setHours(23, 59);
            const checkins = await CheckInModel.findAll({
                where: {
                    id_owner,
                    income_date: {
                        [Op.gt]: TODAY_START,
                        [Op.lt]: NOW
                    }
                },
                include: [
                    { model: User, as: 'owner' },
                    { model: User, as: 'guard' }
                ]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins de hoy" });
        }
    }

}

export default new CheckInController();


/*import { Request, response, Response } from "express";
import { check } from "express-validator";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import CheckIn from "../classes/CheckIn";
import Guard from "../classes/Guard";
import CheckInModel from "../models/checkin.model";
import CheckOutModel from "../models/checkout.model";
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
            confirmed_by_owner,
            id_country,
            check_out
        } = req.body


        if(!confirmed_by_owner){
            req.body.confirmed_by_owner = false
        } else {
            req.body.confirmed_by_owner = true
        }

        if(!check_out){
            req.body.check_out = false
        } else {
            req.body.check_out = null
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

        
        const server = Server.instance;

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

        
        const server = Server.instance;
        server.io.emit('checkin-confirmado-por-propietario', {msg: `Check-in de ${update.guest_name} ${update.guest_lastname} confirmado`, update});

        res.send({
            msg: "Check-in confirmado",
            update
        });

    }

    public async changeStatus(req: Request, res: Response){
        
        const {id_checkin} = req.params;

        const {new_status} = req.body;

        const update = await new CheckIn().changeStatus(+id_checkin, new_status)

        if (!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        }

        res.send({
            msg: "Check-in actualizado correctamente",
            update
        });

    }

    public async getApproved(req: Request, res: Response){

        const {id_country} = req.params
        const checkins = await CheckInModel.findAll({
            where: {
                id_country,
                check_in: true
            },
            include: [User]
        })

        res.send(checkins);

    }
    public async getConfirmedByOwner(req: Request, res: Response){

        const {id_country} = req.params

        const checkins = await CheckInModel.findAll({
            where: {
                confirmed_by_owner: true,
                check_in: false,
                id_country,
            },
            include: [User]
        })

        res.send(checkins);

    }

    public async getRegisters(req: Request, res: Response){

        const responseArray: any[] = []

        const {id_country} = req.params;
        const checkins = await CheckInModel.findAll({
            where: {
                id_country,
                check_in: true
            },
        })

        for (let i=0; i< checkins.length; i++){
            const checkout = await CheckOutModel.findOne({
                where: {
                    id_checkin: checkins[i].id
                }
            })

            responseArray.push({
                checkin: checkins[i],
                checkout: checkout
            } )
        }

        res.send(responseArray);        

    }

    public async getCheckOutFalse(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                check_out: false,
                check_in: true,
                confirmed_by_owner:true
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
    public async checkOutConfirmed(req: Request, res: Response){
        const { id_checkin } = req.params;
        
        const update = await new CheckIn().checkOutConfirm(+id_checkin)
        if(!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        } 
        res.send({
            msg: "Check-out confirmado",
            update
        });
    } 
    public async getcheckInsToday(req: Request, res: Response){
        const {id_owner} = req.params;
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const NOW = new Date().setHours(23,59)
        const checkins = await CheckInModel.findAll({
            where: {
                id_owner,
                income_date: {
                    [Op.gt]: TODAY_START,
                    [Op.lt]: NOW
                }
            },
            include: [{
                model: User,
                as: 'owner'
            },
            {
                model: User,
                as: 'guard'
            }]
        })
            res.send(checkins);        
    }
}
export default checkInController*/
