import { Request, Response, Router } from "express";
import UserController from "../controller/user.controller";
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
import emailAlreadyExists from "../middlewares/customs/emailAlreadyExists.middleware";
import isTheUser from "../middlewares/jwt/isTheUser.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import OwnerCountry from "../models/owner_country.model";
import CountryModel from "../models/country.model";
import User from "../models/user.model";

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
router.post('/request-change-password', [
    check('email', "Campo 'email' obligatorio").notEmpty(),
    check('email', "El email no es valido").isEmail(),
    noErrors    
] , controller.RequestChangePassword);

/**
 * Change Password
 */
router.patch('/change-password/:id_request', [
    isAdmin,
], controller.changePassword);

/**
 * Update User
 */

router.patch('/update-user/:id', [
    check('id').notEmpty(),
    check('id').isNumeric(),
    noErrors
], controller.updateUser)

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
    const propietarios = await OwnerCountry.findAll({
        where: {
            id_country: req.params.id_country
        },
        include: [User, CountryModel]
    })

    return res.json(propietarios);
});

export default router;