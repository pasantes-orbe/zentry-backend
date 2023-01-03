"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const checkin_controller_1 = __importDefault(require("../controller/checkin.controller"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const checkin_controller = new checkin_controller_1.default();
router.post('/', [
    (0, express_validator_1.check)('guest_name', "Campo 'guest_name' es obligatorio").notEmpty(),
    (0, express_validator_1.check)('guest_lastname', "Campo 'guest_lastname' es obligatorio").notEmpty(),
    (0, express_validator_1.check)('dni', "Campo 'dni' es obligatorio").notEmpty(),
    (0, express_validator_1.check)('dni', "Campo 'dni' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_owner', "Campo 'id_owner' es obligatorio").notEmpty(),
    (0, express_validator_1.check)('id_owner', "Campo 'id_owner' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('income_date', "Campo 'income_date' es obligatorio").notEmpty(),
    noErrors_middleware_1.default
], checkin_controller.create);
exports.default = router;
//# sourceMappingURL=checkin.routes.js.map