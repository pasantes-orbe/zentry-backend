// middlewares/customs/userExists.middleware.ts
import { NextFunction, Request, Response } from "express";
import db from "../../models"; // Importamos el objeto 'db' centralizado

const { user } = db; // Desestructuramos el modelo 'user'

async function userExists(id: number){

    // Usamos la instancia del modelo 'user' corregida para la consulta
    const exists = await user.findByPk(id);

    if(!exists){
        throw new Error(`El usuario con ID ${id} no existe`);
    }
}

export default userExists;
