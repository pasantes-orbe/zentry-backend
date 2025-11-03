// controller/user_properties.controller.ts
import { Request, Response } from "express";
import { getModels } from "../models/getModels"; 

class UserPropertiesController {

    /**
     * POST /api/user-properties
     * Asigna un propietario a una propiedad creando un registro en la tabla intermedia.
     */
    public async assignProperty(req: Request, res: Response) {
        // Los IDs que esperamos del frontend para hacer la asignación
        const { id_user, id_property } = req.body; 

        if (!id_user || !id_property) {
            return res.status(400).json({ msg: "Faltan los campos id_user o id_property." });
        }

        try {
            const { user_properties } = getModels();
            // 1. Verificar si la asignación ya existe para evitar duplicados.
            const existingAssignment = await user_properties.findOne({
                where: { id_user, id_property }
            });

            if (existingAssignment) {
                return res.status(400).json({ 
                    msg: "Este propietario ya está asignado a esta propiedad.",
                    assignment: existingAssignment 
                });
            }

            // 2. Crear la nueva asignación en la tabla user_properties
            const newAssignment = await user_properties.create({
                id_user,
                id_property
            });

            return res.status(201).json({
                msg: "Propietario asignado a la propiedad con éxito.",
                assignment: newAssignment
            });

        } catch (error) {
            console.error("Error al asignar propiedad:", error);
            res.status(500).json({ msg: "Error interno del servidor al asignar la propiedad." });
        }
    }
}

export default UserPropertiesController;