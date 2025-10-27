// routes/auth.routes.ts
import { Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import noErrors from "../middlewares/noErrors.middleware";
import validateJWT from "../middlewares/jwt/validateJWT.middleware";

const router = Router();
const auth: AuthController = new AuthController();

router.post('/login', [ 
    check('email', "Introduce un email").notEmpty(),
    check('password', "Introduce una contraseña").notEmpty(),
    noErrors
] , auth.login);

router.get('/jwt', auth.jwtValidate);
router.post('/jwt/:role', auth.isRole);
router.get('/jwt/:role', auth.isRole);

// Change Password (JWT required)
router.post('/change-password', [
    validateJWT,
    noErrors
], auth.changePassword);

// Reset password with token (no JWT)
router.post('/reset-password', [
    check('token', 'Token requerido').notEmpty(),
    check('newPassword', 'Nueva contraseña requerida').notEmpty(),
    noErrors
], auth.resetPassword);

console.log('🔧 Auth routes cargadas');

router.get('/test', (req, res) => {
    console.log('✅ Ruta de prueba funcionando');
    res.json({ message: 'Auth routes working!', timestamp: new Date() });
});

export default router;