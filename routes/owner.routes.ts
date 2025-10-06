import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models";

const { user_properties, owner_country, property, user, country } = db; 

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const keys = await user_properties.findAll({
        include: [
            { model: property, as: 'property' },
            { model: user, as: 'user' }
        ] 
    });
    console.log(`[GET /] Devolviendo ${keys.length} relaciones user_properties.`);
    return res.json(keys);
});

router.get('/:id_owner', [
    check('id_owner').custom(userExists),
    noErrors
], async (req: Request, res: Response) => {
    const foundProperty = await user_properties.findOne({
        where: { id_user: req.params.id_owner },
        include: [{ model: property, as: 'property' }]
    })
    console.log(`[GET /:id_owner] Propiedad encontrada para usuario ${req.params.id_owner}:`, foundProperty ? 'Sí' : 'No');
    return res.json(foundProperty);
});

router.get('/country/get_by_id/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {
    try {
        const id_country = +req.params.id_country;
        
        const owners = await owner_country.findAll({
            where: { id_country: id_country },
            include: [
                { 
                    model: user, 
                    as: 'OwnerUser',
                    include: [ 
                        { model: property, as: 'properties', required: false }
                    ]
                },
                { model: country, as: 'country' }
            ],
            raw: false, 
            attributes: ['id', 'id_user', 'id_country'] 
        });
        
        console.log(`[GET /country/get_by_id] Devolviendo ${owners.length} propietarios para country ${id_country}`);
        return res.json(owners); 

    } catch (error) {
        console.error('❌ Error al obtener propietarios por país:', error);
        return res.status(500).json([]);
    }
});

/**
 * POST - Relation with property
 * LOGS AGREGADOS PARA DEBUGGING
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 POST /api/owners - INICIO');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('Tipos:', {
        id_user: typeof req.body.id_user,
        id_property: typeof req.body.id_property
    });

    // Validación de rol
    const userId = +req.body.id_user;
    console.log('🔐 Verificando rol de usuario:', userId);
    
    const isOwnerRole = await new UserClass().is("propietario", userId);
    console.log('🔐 ¿Es propietario?', isOwnerRole);
    
    if (!isOwnerRole) {
        console.log('❌ Usuario NO es propietario');
        return res.status(400).send({ msg: "No es un usuario propietario" });
    }

    // Verificar si ya existe
    console.log('🔍 Verificando si la relación ya existe...');
    const alreadyExists = await user_properties.findOne({
        where: {
            id_user: req.body.id_user,
            id_property: req.body.id_property
        }
    });
    
    if (alreadyExists) {
        console.log('⚠️  LA RELACIÓN YA EXISTE:', alreadyExists.toJSON());
        return res.status(400).send({ 
            msg: "Este propietario ya tiene asignada esta propiedad",
            existing: alreadyExists.toJSON()
        });
    }
    
    console.log('✅ Relación no existe, procediendo a crear...');
    const key = user_properties.build(req.body);
    
    try {
        await key.save();
        console.log('✅ RELACIÓN CREADA EXITOSAMENTE:', key.toJSON());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return res.json(key);
    } catch (error) {
        console.error('❌ ERROR AL GUARDAR:', error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return res.status(500).json({ 
            msg: "Error de base de datos al asignar propiedad.", 
            error: (error as Error).message 
        });
    }
});

/**
 * POST - ASSIGN COUNTRY
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
        return res.status(400).send({ msg: "No es un usuario propietario" });
    }
    
    const alreadyExists = await owner_country.findOne({
        where: {
            id_user: req.body.id_user,
            id_country: req.body.id_country
        }
    });
    
    if (alreadyExists) {
        return res.status(400).send({ msg: "Este propietario ya tiene asignado un country" });
    }
    
    const ownerCountry = owner_country.build(req.body);
    
    try {
        await ownerCountry.save();
        return res.json(ownerCountry);
    } catch (error) {
        console.error('Error al guardar la asignación de país:', error);
        return res.status(500).json({ 
            msg: "Error de base de datos al asignar país.", 
            error: (error as Error).message 
        });
    }
});

export default router;