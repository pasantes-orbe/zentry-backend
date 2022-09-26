"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const emailAlreadyExists_middleware_1 = __importDefault(require("../middlewares/emailAlreadyExists.middleware"));
const router = (0, express_1.Router)();
const controller = new user_controller_1.default();
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUser);
router.post('/', emailAlreadyExists_middleware_1.default, controller.register);
exports.default = router;
//# sourceMappingURL=user.routes.js.map