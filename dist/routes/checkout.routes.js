"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const checkout_controller_1 = __importDefault(require("../controller/checkout.controller"));
const checkInApproved_middleware_1 = __importDefault(require("../middlewares/customs/checkInApproved.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const controller = new checkout_controller_1.default();
router.post('/', [
    (0, express_validator_1.check)('id_checkin').notEmpty(),
    (0, express_validator_1.check)('id_checkin').isNumeric(),
    (0, express_validator_1.check)('id_checkin').custom(checkInApproved_middleware_1.default),
    noErrors_middleware_1.default
], controller.create);
exports.default = router;
//# sourceMappingURL=checkout.routes.js.map