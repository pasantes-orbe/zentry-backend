import { Router } from "express";
import UserController from "../controller/user.controller";
import emailAlreadyExists from "../middlewares/emailAlreadyExists.middleware";
const router = Router();

const controller: UserController = new UserController();

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
router.post('/', emailAlreadyExists, controller.register);



export default router;