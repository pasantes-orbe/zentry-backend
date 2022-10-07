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
const user_model_1 = __importDefault(require("../models/user.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const password_helper_1 = __importDefault(require("../helpers/password.helper"));
class UserController {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_model_1.default.findAll({
                    include: {
                        model: roles_model_1.default
                    }
                });
                res.json(users);
            }
            catch (error) {
                res.status(500).send(error);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const user = yield user_model_1.default.findByPk(id);
            if (user) {
                return res.json(user);
            }
            res.status(404).json({
                msg: `No existe usuario con el id ${id}`
            });
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            try {
                // Cifrar password
                body.password = new password_helper_1.default().hash(body.password);
                const user = new user_model_1.default(body);
                yield user.save();
                res.json({
                    msg: "El usuario se creo con exito",
                    user
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: "No se pudo registrar al usuario, intente de nuevo."
                });
            }
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map