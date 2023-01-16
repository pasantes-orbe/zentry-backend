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
class CheckIn {
    approve(id_checkin) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkin = yield checkin_model_1.default.findByPk(id_checkin);
            if (checkin && checkin.confirmed_by_owner) {
                checkin.update({
                    check_in: true
                }, {
                    where: {
                        id: checkin.id
                    }
                });
                return checkin;
            }
            return false;
        });
    }
    ownerConfirm(id_checkin) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkin = yield checkin_model_1.default.findByPk(id_checkin);
            if (checkin) {
                checkin.update({
                    confirmed_by_owner: true
                }, {
                    where: {
                        id: checkin.id
                    }
                });
                return checkin;
            }
            return false;
        });
    }
    changeStatus(id_checkin, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkin = yield checkin_model_1.default.findByPk(id_checkin);
            if (checkin) {
                checkin.update({
                    confirmed_by_owner: newStatus
                }, {
                    where: {
                        id: checkin.id
                    }
                });
                return checkin;
            }
            return false;
        });
    }
    checkOutConfirm(id_checkin) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkin = yield checkin_model_1.default.findByPk(id_checkin);
            if (checkin) {
                checkin.update({
                    check_out: true
                }, {
                    where: {
                        id: checkin.id
                    }
                });
                return checkin;
            }
            return false;
        });
    }
    exists(id_checkin) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield checkin_model_1.default.findByPk(id_checkin);
            return exists;
        });
    }
    isApproved(id_checkin) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkin = yield this.exists(id_checkin);
            if (!checkin)
                return false;
            if (checkin.check_in && checkin.confirmed_by_owner)
                return true;
            return false;
        });
    }
}
exports.default = CheckIn;
//# sourceMappingURL=CheckIn.js.map