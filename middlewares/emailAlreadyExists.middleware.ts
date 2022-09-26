import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";

async function emailAlreadyExists(req:Request, res:Response, next:NextFunction): Promise<void> {
    const exists = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    if(exists){
        throw new Error(`El email ya existe`)
    }

    next();
}

export default emailAlreadyExists;