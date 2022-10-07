import { Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const auth: AuthController = new AuthController();

router.post('/login', [
    check('email', "Introduce un email").notEmpty(),
    check('password', "Introduce una contraseña").notEmpty(),
    noErrors
] , auth.login);

router.post('/jwt', auth.jwtValidate);
router.post('/jwt/:role', auth.isRole);

export default router;