//routes/property.routes.ts
import { Router } from "express";
import { check } from "express-validator";
import PropertyController from "../controller/property.controller";
import countryExists from "../middlewares/customs/countryExists.middleware";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import fileUpload, { UploadedFile } from "express-fileupload";
import validateJWT from "../middlewares/jwt/validateJWT.middleware";

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

// 🟢 NUEVA RUTA: Obtener propiedades del usuario logueado
router.get('/owner-properties', [
    validateJWT, // 👈 Usa el token para identificar al usuario
    noErrors
], property.getPropertiesByOwner); // 👈 Llamará al nuevo método


router.get('/:id', isAdmin, property.getByID);

router.post('/', [
    isAdmin,
    // 🚨 Middleware de archivos: Procesará la petición 'multipart/form-data'
    //fileUpload({ 
    //    useTempFiles: true, 
    //    tempFileDir: '/tmp/' // Usa la ruta que el programador original usó, o '/tmp/' si no la sabes. 
    //}),
    
    // 🚨 CORRECCIÓN CLAVE: Los campos numéricos deben convertirse a entero
    //    porque 'fileUpload' los deja como string. Esto se hace con .toInt()
    
    check('id_country')
        .notEmpty()
        .withMessage("El ID de país no debe estar vacío")
        .isNumeric()
        .withMessage("El ID de país debe ser numérico")
        .toInt(), // ⬅️ CONVIERTE EL STRING A NÚMERO
    check('id_country').custom(countryExists), // Esto ahora recibe un número
    
    check('number')
        .notEmpty()
        .withMessage("El número de propiedad no debe estar vacío")
        .isNumeric()
        .withMessage("El número de propiedad debe ser numérico")
        .toInt(), // ⬅️ CONVIERTE EL STRING A NÚMERO
        
    check('address', 'La direccion es obligatoria').notEmpty(),
    
    // 🚨 Asegúrate de que noErrors imprima el error en consola si falla (para debugging)
    noErrors
], property.create);

router.patch("/:id", [
    isAdmin,
    check('id').notEmpty(),
    check('id').custom(propertyExists),
    noErrors
], property.update)

router.delete("/:id", [
    isAdmin,
    check('id').notEmpty(),
    check('id').custom(propertyExists),
    noErrors
], property.delete);

export default router;