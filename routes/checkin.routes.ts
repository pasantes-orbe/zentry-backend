import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const checkin_controller: checkInController = new checkInController();

/**
 * Create Check-In
 */
router.post('/', [

    check('guest_name', "Campo 'guest_name' es obligatorio" ).notEmpty(),
    check('guest_lastname', "Campo 'guest_lastname' es obligatorio").notEmpty(),
    check('DNI', "Campo 'DNI' es obligatorio").notEmpty(),
    check('DNI', "Campo 'DNI' debe ser numérico").isNumeric(),

    check('id_owner', "Campo 'id_owner' es obligatorio").notEmpty(),
    check('id_owner', "Campo 'id_owner' debe ser numérico").isNumeric(),
    
    check('income_date', "Campo 'income_date' es obligatorio").notEmpty(),

    //TODO: Hay que controlar que solo sea propietario y no USER
    check('id_owner').custom(userExists),

    noErrors
], checkin_controller.create);

/**
 * Turn to TRUE checkin
 */
router.patch('/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkin_controller.approve );

/**
 * Get All "check_in" Approved
 */
router.get('/approved', checkin_controller.getApproved)
/**
 * Get All "confirmed_by_owner" in true
 */
router.get('/confirmed', checkin_controller.getConfirmedByOwner)
/**
 * Get by owner ID
 */
router.get('/get_by_owner/:id_owner', checkin_controller.getByOwner)


export default router;