// middlewares/customs/recurrentExists.middleware.ts

import { NextFunction, Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../../models";

// Desestructuramos el modelo 'recurrent' del objeto 'db'
const { recurrent } = db;

async function recurrentExists(id: number) {

    // Usamos el modelo correcto 'recurrent' para buscar por clave primaria
    const exists = await recurrent.findByPk(id);

    if (!exists) {
        // Si no existe, lanzamos un error que Express Validator capturará
        throw new Error(`El recurrente con ID ${id} no existe`);
    }
}

export default recurrentExists;