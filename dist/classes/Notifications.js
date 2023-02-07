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
const axios_1 = __importDefault(require("axios"));
const guard_country_model_1 = __importDefault(require("../models/guard_country.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
class Notifications {
    constructor() {
        this._app_id = "df4ae4bb-9ade-4eba-9d09-06da4069a8c7";
        this._Authorization = "Basic ZDU0YTlhYTAtZTE4ZC00OTVkLWJhZjEtOGNiM2NkZDAxMDRm";
        this._BaseUrl = "https://shock-app-backend-production.up.railway.app";
    }
    notifyAExternal_User_By_ID(id, msg, heading, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const send = yield axios_1.default.post(`https://onesignal.com/api/v1/notifications`, {
                app_id: this._app_id,
                contents: { "es": msg, "en": msg },
                headings: { "es": heading, "en": heading },
                name: name,
                url: this._BaseUrl,
                include_external_user_ids: [id]
            }, {
                headers: {
                    'Authorization': this._Authorization,
                    'content-type': 'application/json'
                }
            }).then((res) => __awaiter(this, void 0, void 0, function* () {
                console.log(res);
                const notification = new notification_model_1.default({
                    title: heading,
                    content: msg,
                    id_user: id
                });
                yield notification.save();
            }));
        });
    }
    notifyAllGuards(id_country, msg, heading, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const guards = yield guard_country_model_1.default.findAll({
                where: { id_country }
            });
            for (let index = 0; index < guards.length; index++) {
                const guard = guards[index];
                const id_user = String(guard.user.id);
                const send = yield axios_1.default.post(`https://onesignal.com/api/v1/notifications`, {
                    app_id: this._app_id,
                    contents: { "es": msg, "en": msg },
                    headings: { "es": heading, "en": heading },
                    channel_for_external_user_ids: "push",
                    name: name,
                    url: this._BaseUrl,
                    include_external_user_ids: [id_user]
                }, {
                    headers: {
                        'Authorization': this._Authorization,
                        'content-type': 'application/json'
                    }
                }).then((res) => __awaiter(this, void 0, void 0, function* () {
                    console.log(res);
                    const notification = new notification_model_1.default({
                        title: heading,
                        content: msg,
                        id_user,
                    });
                    yield notification.save();
                }));
            }
        });
    }
}
exports.default = Notifications;
//# sourceMappingURL=Notifications.js.map