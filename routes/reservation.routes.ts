// routes/reservation.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import reservationExists from "../middlewares/customs/reservationExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import { getModels } from "../models/getModels";
import { Model } from "sequelize";
import { ReservationAttributes } from '../interfaces/reservation.interface';

// IMPORTACIÓN NECESARIA PARA ACCEDER AL SOCKET.IO
// Asumimos que Server.ts exporta la clase Server por defecto
import Server from "../server";
import Notifications from "../classes/Notifications";

// Los modelos se obtienen dentro de cada handler con getModels()

const router = Router();

// Ruta POST principal para crear una reserva
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
    const { reservation, invitation, amenity, user, notification, checkin } = getModels();
    let { date, details, id_user, id_amenity, guests } = req.body;

    // Normalizar guests si viene como string (multipart/form-data)
    if (typeof guests === 'string') {
        try {
            guests = JSON.parse(guests);
        } catch (e) {
            return res.status(400).json({ msg: "Formato inválido en 'guests'. Debe ser JSON serializado." });
        }
    }

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

        // Paso 2: Crear los invitados si existen (normalizando claves)
        if (guests && guests.length > 0) {
            const invitations = guests.map((g: any) => ({
                guest_name: g.guest_name ?? g.nombre ?? g.firstName ?? g.name ?? g.Nombre ?? '',
                guest_lastname: g.guest_lastname ?? g.apellido ?? g.lastName ?? g.lastname ?? g.Apellido ?? '',
                dni: g.dni ?? g.DNI ?? g.idNumber ?? g.documento ?? g.Documento ?? '',
                id_reservation: (newReservation as any).id
            }));
            console.log('Invitations to create:', invitations);
            await invitation.bulkCreate(invitations);
        }

        // Paso 3: Crear la notificación para el administrador (formateada)
        // Obtener nombres legibles
        const owner = await user.findByPk(id_user);
        const amen = await amenity.findByPk(id_amenity);

        const ownerName = `${(owner as any)?.name ?? 'Propietario'}${(owner as any)?.lastname ? ' ' + (owner as any).lastname : ''}`.trim();
        const amenityName = (amen as any)?.name ?? 'Amenidad';

        // Formatear fecha: DD/MM HH:mm
        const dt = new Date(date);
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const hh = String(dt.getHours()).padStart(2, '0');
        const mi = String(dt.getMinutes()).padStart(2, '0');
        const whenStr = `${dd}/${mm} ${hh}:${mi}`;

        const notifTitle = 'Nueva solicitud de reserva';
        const notifContent = `${ownerName} solicitó reserva para ${amenityName} (${whenStr})`;

        const newNotification = await notification.create({
            title: notifTitle,
            content: notifContent,
            id_user: 1 // ID del administrador
        });

        // PASO 4: EMITIR LA NOTIFICACIÓN EN TIEMPO REAL
        // Accedemos a la instancia Singleton del servidor y a su objeto io (Socket.io)
        const serverInstance = Server.instance;

        // Validamos que exista y emitimos el evento que el frontend está escuchando
        if (serverInstance && serverInstance.io) {
            // Incluir metadatos útiles para deep-link (sin requerir migración de DB)
            const payload = {
                ...(newNotification as any).toJSON?.() ?? newNotification,
                type: 'reservation_request',
                reservation_id: (newReservation as any).id,
                ownerName,
                amenityName,
                whenStr
            };
            serverInstance.io.emit('new-notification', payload);
        }

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
            const { reservation, amenity, invitation, user } = getModels();
            const reservations = await reservation.findAll({
                where: { status },
                include: [
                    { model: amenity, as: 'amenity' },
                    { model: invitation, as: 'invitations' },
                    { model: user, as: 'user' }
                ]
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

    const { reservation, amenity, invitation, user } = getModels();
    const reservations = await reservation.findAll({
        include: [
            { model: amenity, as: 'amenity' },
            { model: invitation, as: 'invitations' },
            { model: user, as: 'user' }
        ]
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
    const { reservation, invitation, user, amenity, checkin, notification } = getModels();
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
        // Asegurar id_country válido (single-country fallback: 1)
        const id_country = Number((event as any).amenity?.id_country) || 1;

        if (!event.date) {
            return res.status(400).json({ msg: "La reserva no tiene fecha definida" });
        }

        const invitations = await invitation.findAll({ where: { id_reservation } });

        const invitations_to_checkin = invitations.map((inv: any) => ({
            guest_name: inv.guest_name ?? inv.name ?? '',
            guest_lastname: inv.guest_lastname ?? inv.lastname ?? '',
            DNI: String(inv.dni ?? '').trim(),
            confirmed_by_owner: true,
            check_in: false,
            check_out: false,
            income_date: event.date,
            id_owner,
            id_country
            })).filter((ci: any) => ci.guest_name && ci.guest_lastname && ci.DNI);

        if (invitations_to_checkin.length > 0) {
            try {
                await checkin.bulkCreate(invitations_to_checkin);
            } catch (e) {
                console.error('Error al crear checkins desde invitaciones:', e);
                return res.status(500).json({ msg: 'Error al generar ingresos para invitados aprobados', error: String(e) });
            }
        }

        // Notificar al propietario sobre el resultado de la aprobación (DB + Socket)
        try {
            // Formatear fecha: DD/MM HH:mm
            const dt = new Date(event.date);
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const hh = String(dt.getHours()).padStart(2, '0');
            const mi = String(dt.getMinutes()).padStart(2, '0');
            const whenStr = `${dd}/${mm} ${hh}:${mi}`;

            const amenityName = (event as any).amenity?.name ?? 'Amenidad';
            const titleOwner = newStatus === 'aprobado' ? 'Reserva aprobada' : 'Reserva rechazada';
            const contentOwner = `Tu reserva para ${amenityName} (${whenStr}) fue ${newStatus}`;

            const ownerNotification = await notification.create({
                id_user: id_owner,
                title: titleOwner,
                content: contentOwner,
                read: false
            });

            // Emitir por socket para el propietario
            const serverInstance = Server.instance;
            if (serverInstance && serverInstance.io) {
                const payload = {
                    ...(ownerNotification as any).toJSON?.() ?? ownerNotification,
                    type: 'reservation_status',
                    reservation_id: Number(id_reservation),
                    amenityName,
                    whenStr
                };
                serverInstance.io.emit('new-notification', payload);
            }
        } catch (e) {
            console.error('Error al notificar al propietario sobre el estado de la reserva:', e);
        }

        // 🆕 NOTIFICAR A LOS GUARDIAS SI LA RESERVA FUE APROBADA
        if (newStatus === 'aprobado') {
            try {
                // Formatear fecha para los guardias
                const dt = new Date(event.date);
                const dd = String(dt.getDate()).padStart(2, '0');
                const mm = String(dt.getMonth() + 1).padStart(2, '0');
                const hh = String(dt.getHours()).padStart(2, '0');
                const mi = String(dt.getMinutes()).padStart(2, '0');
                const whenStr = `${dd}/${mm} ${hh}:${mi}`;

                const amenityName = (event as any).amenity?.name ?? 'Amenidad';
                const ownerName = `${event.user?.name ?? ''} ${event.user?.lastname ?? ''}`.trim() || 'Propietario';

                // Obtener todos los guardias del country
                const { role, guard_country, user } = getModels();
                
                // Buscar el rol de vigilador
                const guardRole = await role.findOne({ where: { name: 'vigilador' } });
                
                if (guardRole) {
                    // Obtener guardias asignados a este country
                    const guardsInCountry = await guard_country.findAll({
                        where: { id_country },
                        include: [{
                            model: user,
                            as: 'user',
                            where: { role_id: (guardRole as any).id }
                        }]
                    });

                    const serverInstance = Server.instance;

                    // Crear notificación para cada guardia
                    for (const guardCountry of guardsInCountry) {
                        const guard = (guardCountry as any).user;
                        if (!guard) continue;

                        const guardNotification = await notification.create({
                            id_user: guard.id,
                            title: 'Nuevo Evento Aprobado',
                            content: `${ownerName} tiene un evento en ${amenityName} (${whenStr})`,
                            read: false
                        });

                        console.log(`✅ Notificación enviada a guardia ID: ${guard.id}`);

                        // Emitir por WebSocket
                        if (serverInstance && serverInstance.io) {
                            const payload = {
                                ...(guardNotification as any).toJSON?.() ?? guardNotification,
                                id_user: guard.id,
                                type: 'reservation_status',
                                reservation_id: Number(id_reservation),
                                amenityName,
                                ownerName,
                                whenStr,
                                read: false
                            };
                            serverInstance.io.emit('new-notification', payload);
                        }
                    }

                    console.log(`📢 Notificaciones enviadas a ${guardsInCountry.length} guardias del country ${id_country}`);
                }
            } catch (e) {
                console.error('❌ Error al notificar a los guardias sobre el evento aprobado:', e);
                // No interrumpir el flujo principal
            }
        }

    } catch (error) {
        return res.status(500).send({
            msg: "Error interno en el servidor"
        });
    }

    return res.status(200).json({ msg, status: newStatus });
});

router.get('/get_by_user/:id_user', [
    check('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    check('id_user').custom(userExists)
], async (req: Request, res: Response) => {
    const { id_user } = req.params;
    const { reservation } = getModels();
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
    const { reservation, user, amenity } = getModels();
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