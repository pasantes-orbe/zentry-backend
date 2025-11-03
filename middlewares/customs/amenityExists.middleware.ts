// middlewares/customs/amenityExists.middleware.ts
import { NextFunction, Request, Response } from "express";
import { getModels } from "../../models/getModels";

async function amenityExists(id: number){
    const { amenity } = getModels();

    // Usamos el modelo 'amenity' corregido para la consulta
    const exists = await amenity.findByPk(id);

    if(!exists){
        throw new Error(`El amenity con ID ${id} no existe`);
    }
}

export default amenityExists;
