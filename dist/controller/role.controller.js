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
const roles_model_1 = __importDefault(require("../models/roles.model"));
class RoleController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield roles_model_1.default.findAll();
            res.json(roles);
        });
    }
    getByID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const role = yield roles_model_1.default.findByPk(id);
            if (role) {
                return res.json(role);
            }
            res.status(404).json({
                msg: `No existe rol con el id ${id}`,
            });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            body.name = body.name.toLowerCase();
            try {
                const role = new roles_model_1.default(body);
                yield role.save();
                res.json({
                    msg: "El rol se creo con exito",
                    role
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: "No se pudo crear el rol, intente de nuevo."
                });
            }
        });
    }
}
exports.default = RoleController;
//# sourceMappingURL=role.controller.js.map