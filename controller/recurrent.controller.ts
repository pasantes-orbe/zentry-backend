import { Request, Response } from "express";
import { where } from "sequelize";
import CountryModel from "../models/country.model";
import Property from "../models/property.model";
import Recurrent from "../models/recurrent.model";

class RecurrentController {

    public async getAll(req: Request, res: Response) {

        const recurrents = await Recurrent.findAll({
            include: [Property],
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

    public async getByCountry(req: Request, res: Response) {

        const country = req.params.id_country;

        const recurrent = await Recurrent.findAll({
            include: [Property]
        });

        const recurrents_by_country = recurrent.filter( (rec) => {
            return rec.property.id_country == country;
        })

        return res.json(recurrents_by_country);
        
    }

    public async getByProperty(req: Request, res: Response) {

        const id_property = req.params.id_property;

        const recurrent = await Recurrent.findAll({
            where: {
                id_property
            }
        });


        return res.json(recurrent);
        
    }

    

    public async create(req: Request, res: Response) {

        const { body } = req;

        // Chequear si no existe el recurrente a la misma propiedad por DNI
        const exists = await Recurrent.findOne({
            where: {
                dni: body.dni,
                id_property: body.id_property
            },
            include: Property
        })


        if(exists){
            return res.status(400).send({
                msg: `Ya existe un invitado recurrente con el dni ${body.dni} para el country ${exists.property.name}`,
                guest: exists
            });

        }

        // Si no existe guardarlo en la BD

        try {

            body['status']=true;
            const recurrent = new Recurrent(body);
            await recurrent.save();
            
            res.json({
                msg: "El invitado recurrente se cargo con exito",
                recurrent
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo insertar el invitado recurrente, intente de nuevo.",
                error
            })
        }
    }

    public async changeStatus(req: Request, res: Response) {
        const { id_recurrent: recurrentID } = req.params;
        const { status } = req.body;

        try {

            // const r = await Recurrent.findByPk(recurrentID);
            // await r?.update({status});

            // return res.json(r);

            const changed = await Recurrent.update({ status }, {
                where: {
                    id: recurrentID
                }
            });
            return res.json(changed);
        } catch (error) {
            return res.status(500).send(error);
        }

    }

}

export default RecurrentController;

