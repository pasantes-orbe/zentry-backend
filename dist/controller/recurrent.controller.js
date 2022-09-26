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
const property_model_1 = __importDefault(require("../models/property.model"));
const recurrent_model_1 = __importDefault(require("../models/recurrent.model"));
class RecurrentController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const recurrents = yield recurrent_model_1.default.findAll({
                include: property_model_1.default,
                attributes: ['id', 'status', 'guest_name', 'guest_lastname', 'dni']
            });
            res.json(recurrents);
        });
    }
    getByID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const recurrent = yield recurrent_model_1.default.findByPk(id, {
                include: property_model_1.default,
                attributes: ['id', 'status', 'guest_name', 'guest_lastname', 'dni']
            });
            if (recurrent) {
                return res.json(recurrent);
            }
            res.status(404).json({
                msg: `No existe el invitado recurrente con el id ${id}`,
            });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            try {
                const recurrent = new recurrent_model_1.default(body);
                yield recurrent.save();
                res.json({
                    msg: "El invitado recurrente se cargo con exito",
                    recurrent
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: "No se pudo insertar el invitado recurrente, intente de nuevo."
                });
            }
        });
    }
}
exports.default = RecurrentController;
//# sourceMappingURL=recurrent.controller.js.map