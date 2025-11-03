// routes/owner.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import { getModels } from "../models/getModels";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const { user_properties, property, user } = getModels() as any;
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
    const { user_properties, property } = getModels() as any;
    const foundProperty = await user_properties.findOne({
        where: { id_user: req.params.id_owner },
        include: [{ model: property, as: 'property' }]
    })
    console.log(`[GET /:id_owner] Propiedad encontrada para usuario ${req.params.id_owner}:`, foundProperty ? 'Sí' : 'No');
    return res.json(foundProperty);
});

// GET all properties for an owner (normalized array)
router.get('/properties/:id_owner', [
    check('id_owner').custom(userExists),
    noErrors
], async (req: Request, res: Response) => {
    try {
        const { user_properties, property } = getModels() as any;
        const items = await user_properties.findAll({
            where: { id_user: req.params.id_owner },
            include: [{ model: property, as: 'property' }]
        });

        const props = items
            .map((it: any) => it?.property)
            .filter(Boolean)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                number: p.number,
                address: p.address,
                avatar: p.avatar,
                id_country: p.id_country
            }));

        return res.json(props);
    } catch (e) {
        console.error('Error fetching owner properties:', e);
        return res.status(500).json([]);
    }
});

router.get('/country/get_by_id/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {
    try {
        const { owner_country, user, property, country } = getModels() as any;
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

        // LOG IMPORTANTE PARA DEBUG:
        console.log('🔎 Owners encontrados:', owners);

        console.log(`[GET /country/get_by_id] Devolviendo ${owners.length} propietarios para country ${id_country}`);

        // Normalizar avatar de OwnerUser en la respuesta
        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        const toAvatarUrl = (val?: string | null) => {
            if (!val) return placeholder;
            const s = String(val);
            if (/^https?:\/\//i.test(s)) return s; // absolute URL
            if (s.startsWith('/')) return s; // relative path
            return cloudName
                ? `https://res.cloudinary.com/${cloudName}/image/upload/${s}`
                : s; // public_id
        };

        const response = owners.map((row: any) => {
            const json = row.toJSON ? row.toJSON() : row;
            if (json.OwnerUser) {
                json.OwnerUser.avatar = toAvatarUrl(json.OwnerUser.avatar);
            }
            return json;
        });

        return res.json(response); 

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
    const { user_properties } = getModels() as any;
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
    
    const { owner_country } = getModels() as any;
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

// DELETE - Unassign owner from property
router.delete('/', [
    isAdmin,
    check('id_user', "Id de usuario obligatorio").notEmpty(),
    check('id_user', "El id de usuario debe ser numerico").isNumeric(),
    check('id_property', "Id de propiedad obligatorio").notEmpty(),
    check('id_property', "El id de propiedad debe ser numerico").isNumeric(),
    noErrors
], async (req: Request, res: Response) => {
    try {
        const { user_properties } = getModels() as any;
        const uid = Number(req.body.id_user);
        const pid = Number(req.body.id_property);

        const deleted = await user_properties.destroy({
            where: { id_user: uid, id_property: pid }
        });

        if (!deleted) {
            return res.status(404).json({ msg: 'Relation not found' });
        }

        return res.json({ msg: 'Unassigned', deleted });
    } catch (error) {
        console.error('❌ Error al desasignar propietario de propiedad:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

export default router;