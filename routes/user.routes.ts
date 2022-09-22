import { Router } from "express";
import UserController from "../controller/user.controller";
const router = Router();

const controller: UserController = new UserController();

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
router.post('/', controller.register);



export default router;