import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models"; 

// Desestructuramos el modelo role
const { role } = db;

class RoleController {

    public async getAllRoles(req: Request, res: Response) {
        try {
            // Se usa el modelo 'role' para buscar todos los registros
            const roles = await role.findAll();
            res.json(roles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener todos los roles." });
        }
    }

    // Se cambió el nombre de la función a 'getRoleById' para mayor claridad
    public async getRoleById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            // Se usa el modelo 'role' para buscar por clave primaria
            const foundRole = await role.findByPk(id);
            if (foundRole) {
                // Se retorna la variable 'foundRole' en vez de 'role' (el modelo)
                return res.json(foundRole);
            }
            res.status(404).json({
                msg: `No existe rol con el id ${id}`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener el rol por ID." });
        }
    }

    // Se cambió el nombre de la función a 'createRole' para mayor claridad
    public async createRole(req: Request, res: Response) {
        const { body } = req;
        // Si el nombre existe, lo convertimos a minúsculas
        if (body.name) {
            body.name = body.name.toLowerCase();
        }
        
        try {
            // Se usa el modelo 'role' en minúscula para la creación
            const newRole = await role.create(body);
            res.status(201).json({
                msg: "El rol se creó con éxito",
                newRole // Se retorna la nueva variable 'newRole'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                msg: "No se pudo crear el rol, intente de nuevo."
            });
        }
    }
}

export default RoleController;