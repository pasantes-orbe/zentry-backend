import { NextFunction, Request, Response } from "express";
import CountryModel from "../../models/country.model";
import User from "../../models/user.model";

async function userExists(id: number){

    const exists = await User.findByPk(id);

    if(!exists){
        throw new Error(`El usuario con ID ${id} no existe`);
    }
}

export default userExists;