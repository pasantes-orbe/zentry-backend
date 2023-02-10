import { Request, Response, Router } from "express";
import { check } from "express-validator";
import InvitationController from "../controller/invitation.controller";


const router = Router();
const invitation = new InvitationController();

router.post('/', invitation.create);
router.get('/:id_reservation', invitation.getInvitations);

export default router;