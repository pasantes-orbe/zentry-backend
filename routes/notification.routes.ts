// routes/notification.routes.ts
import { Router } from "express";
import { check } from "express-validator";
import NotificationsController from "../controller/notifications.controller";
import RoleController from "../controller/role.controller";
import roleAlreadyExists from "../middlewares/customs/roleAlreadyExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const notificationController: NotificationsController = new NotificationsController();

//GET ALL NOTIFICATIONS BY USER
router.get('/:id_user',
[check('id_user').notEmpty(),
check('id_user').isNumeric(),
noErrors] 
,notificationController.getAllByIdUser);


export default router;