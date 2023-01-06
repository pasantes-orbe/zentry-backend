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
const checkin_model_1 = __importDefault(require("../models/checkin.model"));
const checkout_model_1 = __importDefault(require("../models/checkout.model"));
const server_1 = __importDefault(require("../models/server"));
class checkOutController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin, details } = req.body;
            const checkout_exists = yield checkout_model_1.default.findOne({
                where: {
                    id_checkin
                }
            });
            if (checkout_exists) {
                return res.status(400).send({
                    msg: `Este check-out ya está registrado`
                });
            }
            const checkout = new checkout_model_1.default(req.body);
            const ck = yield checkout.save();
            const data = yield checkout_model_1.default.findByPk(ck.id, {
                include: [checkin_model_1.default]
            });
            const server = server_1.default.instance;
            server.io.emit('notificar-checkout', { msg: `Check-Out de ${data.checkin.guest_name} ${data.checkin.guest_lastname} registrado
        - Detalles: ${data.details}`, data });
            return res.send({
                msg: "Checkout registrado con éxito",
                data
            });
        });
    }
}
exports.default = checkOutController;
//# sourceMappingURL=checkout.controller.js.map