import { Request, Response } from "express";
import Uploader from "../classes/Uploader";
import Property from "../models/property.model";

class PropertyController {

    public async getAll(req: Request, res: Response) {

        const properties = await Property.findAll();
        res.json(properties);

    }

    public async getByID(req: Request, res: Response) {

        const { id } = req.params;

        const property = await Property.findByPk(id);

        if (property) {
            return res.json(property);
        }

        res.status(404).json({
            msg: `No existe la propiedad con el id ${id}`,
        });

    }

    public async create(req: Request, res: Response) {

        const { body } = req;

        const propertyNumber = await Property.findOne({
            where: {
                "number": body.number,
                "id_country": body.id_country
            }
        })

        if(propertyNumber){
            return res.status(400).send({
                msg: `Ya existe una propiedad con el N° ${body.number}`
            })
        }

        try {

            const { tempFilePath } = req.files?.avatar;
            const { secure_url } = await new Uploader().uploadImage(tempFilePath);

            body['avatar'] = secure_url;

            const property = new Property(body);
            await property.save();
            
            res.json({
                msg: "La propiedad se creo con exito",
                property
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo crear la propiedad, intente de nuevo."
            })
        }
    }

}

export default PropertyController;