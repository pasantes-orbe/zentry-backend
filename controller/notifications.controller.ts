import { Request, Response } from "express";
import Notification from "../models/notification.model";

class NotificationsController {
    public async getAllByIdUser(req: Request, res: Response) {
        const { id_user } = req.params;

        try {
            const notifications = await Notification.findAll({
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
}

export default NotificationsController;
