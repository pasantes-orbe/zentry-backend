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
const express_validator_1 = require("express-validator");
const checkout_controller_1 = __importDefault(require("../controller/checkout.controller"));
const checkInApproved_middleware_1 = __importDefault(require("../middlewares/customs/checkInApproved.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const checkin_model_1 = __importDefault(require("../models/checkin.model"));
const checkout_model_1 = __importDefault(require("../models/checkout.model"));
const server_1 = __importDefault(require("../models/server"));
const router = (0, express_1.Router)();
const controller = new checkout_controller_1.default();
router.post('/', [
    (0, express_validator_1.check)('id_checkin').notEmpty(),
    (0, express_validator_1.check)('id_checkin').isNumeric(),
    (0, express_validator_1.check)('id_checkin').custom(checkInApproved_middleware_1.default),
    noErrors_middleware_1.default
], controller.create);
router.post('/socket', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkouts = yield checkout_model_1.default.findAll({
        include: [checkin_model_1.default]
    });
    const server = server_1.default.instance;
    server.io.emit('mensaje', checkouts);
    res.send(checkouts);
}));
exports.default = router;
//# sourceMappingURL=checkout.routes.js.map