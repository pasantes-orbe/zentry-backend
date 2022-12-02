"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const property_controller_1 = __importDefault(require("../controller/property.controller"));
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const isAdmin_middleware_1 = __importDefault(require("../middlewares/jwt/isAdmin.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const property = new property_controller_1.default();
router.get('/', isAdmin_middleware_1.default, property.getAll);
router.get('/:id', isAdmin_middleware_1.default, property.getByID);
router.post('/', [
    isAdmin_middleware_1.default,
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('id_country').custom(countryExists_middleware_1.default),
    (0, express_validator_1.check)('number').notEmpty(),
    (0, express_validator_1.check)('number').isNumeric(),
    (0, express_validator_1.check)('address', 'La direccion es obligatoria').notEmpty(),
    noErrors_middleware_1.default
], property.create);
exports.default = router;
//# sourceMappingURL=property.routes.js.map