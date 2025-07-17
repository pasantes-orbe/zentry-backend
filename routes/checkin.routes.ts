import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import CheckInController from "../controller/checkin.controller"; 
import countryExists from "../middlewares/customs/countryExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import checkinController from "../controller/checkin.controller";
import { CheckoutInterface } from "../interfaces/checkout.interface";


const router = Router();
//const checkinController = new CheckInController(); // instancia

router.post('/', [
    check('guest_name', "Campo 'guest_name' es obligatorio").notEmpty(),
    check('guest_lastname', "Campo 'guest_lastname' es obligatorio").notEmpty(),
    check('DNI', "Campo 'DNI' es obligatorio").notEmpty(),
    check('DNI', "Campo 'DNI' debe ser numérico").isNumeric(),
    check('id_owner', "Campo 'id_owner' es obligatorio").notEmpty(),
    check('id_owner', "Campo 'id_owner' debe ser numérico").isNumeric(),
    check('income_date', "Campo 'income_date' es obligatorio").notEmpty(),
    check('id_owner').custom(userExists),
    check('id_country').custom(countryExists),
    check('id_country', "Campo id_country es obligatorio").notEmpty(),
    noErrors
], checkinController.create);

router.patch('/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkinController.approve);

router.patch('/changeStatus/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkinController.changeStatus);

router.patch('/confirm/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkinController.ownerConfirm);

router.patch('/checkout/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkinController.checkOutConfirmed);

router.get('/approved/:id_country', [
    check('id_country', "Parámetro 'id_country' es obligatorio").notEmpty(),
    check('id_country', "Parámetro 'id_country' debe ser numérico").isNumeric(),
    noErrors
], checkinController.getApproved);

router.get('/registers/:id_country', [
    check('id_country', "Parámetro 'id_country' es obligatorio").notEmpty(),
    check('id_country', "Parámetro 'id_country' debe ser numérico").isNumeric(),
    noErrors
], checkinController.getRegisters);

router.get('/confirmed/:id_country', [
    check('id_country', "Parámetro 'id_country' es obligatorio").notEmpty(),
    check('id_country', "Parámetro 'id_country' debe ser numérico").isNumeric(),
    noErrors
], checkinController.getConfirmedByOwner);

router.get('/checkout', checkinController.getCheckOutFalse);

router.get('/get_by_owner/:id_owner', [
    check('id_owner', "Parámetro 'id_owner' es obligatorio").notEmpty(),
    check('id_owner', "Parámetro 'id_owner' debe ser numérico").isNumeric(),
    noErrors
], checkinController.getByOwner);

router.get('/getAllToday/:id_owner', [
    check('id_owner', "Parámetro 'id_owner' es obligatorio").notEmpty(),
    check('id_owner', "Parámetro 'id_owner' debe ser numérico").isNumeric(),
    noErrors
], checkinController.getcheckInsToday);

export default router;


/*15/7/25import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import countryExists from "../middlewares/customs/countryExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const checkin_controller: checkInController = new checkInController();

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

router.patch('/:id_checkin', [
    check('id_checkin', "Parámetro 'id_checkin' es obligatorio").notEmpty(),
    check('id_checkin', "Parámetro 'id_checkin' debe ser numérico").isNumeric(),
    noErrors
], checkin_controller.approve );

router.patch('/changeStatus/:id_checkin', checkin_controller.changeStatus );

router.patch('/confirm/:id_checkin', [
    noErrors
], checkin_controller.ownerConfirm );

router.patch('/checkout/:id_checkin', [
    noErrors
], checkin_controller.checkOutConfirmed);

router.get('/approved/:id_country',[
    check('id_country', "Parámetro 'id_country' es obligatorio").notEmpty(),
    check('id_country', "Parámetro 'id_country' debe ser numérico").isNumeric(),
    noErrors
], checkin_controller.getApproved,)

router.get('/registers/:id_country', checkin_controller.getRegisters)
router.get('/confirmed/:id_country', checkin_controller.getConfirmedByOwner)
router.get('/checkout', checkin_controller.getCheckOutFalse)
router.get('/get_by_owner/:id_owner', checkin_controller.getByOwner)
router.get('/getAllToday/:id_owner', checkin_controller.getcheckInsToday)

export default router;*/