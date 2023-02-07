import { NextFunction, Request, Response } from "express";
import CheckIn from "../../classes/CheckIn";
import CheckInModel from "../../models/checkin.model";

async function checkInExists(id: number){

    const exists = await new CheckIn().exists(id);

    if(!exists){
        throw new Error(`No hay registro de check-in con id ${id}`);
    }
}

export default checkInExists;