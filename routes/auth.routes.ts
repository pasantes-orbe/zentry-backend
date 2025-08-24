// routes/auth.routes.ts
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

router.get('/jwt', auth.jwtValidate);
router.get('/jwt/:role', auth.isRole);


console.log('🔧 Auth routes cargadas');

router.get('/test', (req, res) => {
    console.log('✅ Ruta de prueba funcionando');
    res.json({ message: 'Auth routes working!', timestamp: new Date() });
});

export default router;