import { Router } from "express";
import { check } from "express-validator";
//import Country from '../classes/Country';
import CountryModel from "../models/country.model";
import Country from "../classes/Country";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();


router.get('/', (req, res) => {
    res.json("hola");
});

router.post('/', (req, res) => {

    const { name, latitude, longitude, avatar } = req.body; 

    const country: Country = new Country(name, latitude, longitude);

    

    res.json({
        name: country.getName()
    });
})


export default router;