// controller/invitation.controller.ts
import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models";

// Desestructuramos el modelo invitation del objeto 'db' con el nombre correcto
const { invitation } = db;

class InvitationController {

    public async create(req: Request, res: Response) {
        try {
            const { guests: guestArr } = req.body;
            const { id_reservation } = req.params;

            if (!guestArr || !Array.isArray(guestArr) || guestArr.length === 0) {
                return res.status(400).json({ msg: "El arreglo de invitados está vacío o es inválido" });
            }

            // Mapeo con fullname corregido (nombre + apellido en orden común)
            const guests = guestArr.map(guest => ({
                ...guest,
                id_reservation,
                fullname: `${guest.guest_name} ${guest.guest_lastname}`.trim()
            }));

            const invitations = await invitation.bulkCreate(guests);

            return res.status(201).json({ msg: "Invitados agregados con éxito", invitations });
        } catch (error) {
            console.error("Error en create InvitationController:", error);
            return res.status(500).json({ msg: "Error al agregar invitados" });
        }
    }

    public async getInvitations(req: Request, res: Response) {
        try {
            const { id_reservation } = req.params;

            if (!id_reservation) {
                return res.status(400).json({ msg: "id_reservation es obligatorio" });
            }

            const invitations = await invitation.findAll({
                where: { id_reservation }
            });

            return res.status(200).json(invitations);
        } catch (error) {
            console.error("Error en getInvitations InvitationController:", error);
            return res.status(500).json({ msg: "Error al obtener las invitaciones" });
        }
    }

}

export default InvitationController;