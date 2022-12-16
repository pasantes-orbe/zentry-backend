import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import OwnerCountry from "../models/owner_country.model";
import Property from "../models/property.model";
import User from "../models/user.model";
import UserProperties from "../models/user_properties.model";

const router = Router();

/**
 * Get All
 */
router.get('/', async(req: Request, res: Response) => {
    const keys = await UserProperties.findAll();
    return res.json(keys);
});

/**
 * Get Property by Owner ID
 */
router.get('/:id_owner', [

    check('id_owner').custom(userExists),
    noErrors
], async (req: Request, res: Response) => {

    const property = await UserProperties.findOne({
        where: {
            id_user: req.params.id_owner
        }
    })

    return res.json(property);

});

/**
 * Get All By Country
 */

router.get('/country/get_by_id/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {

    const owners = await UserProperties.findAll();

    const owners_by_country = owners.filter( (owner) => {
        return owner.property.id_country == req.params.id_country;
    })

    return res.json(owners_by_country);
});


/**
 * Relation with property
 */
router.post('/', [
    check('id_user', "Id de usuario obligatorio").notEmpty(),
    check('id_user', "El id de usuario debe ser numerico").isNumeric(),
    check('id_user').custom(userExists),
    check('id_property', "Id de propiedad obligatorio").notEmpty(),
    check('id_property', "El id de propiedad debe ser numerico").isNumeric(),
    check('id_property').custom(propertyExists),
    noErrors
] , async(req: Request, res: Response) => {
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);
    const key = new UserProperties(req.body);
    key.save();
    return res.json(key);
});

/**
 * ASSIGN COUNTRY
 */
router.post('/assign', [
    check('id_user', "Id de usuario obligatorio").notEmpty(),
    check('id_user', "El id de usuario debe ser numerico").isNumeric(),
    check('id_user').custom(userExists),
    check('id_country', "Id de country obligatorio").notEmpty(),
    check('id_country', "El id de country debe ser numerico").isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async(req: Request, res: Response) => {
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);

    if(!isOwnerRole){
        return res.status(400).send({
            msg: "No es un usuario propietario"
        })
    }

    const alreadyExists = await OwnerCountry.findAll({
        where: {
            id_user: req.body.id_user,
            id_country: req.body.id_country
        }
    })

    if(alreadyExists){
        return res.status(400).send({
            msg: "Este propietario ya tiene asignado un country"
        })
    }

    const ownerCountry = new OwnerCountry(req.body);
    ownerCountry.save();
    return res.json(ownerCountry);
} );





export default router;