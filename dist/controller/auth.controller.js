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
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const generateToken_1 = __importDefault(require("../helpers/jwt/generateToken"));
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            // Verify if email exists
            const user = yield user_model_1.default.findOne({
                where: {
                    email
                }
            });
            if (!user) {
                return res.status(404).json({
                    msg: "Usuario o contraseña inválido"
                });
            }
            // // Verify if password is correct
            const validPassword = bcrypt_1.default.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(404).json({
                    msg: "Usuario o contraseña inválido"
                });
            }
            const token = yield (0, generateToken_1.default)(user.id);
            res.json({
                user,
                token
            });
        });
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map