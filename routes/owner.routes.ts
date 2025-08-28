// routes/owner.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models"; // Importamos el objeto 'db' centralizado

// Desestructuramos los modelos necesarios
const { user_properties, owner_country, property } = db;

const router = Router();
/**
 * Get All
 */
router.get('/', async (req: Request, res: Response) => {
    // Corrección a include, as
    const keys = await user_properties.findAll({
        include: [{
            model: property,
            as: 'property'
        }]
    });
    return res.json(keys);
});

/**
 * Get Property by Owner ID
 */
router.get('/:id_owner', [
    check('id_owner').custom(userExists),
    noErrors
], async (req: Request, res: Response) => {
    // Corrección a include, as
    const foundProperty = await user_properties.findOne({
        where: {
            id_user: req.params.id_owner,
        },
        include: [{
            model: property,
            as: 'property'
        }]
    })
    return res.json(foundProperty);
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
    // Usamos el modelo 'user_properties' corregido
    const owners = await user_properties.findAll({
        include: [{
            model:property,
            as: 'property'
        }]
    });

    const owners_by_country = owners.filter((owner: any) => {
        const ownerData: any = owner.get({ plain: true });
        return ownerData.property?.id_country == +req.params.id_country;
    });
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
], async (req: Request, res: Response) => {
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);
    // Usamos el modelo 'user_properties' corregido
    const alreadyExists = await user_properties.findOne({
        where: {
            id_user: req.body.id_user,
            id_property: req.body.id_property
        }
    })
    if (alreadyExists) {
        return res.status(400).send({ msg: "Este propietario ya tiene asignada esta propiedad"})
    }
    // Usamos el modelo 'user_properties' corregido
    const key = user_properties.build(req.body);
    await key.save();
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
], async (req: Request, res: Response) => {
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);
    if (!isOwnerRole) {
        return res.status(400).send({ msg: "No es un usuario propietario"})
    }
    // Usamos el modelo 'owner_country' corregido
    const alreadyExists = await owner_country.findOne({
        where: {
            id_user: req.body.id_user,
            id_country: req.body.id_country
        }
    })
    if (alreadyExists) {
        return res.status(400).send({ msg: "Este propietario ya tiene asignado un country"})
    }
    // Usamos el modelo 'owner_country' corregido
    const ownerCountry = owner_country.build(req.body);
    await ownerCountry.save();
    return res.json(ownerCountry);
});

export default router;
