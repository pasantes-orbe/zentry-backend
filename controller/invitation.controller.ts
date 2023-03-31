import { Request, Response } from "express";
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

export default InvitationController;