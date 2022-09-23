import { Router } from "express";
import { check } from "express-validator";
import RecurrentController from "../controller/recurrent.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const recurrent: RecurrentController = new RecurrentController();

//TODO: ADMIN only
router.get('/', recurrent.getAll);

//TODO: ADMIN only
router.get('/:id', recurrent.getByID);

router.post('/', [
    check('id_property', 'El id de propiedad es obligatorio').notEmpty(),
    check('guest_name', 'El nombre del invitado es obligatorio').notEmpty(),
    check('guest_lastname', 'El apellido del invitado es obligatorio').notEmpty(),
    check('dni', 'El dni del invitado es obligatorio').notEmpty(),
    noErrors
], recurrent.create);


export default router;