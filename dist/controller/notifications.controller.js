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
const notification_model_1 = __importDefault(require("../models/notification.model"));
class NotificationsController {
    getAllByIdUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_user } = req.params;
            console.log(id_user);
            const noti = yield notification_model_1.default.findAll({
                where: {
                    id_user
                }
            });
            res.json(noti);
        });
    }
}
exports.default = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map