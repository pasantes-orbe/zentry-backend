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
const CheckIn_1 = __importDefault(require("../classes/CheckIn"));
const Guard_1 = __importDefault(require("../classes/Guard"));
const checkin_model_1 = __importDefault(require("../models/checkin.model"));
class checkInController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guest_name, guest_lastname, DNI, income_date, transport, patent, details, id_guard, id_owner, confirmed_by_owner } = req.body;
            //TODO: Cuando "confirmed_by_owner" no venga en la request hacerlo FALSE
            if (!confirmed_by_owner) {
                req.body.confirmed_by_owner = false;
            }
            else {
                req.body.confirmed_by_owner = true;
            }
            if (patent) {
                req.body.patent = req.body.patent.toUpperCase();
            }
            if (req.body.id_guard) {
                const guard = yield new Guard_1.default().exists(id_guard);
                // SI NO ES UN id_guard CORRESPONDIENTE A UN GUARDIA O INVÁLIDO lo tomará como NULL
                if (!guard) {
                    console.log("--------Guardia no existe--------");
                    req.body.id_guard = null;
                }
            }
            req.body.check_in = false;
            const checkIn = new checkin_model_1.default(req.body);
            checkIn.save();
            return res.send(checkIn);
        });
    }
    approve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin } = req.params;
            const update = yield new CheckIn_1.default().approve(+id_checkin);
            res.send(update);
        });
    }
}
exports.default = checkInController;
//# sourceMappingURL=checkin.controller.js.map