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
    isAdmin,
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
    // Get Image from request
    const { tempFilePath } = req.files?.avatar;
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



export default router;