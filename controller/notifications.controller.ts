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
}

export default NotificationsController;
