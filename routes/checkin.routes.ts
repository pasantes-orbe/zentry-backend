import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import countryExists from "../middlewares/customs/countryExists.middleware";
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

    check('id_country').custom(countryExists),
    check('id_country', "Campo id_country es obligatorio").notEmpty(),


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
 * Get by owner ID
 */

router.patch('/changeStatus/:id_checkin', checkin_controller.changeStatus );

/**
 * Turn to TRUE confirmed_by_owner
 */
router.patch('/confirm/:id_checkin', [
    noErrors
], checkin_controller.ownerConfirm );

/**
 * Turn to TRUE checkOut
 */
router.patch('/checkout/:id_checkin', [
    noErrors
], checkin_controller.checkOutConfirmed);
/**
 * Get All "check_in" Approved
 */
router.get('/approved/:id_country',[
    check('id_country', "Parámetro 'id_country' es obligatorio").notEmpty(),
    check('id_country', "Parámetro 'id_country' debe ser numérico").isNumeric(),
    noErrors
], checkin_controller.getApproved,)

/**
 * Get All "registers" in true
 */
router.get('/registers/:id_country', checkin_controller.getRegisters)

/**
 * Get All "confirmed_by_owner" in true
 */

router.get('/confirmed/:id_country', checkin_controller.getConfirmedByOwner)

/**
 * Get All "check_out" in true
 */

router.get('/checkout', checkin_controller.getCheckOutFalse)

/**
 * Get by owner ID
 */
router.get('/get_by_owner/:id_owner', checkin_controller.getByOwner)

/**
 * Get all today by owner ID
 */

router.get('/getAllToday/:id_owner', checkin_controller.getcheckInsToday)


export default router;