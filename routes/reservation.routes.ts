import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { where } from "sequelize";
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

const router = Router();


/**
 * Create Reservation
 */
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
    }

    const isPendient = await Reservation.findOne({
        where: {
            id_user,
            id_amenity,
            status: "pendiente"
        }
    })

    if (isPendient) {
        return res.status(400).send("Ya tenés una reserva pendiente de aprobación para este lugar de reserva.")
    }

    const reservation = new Reservation(reservationBody);

    await reservation.save();

    return res.json(reservation);

});

/**
 * Get all Reservations by Status and ID_Country
 */
router.get('/:id_country', async (req: Request, res: Response) => {

    const { status } = req.query;
    const { id_country } = req.params

    console.log("ESTE ES EL ID DEL COUNTRY");
    if (status) {
        const reservations = await Reservation.findAll({
            where: {
                status,
            },
            include: AmenityModel
        });

        const reservations_by_country = reservations.filter((reservation) => {
            return reservation.amenity.id_country == id_country;
        })

        return res.json(reservations_by_country);
    }

    const reservations = await Reservation.findAll();
    const reservations_by_country = reservations.filter((reservation) => {
        return reservation.amenity.id_country == id_country;
    })

    return res.json(reservations_by_country);
});

/**
 * Update Status
 */
router.patch('/:id_reservation/:status', [
    check('id_reservation', "El campo 'id_reservation' no puede estar vacío").notEmpty(),
    check('id_reservation', "El campo 'id_reservation' debe ser numérico").isNumeric(),
    check('id_reservation').custom(reservationExists),
    check('status', "El campo 'status' no puede estar vacío").notEmpty(),
    check('status', "El campo 'status' debe ser booleano").isBoolean(),
    noErrors
], async (req: Request, res: Response) => {




    // return res.send({invitations_to_checkin, event, invitations});
    // return res.send({event, invitations_to_checkin});

    let msg: string = "";
    let newStatus: string = "";

    const { status, id_reservation } = req.params

    const st = Boolean(status);

    if (status == 'false') {
        msg = "Se cambió el estado de la reserva a 'Rechazado' ";
        newStatus = "rechazado";
    }

    if (status == 'true') {
        msg = "Se cambió el estado de la reserva a 'Aprobado' ";
        newStatus = "aprobado";
    }


    try {
        const update = Reservation.update({ status: newStatus }, {
            where: {
                id: id_reservation
            }
        });


        const event = await Reservation.findByPk(req.params.id_reservation);

        const invitations = await Invitation.findAll({
            where: {
                id_reservation: req.params.id_reservation
            }
        });

        const invitations_to_checkin = invitations.map(invitation => {

            return {
                guest_name: invitation.name,
                guest_lastname: invitation.lastname,
                DNI: invitation.dni,
                confirmed_by_owner: true,
                check_in: false,
                check_out: false,
                income_date: event.date,
                id_owner: event.user.id,
                id_country: event.id_amenity
            }

        });

        const checkIn = await CheckInModel.bulkCreate(invitations_to_checkin);


    } catch (error) {
        return res.status(500).send({
            msg: "Error interno en el servidor"
        })
    }

    return res.json(msg);

});

/**
 * Get All Reservations By User
 */

router.get('/get_by_user/:id_user', [
    check('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    check('id_user').custom(userExists)
], async (req: Request, res: Response) => {


    const { id_user } = req.params

    console.log(id_user);

    const reservations = await Reservation.findAll({
        where: {
            id_user
        }
    });

    return res.json(reservations);
});

/**
 * Get All Reservations by Country
 */

router.get('/country/get_by_id/:id_country', [
    check('id_country', "El campo 'id_country' debe ser numérico").isNumeric(),
    check('id_country', "El campo 'id_country' es obligatorio").notEmpty(),
    check('id_country').custom(countryExists)
], async (req: Request, res: Response) => {

    const { id_country } = req.params

    const reservations = await Reservation.findAll({
        include: [User, AmenityModel]
    });

    const reservations_by_country = reservations.filter((reservation) => {
        return reservation.amenity.id_country == id_country;
    })

    return res.json(reservations_by_country);
});





export default router;