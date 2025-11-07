// routes/notification.routes.ts
import { Router, Request, Response } from "express";
import { check, body } from "express-validator";
import NotificationsController from "../controller/notifications.controller";
import noErrors from "../middlewares/noErrors.middleware";
import { getModels } from "../models/getModels";

const router = Router();

const notificationController: NotificationsController = new NotificationsController();

// GET UNREAD COUNT BY USER (poner antes de rutas genéricas)
router.get('/unread-count/:id_user', [
    check('id_user').notEmpty(),
    check('id_user').isNumeric(),
    noErrors
], (req: Request, res: Response) => notificationController.getUnreadCount(req, res));

// GET ALL NOTIFICATIONS BY USER (alias preferido)
router.get('/user/:id_user', [
    check('id_user').notEmpty(),
    check('id_user').isNumeric(),
    noErrors
], (req: Request, res: Response) => notificationController.getAllByIdUser(req, res));

// GET ALL NOTIFICATIONS BY USER
router.get('/:id_user', [
    check('id_user').notEmpty(),
    check('id_user').isNumeric(),
    noErrors
], (req: Request, res: Response) => notificationController.getAllByIdUser(req, res));

router.patch('/read/:id_notification', [
    check('id_notification').isNumeric(),
    noErrors
], (req: Request, res: Response) => {
    const { id_notification } = req.params;
    const { notification } = getModels();
    notification.update(
        { read: true },
        { where: { id: id_notification } }
    )
    .then(() => res.json({ msg: 'Notificación marcada como leída.' }))
    .catch((err: unknown) => res.status(500).json({ msg: 'Error al actualizar la notificación', error: err }));
});

// POST READ BULK (preferido por el front) - acepta body { notificationIds: number[] } o { ids: number[] }
router.post('/read', [
    body('notificationIds').optional().isArray(),
    body('ids').optional().isArray(),
    noErrors
], (req: Request, res: Response) => notificationController.markAsReadBulk(req, res));

// PATCH READ BULK (compatibilidad)
router.patch('/read', (req: Request, res: Response) => notificationController.markAsReadBulk(req, res));

// CREATE NOTIFICATION (para frontend)
router.post('/', [
    body('ownerId').optional({ nullable: true, checkFalsy: true }),
    body('title').optional({ nullable: true }).isString(),
    body('message').optional({ nullable: true }).isString(),
    noErrors
], (req: Request, res: Response) => notificationController.create(req, res));

export default router;