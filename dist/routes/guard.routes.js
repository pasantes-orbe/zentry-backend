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
const roles_model_1 = __importDefault(require("../models/roles.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const router = (0, express_1.Router)();
/**
 * Get All By Country
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guards = yield user_model_1.default.findAll({
        where: {
            '$role.name$': 'vigilador'
        },
        include: roles_model_1.default
    });
    return res.json(guards);
}));
exports.default = router;
//# sourceMappingURL=guard.routes.js.map