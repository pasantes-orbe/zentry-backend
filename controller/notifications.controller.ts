// controller/notifications.controller.ts
import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models"; 

// Desestructuramos el modelo notification del objeto 'db' con el nombre correcto
const { notification } = db;

class NotificationsController {
    public async getAllByIdUser(req: Request, res: Response) {
        const { id_user } = req.params;

        try {
            const notifications = await notification.findAll({
                where: { id_user },
                order: [["id", "DESC"]] // opcional: muestra las más recientes primero
            });

            return res.status(200).json(notifications);
        } catch (error) {
            console.error("Error getting notifications:", error);
            return res.status(500).json({
                msg: "Error interno al obtener las notificaciones",
            });
        }
    }

    public async getUnreadCount(req: Request, res: Response) {
        const { id_user } = req.params;
        try {
            const count = await notification.count({ where: { id_user, read: false } });
            return res.status(200).json({ count });
        } catch (error) {
            console.error("Error getting unread notifications count:", error);
            return res.status(500).json({ msg: "Error interno al obtener contador de no leídas" });
        }
    }

    public async markAsReadBulk(req: Request, res: Response) {
        const body = req.body as { ids?: number[]; notificationIds?: number[] } | undefined;
        const rawIds = body?.notificationIds ?? body?.ids ?? [];
        const idList = (Array.isArray(rawIds) ? rawIds : [])
            .map((n: any) => Number(n))
            .filter((n: any) => Number.isFinite(n));

        if (idList.length === 0) {
            return res.status(400).json({ msg: "Debe enviar un arreglo 'notificationIds' (o 'ids') con notificaciones a marcar como leídas" });
        }
        try {
            await notification.update({ read: true }, { where: { id: idList } });
            return res.status(200).json({ msg: "Notificaciones marcadas como leídas", ids: idList });
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            return res.status(500).json({ msg: "Error al marcar notificaciones como leídas" });
        }
    }

    public async create(req: Request, res: Response) {
        try {
            const { ownerId, title, message, read, reservationId, status } = req.body || {};

            const id_user = Number(ownerId);
            if (!Number.isFinite(id_user)) {
                return res.status(400).json({ msg: "'ownerId' debe ser un número válido (id de usuario destinatario)" });
            }
            if (!title || typeof title !== 'string') {
                return res.status(400).json({ msg: "'title' es requerido" });
            }
            if (!message || typeof message !== 'string') {
                return res.status(400).json({ msg: "'message' es requerido" });
            }

            const created = await notification.create({
                id_user,
                title,
                content: message,
                read: Boolean(read),
            });

            return res.status(201).json(created);
        } catch (error) {
            console.error("Error creating notification:", error);
            return res.status(500).json({ msg: "Error interno al crear la notificación" });
        }
    }
}

export default NotificationsController;
