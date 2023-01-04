import { NextFunction, Request, Response } from "express";
import CheckIn from "../../classes/CheckIn";
import CheckInModel from "../../models/checkin.model";

async function checkInApproved(id: number){

    const exists = await new CheckIn().isApproved(id);

    if(!exists){
        throw new Error(`No hay registro de check-in con id ${id} o el mismo no fue aprobado`);
    }
}

export default checkInApproved;