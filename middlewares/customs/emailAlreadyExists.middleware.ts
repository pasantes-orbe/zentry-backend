import { NextFunction, Request, Response } from "express";
import User from "../../models/user.model";

async function emailAlreadyExists(email: string = ""){

    const exists = await User.findOne({
        where: {
            email
        }
    });

    if(exists){
        throw new Error(`El email ${email} ya existe`);
    }
}

export default emailAlreadyExists;