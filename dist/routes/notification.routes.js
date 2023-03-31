"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const notifications_controller_1 = __importDefault(require("../controller/notifications.controller"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const notificationController = new notifications_controller_1.default();
//GET ALL NOTIFICATIONS BY USER
router.get('/:id_user', [(0, express_validator_1.check)('id_user').notEmpty(),
    (0, express_validator_1.check)('id_user').isNumeric(),
    noErrors_middleware_1.default], notificationController.getAllByIdUser);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map