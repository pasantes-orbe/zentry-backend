import { Router } from "express";
import { check } from "express-validator";
import PropertyController from "../controller/property.controller";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const property: PropertyController = new PropertyController();

/**
 * Get All
 */
router.get('/', isAdmin, property.getAll);

router.get('/:id_country/:search', [
    check('id_country', "El campo 'id_country' no debe estar vacío").notEmpty(),
    check('id_country', "El campo 'id_country' debe ser numérico").isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
] , property.search);


/**
 * Get All By Country
 */
router.get('/country/get_by_id/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    noErrors
], property.getByCountry)


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

router.patch("/:id", [
    check('id').notEmpty(),
    check('id').custom(propertyExists)
], property.update)



export default router;