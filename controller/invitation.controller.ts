/* 15/7/25import { Request, Response } from "express";
import Invitation from "../models/invitations.model";
import Role from "../models/roles.model";

class InvitationController {
    public async create(req: Request, res: Response) {
        const { guests: guestArr } = req.body;
        const { id_reservation } = req.params;
        const guests = guestArr.map( guest => {
            guest['id_reservation'] = id_reservation;
            guest['fullname'] = guest.lastname + " " + guest.name;
            return guest
        });
        const invitations = await Invitation.bulkCreate(guests)
        return res.send({msg: "invitados agregados con exito", invitations});
    }
    public async getInvitations(req: Request, res: Response) {
        const { id_reservation } = req.params;
        const invitations = await Invitation.findAll({
            where: {
                id_reservation
            }
        })
        return res.send(invitations);
    }
}
export default InvitationController;*/


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
                fullname: `${guest.name} ${guest.lastname}`.trim()
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