import { Router } from "express";
import { check } from "express-validator";
import PropertyController from "../controller/property.controller";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const property: PropertyController = new PropertyController();


router.get('/', isAdmin, property.getAll);
router.get('/:id', isAdmin, property.getByID);
router.post('/', [
    isAdmin,
    check('id_country').notEmpty(),
    check('id_country').custom(countryExists),
    check('number').notEmpty(),
    check('number').isNumeric(),
    check('address', 'La direccion es obligatoria').notEmpty(),
    noErrors
], property.create);


export default router;