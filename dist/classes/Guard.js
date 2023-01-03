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
const country_model_1 = __importDefault(require("../models/country.model"));
const guard_country_model_1 = __importDefault(require("../models/guard_country.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class Guard {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const guards = yield user_model_1.default.findAll({
                where: { '$role.name$': 'vigilador' },
                include: roles_model_1.default
            });
            return guards;
        });
    }
    getByCountry(id_country) {
        return __awaiter(this, void 0, void 0, function* () {
            const guards = yield guard_country_model_1.default.findAll({
                where: { id_country }
            });
            return guards;
        });
    }
    getCountry(id_user) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield guard_country_model_1.default.findOne({
                where: {
                    id_user
                },
                include: [country_model_1.default]
            });
            return country;
        });
    }
    assignCountry(guard) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.alreadyAssigned(guard)) {
                    return "Este vigilador ya fue asignado a este country";
                }
                const guard_to_country = new guard_country_model_1.default(guard);
                guard_to_country.save();
                return "Vigilador asignado con éxito al country";
            }
            catch (error) {
                return error;
            }
        });
    }
    alreadyAssigned(guard) {
        return __awaiter(this, void 0, void 0, function* () {
            const alreadyAssigned = yield guard_country_model_1.default.findOne({
                where: {
                    id_user: guard.id_user,
                    id_country: guard.id_country
                }
            });
            return (alreadyAssigned) ? true : false;
        });
    }
}
exports.default = Guard;
//# sourceMappingURL=Guard.js.map