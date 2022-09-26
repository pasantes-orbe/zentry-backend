"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controller/user.controller"));
<<<<<<< HEAD
const emailAlreadyExists_middleware_1 = __importDefault(require("../middlewares/emailAlreadyExists.middleware"));
=======
const express_validator_1 = require("express-validator");
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const emailAlreadyExists_middleware_1 = __importDefault(require("../middlewares/customs/emailAlreadyExists.middleware"));
>>>>>>> eb20a8dd88e987cfaa6b9827a6e66fcab6e18a90
const router = (0, express_1.Router)();
const controller = new user_controller_1.default();
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
<<<<<<< HEAD
router.post('/', emailAlreadyExists_middleware_1.default, controller.register);
=======
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
>>>>>>> eb20a8dd88e987cfaa6b9827a6e66fcab6e18a90
exports.default = router;
//# sourceMappingURL=user.routes.js.map