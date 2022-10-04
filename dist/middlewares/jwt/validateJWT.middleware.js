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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../../models/user.model"));
function validateJWT(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({
                msg: "No hay token de autorización"
            });
        }
        try {
            const { uid } = jsonwebtoken_1.default.verify(token, "SUPER_SECRET_PASSWORD");
            const user = yield user_model_1.default.findByPk(uid);
            if (!user) {
                return res.status(404).send({
                    "msg": "El usuario no existe"
                });
            }
            next();
        }
        catch (error) {
            return res.status(403).send({
                "msg": "Token inválido"
            });
        }
    });
}
exports.default = validateJWT;
//# sourceMappingURL=validateJWT.middleware.js.map