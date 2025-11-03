// middlewares/customs/recurrentExists.middleware.ts

import { NextFunction, Request, Response } from "express";
import { getModels } from "../../models/getModels";

async function recurrentExists(id: number) {
    const { recurrent } = getModels();

    // Usamos el modelo correcto 'recurrent' para buscar por clave primaria
    const exists = await recurrent.findByPk(id);

    if (!exists) {
        // Si no existe, lanzamos un error que Express Validator capturará
        throw new Error(`El recurrente con ID ${id} no existe`);
    }
}

export default recurrentExists;