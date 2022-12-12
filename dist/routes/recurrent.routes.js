"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const recurrent_controller_1 = __importDefault(require("../controller/recurrent.controller"));
const propertyExists_middleware_1 = __importDefault(require("../middlewares/customs/propertyExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const recurrent = new recurrent_controller_1.default();
//TODO: ADMIN only
router.get('/', recurrent.getAll);
//TODO: ADMIN only
router.get('/:id', recurrent.getByID);
router.post('/', [
    (0, express_validator_1.check)('id_property', 'El id de propiedad es obligatorio').notEmpty(),
    (0, express_validator_1.check)('guest_name', 'El nombre del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('guest_lastname', 'El apellido del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('dni', 'El dni del invitado es obligatorio').notEmpty(),
    (0, express_validator_1.check)('id_property').custom(propertyExists_middleware_1.default),
    noErrors_middleware_1.default
], recurrent.create);
exports.default = router;
//# sourceMappingURL=recurrent.routes.js.map