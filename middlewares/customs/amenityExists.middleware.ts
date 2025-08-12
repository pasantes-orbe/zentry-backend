// middlewares/customs/amenityExists.middleware.ts
import { NextFunction, Request, Response } from "express";
import db from "../../models"; // Importamos el objeto 'db' centralizado

const { amenity } = db; // Desestructuramos el modelo 'amenity'

async function amenityExists(id: number){

    // Usamos el modelo 'amenity' corregido para la consulta
    const exists = await amenity.findByPk(id);

    if(!exists){
        throw new Error(`El amenity con ID ${id} no existe`);
    }
}

export default amenityExists;
