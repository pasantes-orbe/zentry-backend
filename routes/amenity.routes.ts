import { Request, Response, Router } from "express";
import { check } from "express-validator";
import Amenity from "../classes/Amenity";
import Countries from "../classes/Countries";
import Country from "../classes/Country";
import Uploader from "../classes/Uploader";
import countryExists from "../middlewares/customs/countryExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import AmenityModel from "../models/amenity.model";

const router = Router();

/**
 * Get All By Country
 */
router.get('/:id_country', [
    check('id_country', 'El id_country de country no puede estar vacío').notEmpty(),
    check('id_country', 'El id de country debe ser numérico').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
] ,async (req: Request, res: Response) => {
    const amenities = await AmenityModel.findAll({
        where: {
            id_country: req.params.id_country
        }
    });
    res.json(amenities);
});

/**
 * Get One By Country
 */
router.get('/:id_country/:id', [
    check('id_country', 'El id_country de country no puede estar vacío').notEmpty(),
    check('id_country', 'El id de country debe ser numérico').isNumeric(),
    check('id_country').custom(countryExists),
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
] , async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findByPk(req.params.id);
    res.json(amenity);
});

/**
 * Get One By Country
 */
router.get('/:id_country/:id', [
    check('id_country', 'El id_country de country no puede estar vacío').notEmpty(),
    check('id_country', 'El id de country debe ser numérico').isNumeric(),
    check('id_country').custom(countryExists),
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
] , async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findOne({
        where: {
            id: req.params.id,
            id_country: req.params.id_country
        }
    });
    res.json(amenity);
});

/**
 * Get One
 */
router.get('/:id', [
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
] , async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findByPk(req.params.id);
    res.json(amenity);
});


/**
 * Add New Amenity
 */
router.post('/:id',
    [
        check('id').notEmpty(),
        check('id', "Proporciona un ID de Country numérico").isNumeric(),
        check('id').custom(countryExists),
        check('name', "Nombre del lugar de reserva obligatorio").notEmpty(),
        noErrors
    ]
 , async (req: Request, res: Response) => {
    
    const country: Country = await new Countries().getOne( +req.params.id );

    const { name, address} = req.body;

    //TODO: Verificar que hacer en caso de que no llegue la imagen
    const { tempFilePath } = req.files?.avatar;
    const { secure_url } = await new Uploader().uploadImage(tempFilePath);
    
    const amenity: Amenity = new Amenity(country, name, secure_url, address);

    const amenitySaved = await amenity.save();

    res.json({
        msg: "Amenity agregado con éxito!",
        amenitySaved
    });

});

export default router;