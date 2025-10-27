// routes/user.routes.ts
import { Request, Response, Router } from "express";
import UserController from "../controller/user.controller";
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
// Importamos el validador adaptado con el nombre correcto
import emailAlreadyExistsValidator from "../middlewares/customs/emailAlreadyExists.middleware";
import isTheUser from "../middlewares/jwt/isTheUser.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import validateJWT from "../middlewares/jwt/validateJWT.middleware";

// Importamos el objeto 'db' centralizado de forma correcta para TypeScript
import db from '../models';

const router = Router();
const controller: UserController = new UserController();

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);

router.post('/', [
    check('email', 'El email es obligatorio').notEmpty(),
    check('email', 'El correo no es válido').isEmail(),
    // Usamos el validador adaptado con el nombre correcto
    check('email').custom(emailAlreadyExistsValidator),
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('lastname', 'El apellido es obligatorio').notEmpty(),
    check('password', 'La contraseña es obligatoria').notEmpty(),
    check('dni', 'El DNI es obligatorio').notEmpty(),
    check('role_id', 'El rol es obligatorio').notEmpty(),
    noErrors
], controller.register);

/**
 * Request Change Password
 */
router.post('/request-change-password', [
    check('email', "Campo 'email' obligatorio").notEmpty(),
    check('email', "El email no es valido").isEmail(),
    noErrors
], controller.RequestChangePassword);

/**
 * Change Password
 */
router.patch('/change-password/:id', [validateJWT, isTheUser],
    controller.changePassword);

// Admin aprueba/atiende una solicitud de cambio de contraseña
router.patch('/change-password/:id_request', [
    validateJWT,
    check('id_request').notEmpty(),
    check('id_request').isNumeric(),
    noErrors
], (req: Request, res: Response) => controller.approvePasswordChangeRequest(req, res));

/**
 * Update User
 */

router.patch('/update-user/:id', [
    check('id').notEmpty(),
    check('id').isNumeric(),
    noErrors
], controller.updateUser)

// Upload/Update user avatar
router.patch('/avatar/:id', [
    check('id').notEmpty(),
    check('id').isNumeric(),
    noErrors
], controller.updateAvatar)

// Delete user by id (admin only)
router.delete('/:id', [
    validateJWT,
    isAdmin,
    check('id').notEmpty(),
    check('id').isNumeric(),
    noErrors
], controller.deleteUser)

/**
 * All Password Change Requests
 */
router.get('/requests/password-changes', controller.allPasswordChangeRequests);

/**
 * Get "Rol Propietarios" By Country
 */
router.get('/owners/get_by_country/:id_country', [
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    noErrors
], async (req: Request, res: Response) => {
    // Usamos los nombres de los modelos en minúsculas
    const propietarios = await db.owner_country.findAll({
        where: {
            id_country: req.params.id_country
        },
        include: [db.user, db.country] // Usamos los nombres de los modelos en minúsculas
    })

    // Normalizar avatar del usuario incluido (cuando venga como public_id/relativo)
    const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
    const cloudName = 'dkfzxplwp';
    const toAvatarUrl = (val?: string | null) => {
        if (!val) return placeholder;
        const s = String(val);
        if (/^https?:\/\//i.test(s)) return s;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${s}`;
    };

    const response = propietarios.map((p: any) => {
        const json = p.toJSON ? p.toJSON() : p;
        if (json.user) {
            json.user.avatar = toAvatarUrl(json.user.avatar);
        }
        return json;
    });

    return res.json(response);
});

export default router;