import { NextFunction, Request, Response } from "express";
import CountryModel from "../../models/country.model";

async function countryExists(id: number){

    console.log(id);

    const exists = await CountryModel.findByPk(id);

    if(!exists){
        throw new Error(`El country con ID ${id} no existe`);
    }
}

export default countryExists;