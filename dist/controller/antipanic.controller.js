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
const antipanic_model_1 = __importDefault(require("../models/antipanic.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class AntipanicController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const registroAntipanicos = yield antipanic_model_1.default.findAll({
                include: [{
                        model: user_model_1.default,
                        as: 'owner'
                    },
                    {
                        model: user_model_1.default,
                        as: 'guard'
                    }]
            });
            res.json(registroAntipanicos);
        });
    }
    newAntipanic(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_owner, address, id_country, } = req.body;
            const state = true;
            try {
                const antipanic = new antipanic_model_1.default({
                    ownerId: id_owner,
                    address,
                    state,
                    id_country
                });
                const antipanicGuardado = yield antipanic.save();
                res.json({
                    msg: "Antipanico activado",
                    antipanic: antipanicGuardado,
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
    guardConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { guardId, details, finishAt } = req.body;
            const alertAntipanic = yield antipanic_model_1.default.findByPk(id);
            if (!alertAntipanic) {
                res.json({
                    msg: "El id de la alarma antipanico no es correcto",
                });
            }
            else {
                const antipanicUpdated = yield alertAntipanic.update({
                    guardId,
                    details,
                    state: false,
                    finishAt
                });
                res.json({
                    msg: "Antipanico actualizado correctamente",
                    antipanic: antipanicUpdated
                });
            }
        });
    }
    desactivateAntipanic(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { details } = req.body;
            const alertAntipanic = yield antipanic_model_1.default.findByPk(id);
            if (!alertAntipanic) {
                res.json({
                    msg: "El id de la alarma antipanico no es correcto",
                });
            }
            else {
                const antipanicUpdated = yield alertAntipanic.update({
                    state: false,
                    details,
                });
                res.json({
                    msg: "Estado cambiado correctamente",
                    antipanic: antipanicUpdated,
                });
            }
        });
    }
}
exports.default = AntipanicController;
//# sourceMappingURL=antipanic.controller.js.map