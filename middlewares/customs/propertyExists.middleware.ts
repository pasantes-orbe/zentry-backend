import { NextFunction, Request, Response } from "express";
import CountryModel from "../../models/country.model";
import Property from "../../models/property.model";
import User from "../../models/user.model";

async function propertyExists(id: number){

    const exists = await Property.findByPk(id);

    if(!exists){
        throw new Error(`La propiedad con ID ${id} no existe`);
    }
}

export default propertyExists;