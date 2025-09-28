//routes/owner.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models"; // Importamos el objeto 'db' centralizado

// Desestructuramos los modelos necesarios
const { user_properties, owner_country, property, user, country } = db; 

const router = Router();

/**
 * Get All
 * NOTA: Esta ruta no incluye al usuario, solo la relación user_properties.
 * Si el frontend la usa para "getAll()", puede que necesite incluir el modelo User.
 */
router.get('/', async (req: Request, res: Response) => {
    // Corrección: Incluimos también el modelo User para que el frontend tenga datos del propietario
    const keys = await user_properties.findAll({
        include: [
            {
                model: property,
                as: 'property'
            },
            // Asumiendo que user_properties tiene una relación con user (debe coincidir con el alias en el modelo)
            {
                model: user,
                as: 'user' // o el alias correcto para el usuario en la relación user_properties
            }
        ] 
    });
    // === [LOG AGREGADO] ===
    console.log(`[GET /] Devolviendo ${keys.length} relaciones user_properties.`);
    // ======================
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
    // === [LOG AGREGADO] ===
    console.log(`[GET /:id_owner] Propiedad encontrada para usuario ${req.params.id_owner}:`, foundProperty ? 'Sí' : 'No');
    // ======================
    return res.json(foundProperty);
});

/**
 * Get All Owners By Country (RUTA CRÍTICA CORREGIDA Y OPTIMIZADA)
 * OBJETIVO: 
 * 1. Llenar el SELECT de "Seleccionar Propietario" (requiere user).
 * 2. Anidar la Propiedad (requiere user_properties + property).
 *
 * FIX CLAVE: Se comenta la consulta original compleja (propensa a timeouts) 
 * y se reemplaza por una consulta optimizada usando el alias 'properties' 
 * de la relación Many-to-Many definida en el modelo User (asumiendo que User.belongsToMany(Property, ...) usa el alias 'properties').
 */
router.get('/country/get_by_id/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {
    try {
        const id_country = +req.params.id_country;
        
        /* CÓDIGO ORIGINAL (COMPLEJO Y CAUSANTE DE TIMEOUTS)
        // CORRECCIÓN CLAVE: ¡Usamos el alias 'OwnerUser' definido en el modelo!
        const owners = await owner_country.findAll({
            where: {
                id_country: id_country
            },
            include: [
                { 
                    model: user, 
                    as: 'OwnerUser', // <<-- ¡ALIAS CORREGIDO!
                    // Anidamos la búsqueda de la propiedad DENTRO del usuario
                    include: [ 
                        {
                            // Usamos el modelo user_properties (la tabla intermedia) para la relación N:M
                            model: user_properties, 
                            as: 'user_properties', // Alias de la relación del usuario a la tabla intermedia
                            include: [
                                {
                                    model: property, // Incluir la propiedad en sí
                                    as: 'property' // El alias de la propiedad en la relación user_properties
                                }
                            ],
                            required: false // Opcional: El propietario PUEDE no tener propiedad asignada aún
                        }
                    ]
                },
                { 
                    model: country, 
                    as: 'country' // Usamos el alias 'country'
                }
            ],
            // Esto garantiza que obtenemos los objetos completos con anidaciones.
            raw: false, 
            // Agregamos un atributo adicional del OwnerCountry al resultado
            attributes: ['id', 'id_user', 'id_country'] 
        });
        */

        // CÓDIGO CORREGIDO Y OPTIMIZADO: Consulta más simple y eficiente.
        const owners = await owner_country.findAll({
            where: {
                id_country: id_country
            },
            include: [
                { 
                    model: user, 
                    as: 'OwnerUser', // Alias de OwnerCountry a User
                    // Incluimos la propiedad, asumiendo que el modelo User tiene una relación 
                    // BelongsToMany con Property (a través de user_properties) usando el alias 'properties'.
                    include: [ 
                        {
                            model: property, // Modelo de la propiedad
                            as: 'properties', // Alias BelongsToMany/HasMany del modelo User
                            required: false // El propietario PUEDE no tener propiedad
                        }
                    ]
                },
                { 
                    model: country, 
                    as: 'country' // Alias de OwnerCountry a Country
                }
            ],
            raw: false, 
            attributes: ['id', 'id_user', 'id_country'] 
        });
        
        // === [LOG CRÍTICO] ===
        console.log(`[GET /country/get_by_id] Devolviendo ${owners.length} propietarios disponibles (con propiedad anidada).`);
        // ======================

        // Devolvemos la estructura compleja de OwnerCountry anidada con user, para que el frontend pueda construir la lista.
        return res.json(owners); 

    } catch (error) {
        // Mejoramos el log de error para ser más específico
        console.error('Error FATAL al obtener propietarios por país. Error:', error);
        // Devolvemos un 500 y un array vacío si la consulta falla.
        return res.status(500).json([]);
    }
});


/**
 * Relation with property
 * FIX: Se añade validación de rol (ya corregida en UserClass.ts) y manejo de errores.
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
    // FIX: Validación de rol activa. El error de cuelgue se resolvió en UserClass.ts.
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);
    if (!isOwnerRole) {
        return res.status(400).send({ msg: "No es un usuario propietario"})
    }

    // Usamos el modelo 'user_properties'
    const alreadyExists = await user_properties.findOne({
        where: {
            id_user: req.body.id_user,
            id_property: req.body.id_property
        }
    })
    if (alreadyExists) {
        return res.status(400).send({ msg: "Este propietario ya tiene asignada esta propiedad"})
    }
    
    // Usamos el modelo 'user_properties'
    const key = user_properties.build(req.body);
    
    // FIX: Agregamos manejo de errores para el guardado en la base de datos
    try {
        await key.save();
        return res.json(key);
    } catch (error) {
        console.error('Error al guardar la asignación de propiedad:', error);
        return res.status(500).json({ msg: "Error de base de datos al asignar propiedad.", error: (error as Error).message });
    }
});

/**
 * ASSIGN COUNTRY
 * FIX: Se añade validación de rol y manejo de errores.
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
    // FIX: Validación de rol activa. El error de cuelgue se resolvió en UserClass.ts.
    const isOwnerRole = await new UserClass().is("propietario", +req.body.id_user);
    if (!isOwnerRole) {
        return res.status(400).send({ msg: "No es un usuario propietario"})
    }
    
    // Usamos el modelo 'owner_country'
    const alreadyExists = await owner_country.findOne({
        where: {
            id_user: req.body.id_user,
            id_country: req.body.id_country
        }
    })
    if (alreadyExists) {
        return res.status(400).send({ msg: "Este propietario ya tiene asignado un country"})
    }
    
    // Usamos el modelo 'owner_country'
    const ownerCountry = owner_country.build(req.body);
    
    // FIX: Agregamos manejo de errores para el guardado en la base de datos
    try {
        await ownerCountry.save();
        return res.json(ownerCountry);
    } catch (error) {
        console.error('Error al guardar la asignación de país:', error);
        return res.status(500).json({ msg: "Error de base de datos al asignar país.", error: (error as Error).message });
    }
});

export default router;