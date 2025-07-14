import { Request, Response, Router } from "express";
import { check } from "express-validator";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import reservationExists from "../middlewares/customs/reservationExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import AmenityModel from "../models/amenity.model";
import CheckInModel from "../models/checkin.model";
import Invitation from "../models/invitations.model";
import Reservation from "../models/reservation.model";
import User from "../models/user.model";
import { Model } from "sequelize";
import { DataTypes } from "sequelize";
import db from "../DB/connection";

const router = Router();

router.post('/', [
    check('id_amenity', "El campo 'id_amenity' no puede estar vacío").notEmpty(),
    check('id_amenity', "El campo 'id_amenity' debe ser numérico").isNumeric(),
    check('id_amenity').custom(amenityExists),
    check('id_user', "El campo 'id_user' no puede estar vacío").notEmpty(),
    check('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    check('id_user').custom(userExists),
    check('date', "El campo 'date' no puede estar vacío").notEmpty(),
    noErrors
], async (req: Request, res: Response) => {
    const { date, details, id_user, id_amenity } = req.body;

    const reservationBody = {
        date,
        details,
        id_user,
        id_amenity,
        status: "pendiente"
    };

    const isPending = await Reservation.findOne({
        where: {
            id_user,
            id_amenity,
            status: "pendiente"
        }
    });

    if (isPending) {
        return res.status(400).send("Ya tenés una reserva pendiente de aprobación para este lugar de reserva.");
    }

    const reservation = await Reservation.create(reservationBody);
    return res.json(reservation);
});

router.get('/:id_country', async (req: Request, res: Response) => {
    const { status } = req.query;
    const { id_country } = req.params;
    const idCountryNum = Number(id_country);

    if (status) {
        const reservations = await Reservation.findAll({
            where: { status },
            include: {
                model: AmenityModel,
                as: 'amenity'
            }
        });

        const filtered = reservations.filter(reservation => {
            const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
            return amenity?.id_country === idCountryNum;
        });

        return res.json(filtered);
    }

    // Sin filtro por status
    const reservations = await Reservation.findAll({
        include: {
            model: AmenityModel,
            as: 'amenity'
        }
    });

    const filtered = reservations.filter(reservation => {
        const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
        return amenity?.id_country === idCountryNum;
    });

    return res.json(filtered);
});

router.patch('/:id_reservation/:status', [
    check('id_reservation', "El campo 'id_reservation' no puede estar vacío").notEmpty(),
    check('id_reservation', "El campo 'id_reservation' debe ser numérico").isNumeric(),
    check('id_reservation').custom(reservationExists),
    check('status', "El campo 'status' no puede estar vacío").notEmpty(),
    check('status', "El campo 'status' debe ser booleano").isBoolean(),
    noErrors
], async (req: Request, res: Response) => {
    let msg = "";
    let newStatus = "";
    const { status, id_reservation } = req.params;

    if (status === 'false') {
        msg = "Se cambió el estado de la reserva a 'Rechazado'";
        newStatus = "rechazado";
    }
    if (status === 'true') {
        msg = "Se cambió el estado de la reserva a 'Aprobado'";
        newStatus = "aprobado";
    }

    try {
        await Reservation.update({ status: newStatus }, {
            where: { id: id_reservation }
        });

        const event = await Reservation.findByPk(id_reservation, {
            include: [{ model: User, as: 'user' }]
        });

        if (!event) {
            return res.status(404).json({ msg: "Reserva no encontrada." });
        }

        const invitations = await Invitation.findAll({
            where: { id_reservation }
        });

        const invitations_to_checkin = invitations.map(invitation => ({
            guest_name: invitation.name,
            guest_lastname: invitation.lastname,
            DNI: invitation.dni,
            confirmed_by_owner: true,
            check_in: false,
            check_out: false,
            income_date: event.date,
            id_owner: event.user?.id,
            id_country: event.id_amenity
        }));

        await CheckInModel.bulkCreate(invitations_to_checkin);

    } catch (error) {
        return res.status(500).send({
            msg: "Error interno en el servidor"
        });
    }

    return res.json({ msg });
});

router.get('/get_by_user/:id_user', [
    check('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    check('id_user').custom(userExists)
], async (req: Request, res: Response) => {
    const { id_user } = req.params;
    const reservations = await Reservation.findAll({
        where: { id_user }
    });
    return res.json(reservations);
});

router.get('/country/get_by_id/:id_country', [
    check('id_country', "El campo 'id_country' debe ser numérico").isNumeric(),
    check('id_country', "El campo 'id_country' es obligatorio").notEmpty(),
    check('id_country').custom(countryExists)
], async (req: Request, res: Response) => {
    const { id_country } = req.params;
    const idCountryNum = Number(id_country);

    const reservations = await Reservation.findAll({
        include: [
            { model: User, as: 'user' },
            { model: AmenityModel, as: 'amenity' }
        ]
    });

    const filtered = reservations.filter(reservation => {
        const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
        return amenity?.id_country === idCountryNum;
    });

    return res.json(filtered);
});

export default router;
