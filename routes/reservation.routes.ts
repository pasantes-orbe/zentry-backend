// routes/reservation.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import reservationExists from "../middlewares/customs/reservationExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models";
import { Model } from "sequelize";
import { ReservationAttributes } from '../interfaces/reservation.interface';


// Desestructuramos los modelos necesarios del objeto 'db'
const { reservation, invitation, checkin, amenity, user, notification } = db;

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
    const { date, details, id_user, id_amenity, guests } = req.body;

    const isPending = await reservation.findOne({
        where: {
            id_user,
            id_amenity,
            status: "pendiente"
        }
    });

    if (isPending) {
        return res.status(400).send("Ya tenés una reserva pendiente de aprobación para este lugar de reserva.");
    }

    try {
        // Paso 1: Crear la reserva principal
        const newReservation = await reservation.create({
            date,
            details,
            id_user,
            id_amenity,
            status: "pendiente"
        });

        // Paso 2: Crear los invitados si existen
        if (guests && guests.length > 0) {
            const invitations = guests.map((guest: any) => ({
                ...guest,
                id_reservation: (newReservation as any).id
            }));
            await invitation.bulkCreate(invitations);
        }

        // Paso 3: Crear la notificación para el administrador
        await notification.create({
            title: 'Nueva Solicitud de Reserva',
            content: `El propietario con ID ${id_user} solicitó una reserva para la amenidad ${id_amenity}.`,
            id_user: 1 // <--- IMPORTANTE: Usar el ID del administrador del sistema
        });

        return res.status(201).json(newReservation);

    } catch (error) {
        console.error("Error al crear la reserva y notificar:", error);
        return res.status(500).json({ msg: "Error interno del servidor." });
    }
});

router.get('/:id_country', async (req: Request, res: Response) => {
    const { status } = req.query;
    const { id_country } = req.params;
    const idCountryNum = Number(id_country);

    if (status) {
        if (typeof status === 'string') {
            const reservations = await reservation.findAll({
                where: { status },
                include: {
                    model: amenity,
                    as: 'amenity'
                }
            });

            const filtered = reservations.filter((reservation: any) => {
                const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
                return amenity?.id_country === idCountryNum;
            });

            return res.json(filtered);
        } else {
            return res.status(400).json({ msg: "El parámetro 'status' debe ser un string" });
        }
    }

    const reservations = await reservation.findAll({
        include: {
            model: amenity,
            as: 'amenity'
        }
    });

    const filtered = reservations.filter((reservation: any) => {
        const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
        return amenity?.id_country === idCountryNum;
    });

    return res.json(filtered);
});

router.patch('/:id_reservation/:status', [
    check('id_reservation', "El campo 'id_reservation' no puede estar vacío").notEmpty(),
    check('id_reservation', "El campo 'id_reservation' debe ser numérico").isNumeric(),
    check('status', "El campo 'status' no puede estar vacío").notEmpty(),
    check('status', "El campo 'status' debe ser booleano").isBoolean(),
    reservationExists, // Aquí se usa el middleware correctamente
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
        await reservation.update({ status: newStatus }, {
            where: { id: id_reservation }
        });

        const event = await reservation.findByPk(id_reservation, {
            include: [
                { model: user, as: 'user' },
                { model: amenity, as: 'amenity' }
            ]
        }) as any;

        if (!event) {
            return res.status(404).json({ msg: "Reserva no encontrada" });
        }

        if (!event.user) {
            return res.status(404).json({ msg: "Usuario asociado no encontrado" });
        }

        if (!event.amenity) {
            return res.status(404).json({ msg: "Amenidad asociada no encontrada" });
        }

        const id_owner = event.user.id;
        const id_country = event.amenity.id_country;

        if (!event.date) {
            return res.status(400).json({ msg: "La reserva no tiene fecha definida" });
        }

        const invitations = await invitation.findAll({ where: { id_reservation } });

        const invitations_to_checkin = invitations.map((invitation: any) => ({
            guest_name: invitation.name,
            guest_lastname: invitation.lastname,
            DNI: invitation.dni,
            confirmed_by_owner: true,
            check_in: false,
            check_out: false,
            income_date: event.date,
            id_owner,
            id_country
        }));

        await checkin.bulkCreate(invitations_to_checkin);


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
    const reservations = await reservation.findAll({
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

    const reservations = await reservation.findAll({
        include: [
            { model: user, as: 'user' },
            { model: amenity, as: 'amenity' }
        ]
    });

    const filtered = reservations.filter((reservation: any) => {
        const amenity = reservation.get('amenity') as Model & { id_country?: number } | null;
        return amenity?.id_country === idCountryNum;
    });

    return res.json(filtered);
});

export default router;