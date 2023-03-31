"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const recurrent_controller_1 = __importDefault(require("../controller/recurrent.controller"));
const propertyExists_middleware_1 = __importDefault(require("../middlewares/customs/propertyExists.middleware"));
const recurrentExists_middleware_1 = __importDefault(require("../middlewares/customs/recurrentExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const recurrent = new recurrent_controller_1.default();
//TODO: ADMIN only
router.get('/', recurrent.getAll);
//TODO: ADMIN only
router.get('/:id', recurrent.getByID);
/**
 * Get Recurrents by Country
 */
router.get('/get-by-country/:id_country', [
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('id_country').isNumeric(),
    noErrors_middleware_1.default
], recurrent.getByCountry);
/**
 * Get Recurrents by Property
 */
router.get(`/get-by-property/:id_property`, [
    (0, express_validator_1.check)(`id_property`).notEmpty(),
    (0, express_validator_1.check)(`id_property`).isNumeric(),
    noErrors_middleware_1.default
], recurrent.getByProperty);
router.post('/', [
    (0, express_validator_1.check)('id_property', 'El id de propiedad es obligatorio').notEmpty(),
    (0, express_validator_1.check)('id_property', 'El id de propiedad debe ser numerico').isNumeric(),
    (0, express_validator_1.check)('guest_name', 'El nombre del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('guest_lastname', 'El apellido del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('dni', 'El dni del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('id_property').custom(propertyExists_middleware_1.default),
    noErrors_middleware_1.default
], recurrent.create);
router.patch('/:id_recurrent', [
    (0, express_validator_1.check)('id_recurrent', 'El id de recurrente debe ser numerico').isNumeric(),
    (0, express_validator_1.check)('id_recurrent').custom(recurrentExists_middleware_1.default),
    (0, express_validator_1.check)('status', 'El estado debe tomar valores de Verdadero o Falso').isBoolean(),
    noErrors_middleware_1.default,
], recurrent.changeStatus);
exports.default = router;
//# sourceMappingURL=recurrent.routes.js.map