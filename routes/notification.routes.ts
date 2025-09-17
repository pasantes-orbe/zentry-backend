// routes/notification.routes.ts
import { Router, Request, Response } from "express";
import { check } from "express-validator";
import NotificationsController from "../controller/notifications.controller";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models"; // Importamos el objeto 'db' centralizado

// Desestructuramos el modelo 'notification' del objeto 'db'
const { notification } = db;

const router = Router();

const notificationController: NotificationsController = new NotificationsController();

// GET ALL NOTIFICATIONS BY USER
router.get('/:id_user',
[check('id_user').notEmpty(),
check('id_user').isNumeric(),
noErrors] 
,notificationController.getAllByIdUser);

router.patch('/read/:id_notification', [
    check('id_notification').isNumeric(),
    noErrors
], (req: Request, res: Response) => {
    // Lógica para marcar la notificación como leída
    const { id_notification } = req.params;
    notification.update(
        { read: true },
        { where: { id: id_notification } }
    )
    .then(() => res.json({ msg: 'Notificación marcada como leída.' }))
    .catch((err: unknown) => res.status(500).json({ msg: 'Error al actualizar la notificación', error: err }));
});

export default router;