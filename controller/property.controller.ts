/*import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Op, Sequelize } from "sequelize";
import Uploader from "../classes/Uploader";
import Property from "../models/property.model";
import UserProperties from "../models/user_properties.model";

class PropertyController {

    public async getAll(req: Request, res: Response) {

        const properties = await Property.findAll();
        res.json(properties);

    }

    public async search(req: Request, res: Response) {

        const { search } = req.params;

        if (!Number.isInteger(+search)) {

            const properties = await Property.findAll({
                where: {
                    id_country: req.params.id_country,
                    name: { [Sequelize.Op.iLike]: `%${String(req.params.search)}%` }
                }
            });

            return res.json(properties);

        }

        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country,
                number: search
            }
        });
        return res.json(properties);

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

        if (propertyNumber) {
            return res.status(400).send({
                msg: `Ya existe una propiedad con el N° ${body.number}`
            })
        }

        try {

            const { tempFilePath }: any = req.files?.avatar;
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

    public async getByCountry(req: Request, res: Response) {


        // Obtiene todas las propiedades
        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country
            }
        });

        // Crea una promesa por cada iteración del map para que lea los valores asíncronos.
        const response = await Promise.all(
            properties.map(async (property) => {

                const owners = await UserProperties.findAll({
                    where: { id_property: property.id }
                })

                return {
                    property,
                    owners
                };
            })
        )
        return res.json(response);
    }

    public async update(req: Request, res: Response) {
        const { name, number, address } = req.body;
        let avatar = req.files?.avatar;
        let avatarEdit: string = "";
        const { id } = req.params;

        const property = await Property.findOne({
            where: { "id_country": id }
        });
        
        try {

            if (avatar) {
                const { tempFilePath }: any = req.files?.avatar;
                const { secure_url } = await new Uploader().uploadImage(tempFilePath);
                avatarEdit = secure_url;
            }

            console.log(avatar);

            const property_update = await Property.update({
                name,
                number,
                address,
                avatar: avatarEdit
            }, { where: { id } });
    
            
            return res.json({
                msg: "Actualizado correctamente",
            })
            
        } catch (error) {

            return res.status(500).send({
                msg: "Error en el servidor",
                error
            })
            
        }

        

    }


    public async delete(req: Request, res: Response){

        const { id } = req.params;

        try {

            const deleted = await Property.destroy({
                where: { id }
            });

            return res.json({
                msg: "Eliminado correctamente"
            });

        } catch (error) {
            return res.status(500).send(error);
        }

    }

}

export default PropertyController;*/

import { Request, Response } from "express";
import { Op } from "sequelize";
import Uploader from "../classes/Uploader";
import Property from "../models/property.model";
import UserProperties from "../models/user_properties.model";

class PropertyController {

    public async getAll(req: Request, res: Response) {
        const properties = await Property.findAll();
        res.json(properties);
    }

    public async search(req: Request, res: Response) {
        const { search } = req.params;

        if (!Number.isInteger(+search)) {
            const properties = await Property.findAll({
                where: {
                    id_country: req.params.id_country,
                    name: { [Op.iLike]: `%${String(search)}%` }
                }
            });

            return res.json(properties);
        }

        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country,
                number: search
            }
        });

        return res.json(properties);
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
                number: body.number,
                id_country: body.id_country
            }
        });

        if (propertyNumber) {
            return res.status(400).send({
                msg: `Ya existe una propiedad con el N° ${body.number}`
            });
        }

        try {
            const { tempFilePath }: any = req.files?.avatar;
            const { secure_url } = await new Uploader().uploadImage(tempFilePath);

            body['avatar'] = secure_url;

            const property = await Property.create(body);

            res.json({
                msg: "La propiedad se creó con éxito",
                property
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo crear la propiedad, intente de nuevo."
            });
        }
    }

    public async getByCountry(req: Request, res: Response) {
        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country
            }
        });

        const response = await Promise.all(
            properties.map(async (property) => {
                const owners = await UserProperties.findAll({
                    where: { id_property: property.get('id') }
                });

                return {
                    property,
                    owners
                };
            })
        );

        return res.json(response);
    }

    public async update(req: Request, res: Response) {
        const { name, number, address } = req.body;
        let avatar = req.files?.avatar;
        let avatarEdit: string = "";
        const { id } = req.params;

        try {
            if (avatar) {
                const { tempFilePath }: any = req.files?.avatar;
                const { secure_url } = await new Uploader().uploadImage(tempFilePath);
                avatarEdit = secure_url;
            }

            await Property.update({
                name,
                number,
                address,
                avatar: avatarEdit
            }, { where: { id } });

            return res.json({
                msg: "Actualizado correctamente",
            });

        } catch (error) {
            return res.status(500).send({
                msg: "Error en el servidor",
                error
            });
        }
    }

    public async delete(req: Request, res: Response) {
        const { id } = req.params;

        try {
            await Property.destroy({
                where: { id }
            });

            return res.json({
                msg: "Eliminado correctamente"
            });

        } catch (error) {
            return res.status(500).send(error);
        }
    }

}

export default PropertyController;
