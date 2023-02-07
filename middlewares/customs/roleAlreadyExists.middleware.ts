import { NextFunction, Request, Response } from "express";
import Role from "../../models/roles.model";

async function roleAlreadyExists(role: string = ""){

    const exists = await Role.findOne({
        where: {
            name: role.toLowerCase()
        }
    });

    if(exists){
        throw new Error(`El rol ${role} ya existe`);
    }
}

export default roleAlreadyExists;