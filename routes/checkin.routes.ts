import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const checkin_controller: checkInController = new checkInController();

router.post('/', [

    check('guest_name', "Campo 'guest_name' es obligatorio" ).notEmpty(),
    check('guest_lastname', "Campo 'guest_lastname' es obligatorio").notEmpty(),
    check('dni', "Campo 'dni' es obligatorio").notEmpty(),
    check('dni', "Campo 'dni' debe ser numérico").isNumeric(),

    check('id_owner', "Campo 'id_owner' es obligatorio").notEmpty(),
    check('id_owner', "Campo 'id_owner' debe ser numérico").isNumeric(),
    
    check('income_date', "Campo 'income_date' es obligatorio").notEmpty(),
    

    noErrors
], checkin_controller.create);

export default router;