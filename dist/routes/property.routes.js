"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const property_controller_1 = __importDefault(require("../controller/property.controller"));
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const propertyExists_middleware_1 = __importDefault(require("../middlewares/customs/propertyExists.middleware"));
const isAdmin_middleware_1 = __importDefault(require("../middlewares/jwt/isAdmin.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const property = new property_controller_1.default();
/**
 * Get All
 */
router.get('/', isAdmin_middleware_1.default, property.getAll);
router.get('/:id_country/:search', [
    (0, express_validator_1.check)('id_country', "El campo 'id_country' no debe estar vacío").notEmpty(),
    (0, express_validator_1.check)('id_country', "El campo 'id_country' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_country').custom(countryExists_middleware_1.default),
    noErrors_middleware_1.default
], property.search);
/**
 * Get All By Country
 */
router.get('/country/get_by_id/:id_country', [
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('id_country').isNumeric(),
    noErrors_middleware_1.default
], property.getByCountry);
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
router.patch("/:id", [
    isAdmin_middleware_1.default,
    (0, express_validator_1.check)('id').notEmpty(),
    (0, express_validator_1.check)('id').custom(propertyExists_middleware_1.default),
    noErrors_middleware_1.default
], property.update);
router.delete("/:id", [
    isAdmin_middleware_1.default,
    (0, express_validator_1.check)('id').notEmpty(),
    (0, express_validator_1.check)('id').custom(propertyExists_middleware_1.default),
    noErrors_middleware_1.default
], property.delete);
exports.default = router;
//# sourceMappingURL=property.routes.js.map