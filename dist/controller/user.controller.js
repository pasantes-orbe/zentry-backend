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
const bcrypt_1 = __importDefault(require("bcrypt"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
class UserController {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.default.findAll({
                include: {
                    model: roles_model_1.default
                }
            });
            res.json(users);
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
                msg: `No existe usuario con el id ${id}`,
                user
            });
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            try {
                // Compare if the user already exists by email.
                const exists = yield user_model_1.default.findOne({
                    where: {
                        email: body.email
                    }
                });
                if (exists) {
                    return res.status(302).json({
                        msg: `Ya existe un usuario con el email`,
                        email: body.email
                    });
                }
                // Cifrar password
                const password = bcrypt_1.default.hashSync(body.password, 10);
                const user = new user_model_1.default(body);
                yield user.save();
                res.json({
                    msg: "req.body",
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