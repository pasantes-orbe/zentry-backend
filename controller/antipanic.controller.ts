import { Request, Response } from "express";
import AntipanicModel from "../models/antipanic.model";
import User from "../models/user.model";

class AntipanicController {

    public async getAll(req: Request, res: Response) {

        const registroAntipanicos = await AntipanicModel.findAll({
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

        const {id_owner, address, id_country} = req.body;
        const state = true;

        try {
            const antipanic = new AntipanicModel({
            ownerId: id_owner,
            address,
            state,
            id_country
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
        const {id_guard, details} = req.body


        const alertAntipanic = await AntipanicModel.findByPk(id)

        if(!alertAntipanic){
            res.json({
                msg: "El id de la alarma antipanico no es correcto",
            }
            )
        } else{

            const antipanicUpdated = await alertAntipanic.update({
                guardId: id_guard,
                details
            })

            res.json({
                msg: "Estado cambiado correctamente",
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
                details
            })


            res.json({
                msg: "Estado cambiado correctamente",
                antipanic: antipanicUpdated
            }
            )

        }

        

    }



}


export default AntipanicController