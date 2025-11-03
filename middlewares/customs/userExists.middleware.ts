// middlewares/customs/userExists.middleware.ts
import { NextFunction, Request, Response } from "express";
import { getModels } from "../../models/getModels";

async function userExists(id: number){
    const { user } = getModels();
    const exists = await user.findByPk(id);

    if(!exists){
        throw new Error(`El usuario con ID ${id} no existe`);
    }
}

export default userExists;
