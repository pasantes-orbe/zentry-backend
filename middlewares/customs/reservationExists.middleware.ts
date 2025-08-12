import { NextFunction, Request, Response } from 'express';
import db from '../../models';
import { ReservationAttributes } from '../../interfaces/reservation.interface';

// Accedemos al modelo de reserva ya inicializado desde el objeto 'db'
const { reservation } = db;

const reservationExists = async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id_reservation) || parseInt(req.body.id_reservation);

    if (!id) {
        return res.status(400).json({ msg: "El campo 'id_reservation' es obligatorio" });
    }

    try {
        const exists = await reservation.findByPk(id);

        if (!exists) {
            return res.status(404).json({ msg: `No existe una reserva con el id ${id}` });
        }

        // Usamos .toJSON() para obtener los datos planos y pasarlos al request
        req.body.reservation = exists.toJSON() as ReservationAttributes;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Error de servidor al verificar la reserva"
        });
    }
};

export default reservationExists;