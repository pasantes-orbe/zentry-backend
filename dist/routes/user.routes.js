"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const express_validator_1 = require("express-validator");
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const emailAlreadyExists_middleware_1 = __importDefault(require("../middlewares/customs/emailAlreadyExists.middleware"));
const isAdmin_middleware_1 = __importDefault(require("../middlewares/jwt/isAdmin.middleware"));
const router = (0, express_1.Router)();
const controller = new user_controller_1.default();
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
router.post('/', [
    //TODO: Comprobar que el usuario que quiere registrar un nuevo usuario sea de ROL "administrador (id: 1)" 
    (0, express_validator_1.check)('email', 'El email es obligatorio').notEmpty(),
    (0, express_validator_1.check)('email', 'El correo no es válido').isEmail(),
    (0, express_validator_1.check)('email').custom(emailAlreadyExists_middleware_1.default),
    (0, express_validator_1.check)('name', 'El nombre es obligatorio').notEmpty(),
    (0, express_validator_1.check)('lastname', 'El apellido es obligatorio').notEmpty(),
    (0, express_validator_1.check)('password', 'La contraseña es obligatoria').notEmpty(),
    (0, express_validator_1.check)('dni', 'El DNI es obligatorio').notEmpty(),
    (0, express_validator_1.check)('role_id', 'El rol es obligatorio').notEmpty(),
    noErrors_middleware_1.default
], controller.register);
/**
 * Request Change Password
 */
router.post('/request-change-password', [
    (0, express_validator_1.check)('email', "Campo 'email' obligatorio").notEmpty(),
    (0, express_validator_1.check)('email', "El email no es valido").isEmail(),
    noErrors_middleware_1.default
], controller.RequestChangePassword);
/**
 * Change Password
 */
router.patch('/change-password/:id_request', [
    isAdmin_middleware_1.default,
    (0, express_validator_1.check)('password', "El campo 'password' no debe estar vacío").notEmpty(),
    noErrors_middleware_1.default
], controller.changePassword);
/**
 * All Password Change Requests
 */
router.get('/requests/password-changes', controller.allPasswordChangeRequests);
exports.default = router;
//# sourceMappingURL=user.routes.js.map