import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Property from "../models/property.model";
import User from "../models/user.model";
import UserProperties from "../models/user_properties.model";

const router = Router();

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
 * Get Owners By Property ID
 */
router.get('/:id_property', [

    check('id_property').isNumeric(),
    noErrors

], async (req: Request, res: Response) => {

    //TODO:
     
    // const keys = await UserProperties.findAll({
    //     where: {
    //         id
    //     }
    // })
});

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


export default router;