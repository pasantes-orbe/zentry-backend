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
const checkout_model_1 = __importDefault(require("../models/checkout.model"));
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
            checkout.save();
            return res.send({
                msg: "Checkout registrado con éxito"
            });
        });
    }
}
exports.default = checkOutController;
//# sourceMappingURL=checkout.controller.js.map