"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const property_controller_1 = __importDefault(require("../controller/property.controller"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const property = new property_controller_1.default();
//TODO: ADMIN only
router.get('/', property.getAll);
//TODO: ADMIN only
router.get('/:id', property.getByID);
//TODO: ADMIN only
router.post('/', [
    (0, express_validator_1.check)('address', 'La direccion es obligatoria').notEmpty(),
    noErrors_middleware_1.default
], property.create);
exports.default = router;
//# sourceMappingURL=property.routes.js.map