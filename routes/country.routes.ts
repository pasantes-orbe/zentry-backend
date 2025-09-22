/*12-7-25
import { Request, Response, Router } from "express";
import { check } from "express-validator";
//import Country from '../classes/Country';
import CountryModel from "../models/country.model";
import Country from "../classes/Country";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Countries from "../classes/Countries";
import Uploader from "../classes/Uploader";

const router = Router();
router.get('/', [
], async (req: Request, res: Response) => {
    
    const countries = await new Countries().getAll();
    res.json(countries);

});

router.get('/:id', [
    noErrors
], async (req: Request, res: Response) => {
    
    const country = await new Countries().getOne( Number(req.params.id) );
    res.json(country);

});

router.post('/', [
    // isAdmin,
    // noErrors
], async (req: Request, res: Response) => {
    
    // Get String Data
    const { name, latitude, longitude} = req.body;

    //TODO: Verificar que hacer en caso de que no llegue la imagen

    // Get Image from request
    //12-7-25const { tempFilePath } = req.files?.avatar;
    if (req.files && req.files.avatar) {
    const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
    const tempFilePath = (avatarFile as UploadedFile).tempFilePath;
    // Usar tempFilePath acá...
}

    // Upload to cloudinary
    const { secure_url } = await new Uploader().uploadImage(tempFilePath);

    
    // Save to DB
    const country: Country = new Country(name, latitude, longitude, secure_url);
    const result = country.save();

    // Response
    if(result){
        res.json({
            msg: "Se registró el country con éxito"
        });
    } else {
        res.status(500).send({
            msg: "ERROR"
        });
    }
})
export default router;*/

// routes/country.routes.ts
// routes/country.routes.ts
import { Request, Response, Router } from "express";
import { UploadedFile } from "express-fileupload";
import Country from "../classes/Country";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Countries from "../classes/Countries";
import Uploader from "../classes/Uploader";

const router = Router();

// Obtener todos los countries
router.get('/', async (req: Request, res: Response) => {
    const countries = await new Countries().getAll();
    res.json(countries);
});

// Obtener un country por ID
router.get('/:id', [noErrors], async (req: Request, res: Response) => {
    const country = await new Countries().getOne(Number(req.params.id));
    res.json(country);
});

// Crear un nuevo country
router.post('/', async (req: Request, res: Response) => {
    // 👇 CAMBIO CLAVE: Desestructurar todos los 8 campos del formulario 👇
    const { name, latitude, longitude, address, locality, phone, perimeterPoints } = req.body;

    // Validación de imagen subida (existente)
    if (!req.files || !req.files.avatar) {
        return res.status(400).json({ msg: "Imagen requerida" });
    }

    // Tipado seguro de avatar (existente)
    const avatarFile = Array.isArray(req.files.avatar)
        ? req.files.avatar[0]
        : req.files.avatar;

    const tempFilePath = (avatarFile as UploadedFile).tempFilePath;

    // Subir imagen a cloudinary (existente)
    const { secure_url } = await new Uploader().uploadImage(tempFilePath);

    // 👇 CAMBIO CLAVE: Pasar todos los 8 campos al constructor de Country 👇
    const country = new Country(
        name, 
        Number(latitude), 
        Number(longitude), 
        secure_url,
        address, 
        locality, 
        phone,
        perimeterPoints as string // El JSON string del perímetro
    );
    
    const result = await country.save();

    // Respuesta (existente)
    if (result) {
        res.json({ msg: "Se registró el country con éxito" });
    } else {
        res.status(500).json({ msg: "No se pudo registrar el country" });
    }
});

export default router;