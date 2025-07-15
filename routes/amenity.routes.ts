import { Request, Response, Router } from "express";
import { check } from "express-validator";
import Amenity from "../classes/Amenity";
import Countries from "../classes/Countries";
import Country from "../classes/Country";
import Uploader from "../classes/Uploader";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import AmenityModel from "../models/amenity.model";

const router = Router();

// Obtener todos los amenities
router.get('/', async (req: Request, res: Response) => {
    const amenities = await AmenityModel.findAll();
    res.json(amenities);
});

// Obtener amenities por país
router.get('/country/:id_country', [
    check('id_country', 'El id_country de country no puede estar vacío').notEmpty(),
    check('id_country', 'El id de country debe ser numérico').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {
    const amenities = await AmenityModel.findAll({
        where: { id_country: req.params.id_country }
    });
    res.json(amenities);
});

// Obtener amenity por país e id
router.get('/country/:id_country/:id', [
    check('id_country', 'El id_country de country no puede estar vacío').notEmpty(),
    check('id_country', 'El id de country debe ser numérico').isNumeric(),
    check('id_country').custom(countryExists),
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
], async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findOne({
        where: {
            id: req.params.id,
            id_country: req.params.id_country
        }
    });
    res.json(amenity);
});

// Obtener amenity por id
router.get('/:id', [
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
], async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findByPk(req.params.id);
    res.json(amenity);
});

router.post('/country/:id', [
    check('id').notEmpty(),
    check('id', "Proporciona un ID de Country numérico").isNumeric(),
    check('id').custom(countryExists),
    check('name', "Nombre del lugar de reserva obligatorio").notEmpty(),
    noErrors
], async (req: Request, res: Response) => {

    const country = await new Countries().getOne(+req.params.id);
    if (!country) {
        return res.status(404).json({ msg: "El país no existe" });
    }

    const { name, address } = req.body;

    const avatarFile = req.files?.avatar;
    if (!avatarFile) {
        return res.status(400).json({ msg: "No se recibió archivo de imagen" });
    }

    const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;

    if (!file.tempFilePath) {
        return res.status(400).json({ msg: "Archivo inválido o sin tempFilePath" });
    }

    const tempFilePath = file.tempFilePath;

    // Ahora podés seguir con la lógica para subir la imagen y crear el amenity
    const { secure_url } = await new Uploader().uploadImage(tempFilePath);

    const amenity: Amenity = new Amenity(country, name, secure_url, address);

    const amenitySaved = await amenity.save();

    res.json({
        msg: "Amenity agregado con éxito!",
        amenitySaved
    });
});


// Eliminar amenity
router.delete('/:id', [
    isAdmin,
    check('id').custom(amenityExists),
    noErrors
], async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await AmenityModel.destroy({
            where: { id }
        });
        return res.json({ msg: "Eliminado correctamente" });
    } catch (error) {
        return res.status(500).send(error);
    }
});

export default router;


/* 15/7
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import Amenity from "../classes/Amenity";
import Countries from "../classes/Countries";
import Country from "../classes/Country";
import Uploader from "../classes/Uploader";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import AmenityModel from "../models/amenity.model";

const router = Router();

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

router.get('/', async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findAll();
    res.json(amenity);
});


router.get('/:id', [
    check('id', 'El id de amenity no puede estar vacío').notEmpty(),
    check('id', 'El id de amenity debe ser numérico').isNumeric(),
    noErrors
] , async (req: Request, res: Response) => {
    const amenity = await AmenityModel.findByPk(req.params.id);
    res.json(amenity);
});

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

router.delete(':/id', [
    isAdmin,
    check('id').custom(amenityExists),
    noErrors
], async (req: Request, res: Response) => {
    const { id } = req.params;
        try {
            const deleted = await AmenityModel.destroy({
                where: { id }
            });
            return res.json({
                msg: "Eliminado correctamente"
            });
        } catch (error) {
            return res.status(500).send(error);
        }
});
export default router;*/