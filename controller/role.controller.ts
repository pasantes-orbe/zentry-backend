import { Request, Response } from "express";
import Role from "../models/roles.model";

class RoleController {

    public async getAll(req: Request, res: Response) {
        const roles = await Role.findAll();
        res.json(roles);
    }

    public async getByID(req: Request, res: Response) {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (role) {
            return res.json(role);
        }
        res.status(404).json({
            msg: `No existe rol con el id ${id}`,
        });
    }

    public async create(req: Request, res: Response) {
        const { body } = req;
        body.name = body.name.toLowerCase();
        try {
            const role = await Role.create(body);
            res.json({
                msg: "El rol se creo con exito",
                role
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo crear el rol, intente de nuevo."
            })
        }
    }
}

export default RoleController;