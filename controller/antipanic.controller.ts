// controller/antipanic.controller.ts
import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models";
import Server from "../models/server";

// Desestructuramos los modelos necesarios del objeto 'db' con los nombres correctos
const { antipanic, user } = db;

class AntipanicController {
    public async getAllByCountry(req: Request, res: Response) {
        const { id_country } = req.params;

        try {
            const registroAntipanicos = await antipanic.findAll({
                where: { id_country },
                include: [
                    { model: user, as: 'owner' },
                    { model: user, as: 'guard' }
                ]
            });

            res.json(registroAntipanicos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener registros" });
        }
    }

    public async newAntipanic(req: Request, res: Response) {
        const { id_owner, address, id_country, propertyNumber } = req.body;
        const state = true;

        try {
            const newAntipanic = await antipanic.create({
                ownerId: id_owner, // este campo debe coincidir con el definido en el modelo
                address,
                state,
                id_country,
                propertyNumber
            });

            const server = Server.instance;
            server.io.emit('new-antipanic', {
                msg: `Nuevo antipánico activado en el country ${id_country}`,
                antipanic: newAntipanic
            });

            res.json({
                msg: "Antipánico activado",
                antipanic: newAntipanic
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                msg: "No se pudo crear el registro, intente de nuevo."
            });
        }
    }

    public async guardConfirm(req: Request, res: Response) {
        const { id } = req.params;
        const { guardId, details, finishAt } = req.body;

        try {
            const alertAntipanic = await antipanic.findByPk(id);

            if (!alertAntipanic) {
                return res.status(404).json({ msg: "El id no es válido" });
            }

            const antipanicUpdated = await alertAntipanic.update({
                guardId,
                details,
                state: false,
                finishAt
            });

            res.json({
                msg: "Antipánico actualizado correctamente",
                antipanic: antipanicUpdated
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al actualizar el antipanico" });
        }
    }

    public async desactivateAntipanic(req: Request, res: Response) {
        const { id } = req.params;
        const { details } = req.body;

        try {
            const alertAntipanic = await antipanic.findByPk(id);

            if (!alertAntipanic) {
                return res.status(404).json({ msg: "El id no es válido" });
            }

            const antipanicUpdated = await alertAntipanic.update({
                state: false,
                details
            });

            res.json({
                msg: "Estado actualizado correctamente",
                antipanic: antipanicUpdated
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al actualizar el estado" });
        }
    }
}

export default AntipanicController;



/* 15/7/25
import { Request, Response } from "express";
import AntipanicModel from "../models/antipanic.model";
import User from "../models/user.model";

class AntipanicController {
    public async getAllByCountry(req: Request, res: Response) {
        const {id_country} = req.params
        const registroAntipanicos = await AntipanicModel.findAll({
        where: {
            id_country
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
        res.json(registroAntipanicos);
    }

    public async newAntipanic(req: Request, res: Response){

        const {id_owner, address, id_country, propertyNumber} = req.body;
        const state = true;
        try {
            const antipanic = new AntipanicModel({
            ownerId: id_owner,
            address,
            state,
            id_country,
            propertyNumber
        })
            const antipanicGuardado = await antipanic.save();
            res.json({
                msg: "Antipanico activado",
                antipanic: antipanicGuardado,
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo crear el rol, intente de nuevo."
            })
        }
    }

    public async guardConfirm(req: Request, res: Response){
        const {id} = req.params
        const {guardId, details, finishAt} = req.body
        const alertAntipanic = await AntipanicModel.findByPk(id)

        if(!alertAntipanic){
            res.json({
                msg: "El id de la alarma antipanico no es correcto",
            }
            )
        } else{
            const antipanicUpdated = await alertAntipanic.update({
                guardId,
                details,
                state: false,
                finishAt
            })
            res.json({
                msg: "Antipanico actualizado correctamente",
                antipanic: antipanicUpdated
            }
            )
        }
    }


    public async desactivateAntipanic(req: Request, res: Response){
        const {id} = req.params
        const {details} = req.body
        const alertAntipanic = await AntipanicModel.findByPk(id)
        if(!alertAntipanic){
            res.json({
                msg: "El id de la alarma antipanico no es correcto",
            }
            )
        } else {

            const antipanicUpdated = await alertAntipanic.update({
                state: false,
                details,
            })
            res.json({
                msg: "Estado cambiado correctamente",
                antipanic: antipanicUpdated,
            }
            )
        }
    }
}

export default AntipanicController*/