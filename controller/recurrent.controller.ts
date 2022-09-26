import { Request, Response } from "express";
import Property from "../models/property.model";
import Recurrent from "../models/recurrent.model";

class RecurrentController {

    public async getAll(req: Request, res: Response) {

        const recurrents = await Recurrent.findAll({
            include: Property,
            attributes: ['id','status','guest_name','guest_lastname','dni']
        });
        res.json(recurrents);

    }

    public async getByID(req: Request, res: Response) {

        const { id } = req.params;

        const recurrent = await Recurrent.findByPk(id, {
            include: Property,
            attributes: ['id','status','guest_name','guest_lastname','dni']
        });

        if (recurrent) {
            return res.json(recurrent);
        }

        res.status(404).json({
            msg: `No existe el invitado recurrente con el id ${id}`,
        });

    }

    public async create(req: Request, res: Response) {

        const { body } = req;

        try {

            const recurrent = new Recurrent(body);
            await recurrent.save();
            
            res.json({
                msg: "El invitado recurrente se cargo con exito",
                recurrent
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo insertar el invitado recurrente, intente de nuevo."
            })
        }
    }

}

export default RecurrentController;