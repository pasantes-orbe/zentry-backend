import { Router } from "express";
import UserController from "../controller/user.controller";
<<<<<<< HEAD
import emailAlreadyExists from "../middlewares/emailAlreadyExists.middleware";
=======
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
import emailAlreadyExists from "../middlewares/customs/emailAlreadyExists.middleware";

>>>>>>> eb20a8dd88e987cfaa6b9827a6e66fcab6e18a90
const router = Router();

const controller: UserController = new UserController();

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
<<<<<<< HEAD
router.post('/', emailAlreadyExists, controller.register);
=======

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
>>>>>>> eb20a8dd88e987cfaa6b9827a6e66fcab6e18a90



export default router;