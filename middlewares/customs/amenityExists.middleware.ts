import { NextFunction, Request, Response } from "express";
import AmenityModel from "../../models/amenity.model";
import CountryModel from "../../models/country.model";

async function amenityExists(id: number){

    const exists = await AmenityModel.findByPk(id);

    if(!exists){
        throw new Error(`El amenity con ID ${id} no existe`);
    }
}

export default amenityExists;