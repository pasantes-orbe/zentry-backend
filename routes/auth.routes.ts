import { Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const auth: AuthController = new AuthController();

//TODO: ADMIN only
router.post('/login', [
    check('email', "Introduce un email").notEmpty(),
    check('password', "Introduce una contraseña").notEmpty(),
    noErrors
] , auth.login);

export default router;