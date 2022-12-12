import { Router } from "express";
import UserController from "../controller/user.controller";
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
import emailAlreadyExists from "../middlewares/customs/emailAlreadyExists.middleware";
import isTheUser from "../middlewares/jwt/isTheUser.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";

const router = Router();

const controller: UserController = new UserController();

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);

router.post('/', [
    //TODO: Comprobar que el usuario que quiere registrar un nuevo usuario sea de ROL "administrador (id: 1)" 
    check('email', 'El email es obligatorio').notEmpty(),
    check('email', 'El correo no es válido').isEmail(),
    check('email').custom( emailAlreadyExists ),
    check('name', 'El nombre es obligatorio').notEmpty(),
    check('lastname', 'El apellido es obligatorio').notEmpty(),
    check('password', 'La contraseña es obligatoria').notEmpty(),
    check('dni', 'El DNI es obligatorio').notEmpty(),
    check('role_id', 'El rol es obligatorio').notEmpty(),
    noErrors
] ,controller.register);

/**
 * Request Change Password
 */
router.post('/request-change-password/', [
    check('email', "Campo 'email' obligatorio").notEmpty(),
    check('email', "El email no es valido").isEmail(),
    noErrors
] , controller.RequestChangePassword);

/**
 * Change Password
 */
router.patch('/change-password/:id_request', [
    isAdmin,
    check('password', "El campo 'password' no debe estar vacío").notEmpty(),
    noErrors
], controller.changePassword);

/**
 * All Password Change Requests
 */
router.get('/requests/password-changes', controller.allPasswordChangeRequests);


export default router;