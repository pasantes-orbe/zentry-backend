import { Router } from "express";
import { check } from "express-validator";
import RecurrentController from "../controller/recurrent.controller";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import recurrentExists from "../middlewares/customs/recurrentExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const recurrent: RecurrentController = new RecurrentController();

//TODO: ADMIN only
router.get('/', recurrent.getAll);

//TODO: ADMIN only
router.get('/:id', recurrent.getByID);
/**
 * Get Recurrents by Country
 */
router.get('/get-by-country/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    noErrors
] , recurrent.getByCountry);

router.post('/', [
    check('id_property', 'El id de propiedad es obligatorio').notEmpty(),
    check('id_property', 'El id de propiedad debe ser numerico').isNumeric(),
    check('guest_name', 'El nombre del invitado es obligatorio').notEmpty(),
    check('guest_lastname', 'El apellido del invitado es obligatorio').notEmpty(),
    check('dni', 'El dni del invitado es obligatorio').notEmpty(),
    check('id_property').custom(propertyExists),
    noErrors
], recurrent.create);

router.patch('/:id_recurrent', [
    check('id_recurrent', 'El id de recurrente debe ser numerico').isNumeric(),
    check('id_recurrent').custom(recurrentExists),
    check('status', 'El estado debe tomar valores de Verdadero o Falso').isBoolean(),
    noErrors,
] , recurrent.changeStatus)

export default router;