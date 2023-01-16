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
const server_1 = __importDefault(require("../models/server"));
const user_model_1 = __importDefault(require("../models/user.model"));
class checkInController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guest_name, guest_lastname, DNI, income_date, transport, patent, details, id_guard, id_owner, confirmed_by_owner, check_out } = req.body;
            //TODO: Cuando "confirmed_by_owner" no venga en la request hacerlo FALSE
            if (!confirmed_by_owner) {
                req.body.confirmed_by_owner = false;
            }
            else {
                req.body.confirmed_by_owner = true;
            }
            if (!check_out) {
                req.body.check_out = false;
            }
            else {
                req.body.check_out = null;
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
            // Emitir socket
            const server = server_1.default.instance;
            server.io.emit('notificar-checkin', { msg: `${guest_lastname} ${guest_name} está solicitando check-in`, checkIn });
            return res.send({
                msg: "Check-In registrado exitosamente",
                checkIn
            });
        });
    }
    approve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin } = req.params;
            const update = yield new CheckIn_1.default().approve(+id_checkin);
            if (!update) {
                return res.status(400).send({
                    msg: "Check-in no existe o no fue aprobado por el propietario"
                });
            }
            // Emitir socket TODO: Debería enviarle SOLO al propietario que le interesa la notificación.
            const server = server_1.default.instance;
            server.io.emit('checkin-aprobado', { msg: `Check-in de ${update.guest_lastname} ${update.guest_name} aprobado`, update });
            res.send(update);
        });
    }
    ownerConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin } = req.params;
            const update = yield new CheckIn_1.default().ownerConfirm(+id_checkin);
            if (!update) {
                return res.status(404).send({
                    msg: "Check-in no existe"
                });
            }
            // Emitir socket TODO: Debería enviarle solo a los guardias esta notificación
            const server = server_1.default.instance;
            server.io.emit('checkin-confirmado-por-propietario', { msg: `Check-in de ${update.guest_name} ${update.guest_lastname} confirmado`, update });
            res.send({
                msg: "Check-in confirmado",
                update
            });
        });
    }
    changeStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin } = req.params;
            const { new_status } = req.body;
            const update = yield new CheckIn_1.default().changeStatus(+id_checkin, new_status);
            if (!update) {
                return res.status(404).send({
                    msg: "Check-in no existe"
                });
            }
            res.send({
                msg: "Check-in actualizado correctamente",
                update
            });
        });
    }
    getApproved(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkins = yield checkin_model_1.default.findAll({
                where: {
                    check_in: true
                },
                include: [user_model_1.default]
            });
            res.send(checkins);
        });
    }
    getConfirmedByOwner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkins = yield checkin_model_1.default.findAll({
                where: {
                    confirmed_by_owner: true,
                    check_in: false
                },
                include: [user_model_1.default]
            });
            res.send(checkins);
        });
    }
    getCheckOutFalse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkins = yield checkin_model_1.default.findAll({
                where: {
                    check_out: false,
                    check_in: true,
                    confirmed_by_owner: true
                },
                include: [user_model_1.default]
            });
            res.send(checkins);
        });
    }
    getByOwner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_owner } = req.params;
            const checkins = yield checkin_model_1.default.findAll({
                where: {
                    id_owner
                },
                include: [{ all: true }]
            });
            return res.send(checkins);
        });
    }
    checkOutConfirmed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_checkin } = req.params;
            const update = yield new CheckIn_1.default().checkOutConfirm(+id_checkin);
            if (!update) {
                return res.status(404).send({
                    msg: "Check-in no existe"
                });
            }
            res.send({
                msg: "Check-out confirmado",
                update
            });
        });
    }
}
exports.default = checkInController;
//# sourceMappingURL=checkin.controller.js.map