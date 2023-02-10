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
const invitations_model_1 = __importDefault(require("../models/invitations.model"));
class InvitationController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { guests } = req.body;
            const invitations = yield invitations_model_1.default.bulkCreate(guests);
            return res.send({ msg: "invitados agregados con exito", invitations });
        });
    }
    getInvitations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_reservation } = req.params;
            const invitations = yield invitations_model_1.default.findAll({
                where: {
                    id_reservation
                }
            });
            return res.send(invitations);
        });
    }
}
exports.default = InvitationController;
//# sourceMappingURL=invitation.controller.js.map