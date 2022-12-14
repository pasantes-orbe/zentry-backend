import { NextFunction, Request, Response } from "express";
import AmenityModel from "../../models/amenity.model";
import CountryModel from "../../models/country.model";
import Reservation from "../../models/reservation.model";

async function reservationExists(id: number){

    const exists = await Reservation.findByPk(id);

    if(!exists){
        throw new Error(`La reserva con ID ${id} no existe`);
    }
}

export default reservationExists;