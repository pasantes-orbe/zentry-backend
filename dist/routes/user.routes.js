"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const owner_country_model_1 = __importDefault(require("../models/owner_country.model"));
const country_model_1 = __importDefault(require("../models/country.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
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
], controller.changePassword);
/**
 * Update User
 */
router.patch('/update-user/:id', [
    (0, express_validator_1.check)('id').notEmpty(),
    (0, express_validator_1.check)('id').isNumeric(),
    noErrors_middleware_1.default
], controller.updateUser);
/**
 * All Password Change Requests
 */
router.get('/requests/password-changes', controller.allPasswordChangeRequests);
/**
 * Get "Rol Propietarios" By Country
 */
router.get('/owners/get_by_country/:id_country', [
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('id_country').isNumeric(),
    (0, express_validator_1.check)('id_country').custom(countryExists_middleware_1.default),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const propietarios = yield owner_country_model_1.default.findAll({
        where: {
            id_country: req.params.id_country
        },
        include: [user_model_1.default, country_model_1.default]
    });
    return res.json(propietarios);
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map