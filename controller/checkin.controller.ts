// controller/checkin.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
// Importamos el objeto 'db' centralizado para acceder a todos los modelos
import db from "../models";
import CheckIn from "../classes/CheckIn";
import Server from "../models/server";
import Guard from "../classes/Guard";
import { CheckoutInterface } from "../interfaces/checkout.interface";

// Desestructuramos los modelos necesarios del objeto 'db' con los nombres correctos
const { checkin, checkout, user } = db;

class CheckInController {

    public async create(req: Request, res: Response) {
        try {
            // 1. Normalizar id_owner: Si es 0, null, undefined o no viene → guardarlo como null
            if (!req.body.id_owner || req.body.id_owner === 0) {
                req.body.id_owner = null;
            }

            // 2. Manejo del confirmed_by_owner: 
            // Si NO hay propietario (id_owner es null), auto-confirmar
            // Si hay propietario, usar el valor enviado o false por defecto
            const confirmedByOwner = req.body.id_owner 
                ? (req.body.confirmed_by_owner === 'true' || req.body.confirmed_by_owner === true)
                : true; // ✅ Auto-confirmar si no hay propietario
            req.body.confirmed_by_owner = confirmedByOwner;

            // 3. Flags de estado: 
            // Siempre inicia con check_in: false (requiere autorización de ingreso por admin/guardia)
            // Tanto con propietario como sin propietario necesitan aprobación de ingreso físico
            req.body.check_in = false;
            req.body.check_out = false;

            // 4. Normalización de campos opcionales a null si vienen vacíos (se limpia transport, details)
            req.body.transport = req.body.transport?.trim() || null;
            req.body.details = req.body.details?.trim() || null;
            req.body.id_guard = req.body.id_guard || null; // id_guard siempre será null en Visita Rápida (viene de owner)
            
            // 5. Patente en mayúsculas y normalización.
            if (req.body.patent) {
                req.body.patent = req.body.patent.toUpperCase().trim() || null;
            } else {
                req.body.patent = null;
            }

            // 6. Verificación de guardia (mantenemos el chequeo, aunque para owner será null).
            if (req.body.id_guard) {
                const guardExists = await new Guard().exists(req.body.id_guard);
                if (!guardExists) {
                    console.log("--------Guardia no existe--------");
                    req.body.id_guard = null;
                }
            }
            
            // --- Fin de la lógica de normalización ---

            const newCheckIn = await checkin.create(req.body);
            // --- Notificación al propietario (si hay id_owner) ---
            try {
            const hasOwner = !!newCheckIn.getDataValue('id_owner');
            if (hasOwner && (db as any).notification) {
                const title = 'Vigilador';
                const content = `Solicitud de ingreso de ${newCheckIn.getDataValue('guest_name')} ${newCheckIn.getDataValue('guest_lastname')} enviada por vigilador.`;
                await (db as any).notification.create({
                id_user: newCheckIn.getDataValue('id_owner'),
                title,
                content,
                read: false
                });

                // Emitir socket para el propietario
                const server = Server.instance;
                server.io.emit('new-notification', {
                id_user: newCheckIn.getDataValue('id_owner'),
                title,
                content,
                read: false,
                type: 'checkin-request',
                checkin: newCheckIn
                });
            }
            } catch (e) {
            console.log('[create] No se pudo crear/emitar notificación al owner:', e);
            }

            // Emitir socket. Usamos el evento 'notificarNuevoConfirmedByOwner' para avisar a la garita
            // sobre la nueva autorización si fue confirmada por el propietario.
            const server = Server.instance;
            if (confirmedByOwner) {
                const msgType = req.body.id_owner 
                    ? `Visita rápida de ${req.body.guest_lastname} ${req.body.guest_name} autorizada por propietario.`
                    : `Check-in sin propietario: ${req.body.guest_lastname} ${req.body.guest_name} (${req.body.details || 'Sin detalles'})`;
                
                server.io.emit('notificarNuevoConfirmedByOwner', { 
                    msg: msgType, 
                    checkIn: newCheckIn 
                });
            } else {
                // Lógica de check-in normal (sin confirmar)
                server.io.emit('notificar-checkin', { msg: `${req.body.guest_lastname} ${req.body.guest_name} está solicitando check-in`, checkIn: newCheckIn });
            }

            const responseMsg = req.body.id_owner
                ? "Autorización de Visita Rápida registrada exitosamente"
                : "Check-in sin propietario registrado. Pendiente de autorización de ingreso";

            return res.status(201).json({ // Usamos 201 Created para indicar la creación exitosa
                msg: responseMsg,
                checkIn: newCheckIn
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al crear Check-In" });
        }
    }

        public async approve(req: Request, res: Response) {
    try {
        const id = Number(req.params.id_checkin);
        const row = await checkin.findByPk(id);

        if (!row) return res.status(404).json({ msg: "Check-In no existe" });

        // ✅ Marcar como ingresado
        await row.update({ check_in: true });

        // ✅ Emitir actualización en tiempo real
        const server = Server.instance;
        server.io.emit('refresh-checkins', { id });

        return res.json({
        msg: "Ingreso aprobado por guardia",
        checkIn: row
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error al aprobar Check-In" });
    }
    }

    public async ownerConfirm(req: Request, res: Response) {
    try {
        const id = Number(req.params.id_checkin);

        const row = await checkin.findByPk(id, {
        include: [
            { model: user, as: 'guardUser' },
            { model: user, as: 'ownerUser' }
        ]
        });

        if (!row) return res.status(404).json({ msg: 'Check-In no existe' });

        // ✅ Confirmar y marcar ingreso
        await checkin.update(
        { confirmed_by_owner: true, check_in: true },
        { where: { id } }
        );

        const updated = await checkin.findByPk(id, {
        include: [
            { model: user, as: 'guardUser' },
            { model: user, as: 'ownerUser' }
        ]
        });

        const server = Server.instance;
        const title = 'Propietario';
        const content = `Autorizó a ${updated?.getDataValue('guest_name')} ${updated?.getDataValue('guest_lastname')}`;

        if ((db as any).notification && updated?.getDataValue('id_guard')) {
        await (db as any).notification.create({
            title,
            content,
            id_user: updated.getDataValue('id_guard'),
            read: false
        });
        }

        server.io.emit('new-notification', {
        id_user: updated?.getDataValue('id_guard'),
        title,
        content,
        read: false,
        type: 'checkin-owner-approved',
        checkin: updated
        });

        server.io.emit('notificar-nuevo-confirmedByOwner', { checkIn: updated });

        return res.json({ msg: 'Check-In confirmado por propietario', checkIn: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error al confirmar Check-In' });
    }
    }



    public async changeStatus(req: Request, res: Response) {
        try {
            const { id_checkin } = req.params;
            const { new_status } = req.body;

            const update = await new CheckIn().changeStatus(+id_checkin, new_status);
            if (!update) {
                return res.status(404).json({ msg: "Check-in no existe" });
            }

            return res.json({ msg: "Check-in actualizado correctamente", update });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al actualizar estado" });
        }
    }

    public async getApproved(req: Request, res: Response) {
        try {
            const { id_country } = req.params;
            const checkins = await checkin.findAll({
                where: { id_country, check_in: true },
                include: [
                    {model: user, as: 'guardUser'},
                    {model: user, as: 'ownerUser'}
                ]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins aprobados" });
        }
    }

    public async getConfirmedByOwner(req: Request, res: Response) {
        try {
            const { id_country } = req.params;
            const checkins = await checkin.findAll({
                where: { confirmed_by_owner: true, check_in: false, id_country },
                include: [
                    {model: user, as: 'guardUser'},
                    {model: user, as: 'ownerUser'}
                ]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins confirmados" });
        }
    }

    public async getRegisters(req: Request, res: Response) {
        try {
            const { id_country } = req.params;
            const responseArray: any[] = [];

            const checkins = await checkin.findAll({
                where: { id_country, check_in: true }
            });

            for (const checkin of checkins) {
                const checkedOut = await checkout.findOne({
                    where: { id_checkin: checkin.id }
                });

                responseArray.push({ checkin, checkout: checkedOut });
            }

            return res.json(responseArray);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener registros" });
        }
    }

    public async getCheckOutFalse(req: Request, res: Response) {
        try {
            const checkins = await checkin.findAll({
                where: { check_out: false, check_in: true, confirmed_by_owner: true },
                include: [
                    { model: user, as: 'guardUser'},
                    { model: user, as: 'ownerUser'}
                ]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkouts pendientes" });
        }
    }

    public async getByOwner(req: Request, res: Response) {
        try {
            const { id_owner } = req.params;
            const checkins = await checkin.findAll({
                where: { id_owner },
                include: [{ all: true }]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins por propietario" });
        }
    }

    public async checkOutConfirmed(req: Request, res: Response) {
        try {
            const { id_checkin } = req.params;
            const update = await new CheckIn().checkOutConfirm(+id_checkin);
            if (!update) {
                return res.status(404).json({ msg: "Check-in no existe" });
            }
            return res.json({ msg: "Check-out confirmado", update });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al confirmar check-out" });
        }
    }

    public async getcheckInsToday(req: Request, res: Response) {
        try {
            const { id_owner } = req.params;
            const TODAY_START = new Date().setHours(0, 0, 0, 0);
            const NOW = new Date().setHours(23, 59);
            const checkins = await checkin.findAll({
                where: {
                    id_owner,
                    income_date: {
                        [Op.gt]: TODAY_START,
                        [Op.lt]: NOW
                    }
                },
                include: [
                    { model: user, as: 'ownerUser' },
                    { model: user, as: 'guardUser' }
                ]
            });
            return res.json(checkins);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al obtener checkins de hoy" });
        }
    }

}

export default new CheckInController();



/*import { Request, response, Response } from "express";
import { check } from "express-validator";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import CheckIn from "../classes/CheckIn";
import Guard from "../classes/Guard";
import CheckInModel from "../models/checkin.model";
import CheckOutModel from "../models/checkout.model";
import Server from "../models/server";
import User from "../models/user.model";
class checkInController {
    public async create(req: Request, res: Response){
        const {
            guest_name,
            guest_lastname,
            DNI,
            income_date,
            transport,
            patent,
            details,
            id_guard,
            id_owner,
            confirmed_by_owner,
            id_country,
            check_out
        } = req.body


        if(!confirmed_by_owner){
            req.body.confirmed_by_owner = false
        } else {
            req.body.confirmed_by_owner = true
        }

        if(!check_out){
            req.body.check_out = false
        } else {
            req.body.check_out = null
        }
    

        if(patent){
            req.body.patent = req.body.patent.toUpperCase();
        }

        if(req.body.id_guard){

            const guard = await new Guard().exists(id_guard);
            // SI NO ES UN id_guard CORRESPONDIENTE A UN GUARDIA O INVÁLIDO lo tomará como NULL
            if(!guard){
                console.log("--------Guardia no existe--------");
                req.body.id_guard = null
            }

        }
        req.body.check_in = false;

        const checkIn = new CheckInModel(req.body);
        checkIn.save();

        // Emitir socket
        const server = Server.instance;
        server.io.emit('notificar-checkin', {msg: `${guest_lastname} ${guest_name} está solicitando check-in`, checkIn});

        return res.send({
            msg: "Check-In registrado exitosamente",
            checkIn
        });

    }

    public async approve(req: Request, res: Response){

        const { id_checkin } = req.params;
        
        const update = await new CheckIn().approve(+id_checkin);

        if(!update){
            return res.status(400).send({
                msg: "Check-in no existe o no fue aprobado por el propietario"
            })
        }

        
        const server = Server.instance;

        res.send(update);

    }

    public async ownerConfirm(req: Request, res: Response){

        const { id_checkin } = req.params;
        
        const update = await new CheckIn().ownerConfirm(+id_checkin);

        if(!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        }

        
        const server = Server.instance;
        server.io.emit('checkin-confirmado-por-propietario', {msg: `Check-in de ${update.guest_name} ${update.guest_lastname} confirmado`, update});

        res.send({
            msg: "Check-in confirmado",
            update
        });

    }

    public async changeStatus(req: Request, res: Response){
        
        const {id_checkin} = req.params;

        const {new_status} = req.body;

        const update = await new CheckIn().changeStatus(+id_checkin, new_status)

        if (!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        }

        res.send({
            msg: "Check-in actualizado correctamente",
            update
        });

    }

    public async getApproved(req: Request, res: Response){

        const {id_country} = req.params
        const checkins = await CheckInModel.findAll({
            where: {
                id_country,
                check_in: true
            },
            include: [User]
        })

        res.send(checkins);

    }
    public async getConfirmedByOwner(req: Request, res: Response){

        const {id_country} = req.params

        const checkins = await CheckInModel.findAll({
            where: {
                confirmed_by_owner: true,
                check_in: false,
                id_country,
            },
            include: [User]
        })

        res.send(checkins);

    }

    public async getRegisters(req: Request, res: Response){

        const responseArray: any[] = []

        const {id_country} = req.params;
        const checkins = await CheckInModel.findAll({
            where: {
                id_country,
                check_in: true
            },
        })

        for (let i=0; i< checkins.length; i++){
            const checkout = await CheckOutModel.findOne({
                where: {
                    id_checkin: checkins[i].id
                }
            })

            responseArray.push({
                checkin: checkins[i],
                checkout: checkout
            } )
        }

        res.send(responseArray);        

    }

    public async getCheckOutFalse(req: Request, res: Response){

        const checkins = await CheckInModel.findAll({
            where: {
                check_out: false,
                check_in: true,
                confirmed_by_owner:true
            },
            include: [User]
        })

        res.send(checkins);

    }

    public async getByOwner(req: Request, res: Response){

        const { id_owner } = req.params;

        const checkins = await CheckInModel.findAll({
            where: {
                id_owner
            },
            include: [{all:true}]
        })

        return res.send(checkins);

    }
    public async checkOutConfirmed(req: Request, res: Response){
        const { id_checkin } = req.params;
        
        const update = await new CheckIn().checkOutConfirm(+id_checkin)
        if(!update){
            return res.status(404).send({
                msg: "Check-in no existe"
            })
        } 
        res.send({
            msg: "Check-out confirmado",
            update
        });
    } 
    public async getcheckInsToday(req: Request, res: Response){
        const {id_owner} = req.params;
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const NOW = new Date().setHours(23,59)
        const checkins = await CheckInModel.findAll({
            where: {
                id_owner,
                income_date: {
                    [Op.gt]: TODAY_START,
                    [Op.lt]: NOW
                }
            },
            include: [{
                model: User,
                as: 'owner'
            },
            {
                model: User,
                as: 'guard'
            }]
        })
            res.send(checkins);        
    }
}
export default checkInController*/
