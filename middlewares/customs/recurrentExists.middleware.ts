import { NextFunction, Request, Response } from "express";
import Recurrent from "../../models/recurrent.model";

async function recurrentExists(id: number){

    const exists = await Recurrent.findByPk(id);

    if(!exists){
        throw new Error(`El recurrente con ID ${id} no existe`);
    }
}

export default recurrentExists;