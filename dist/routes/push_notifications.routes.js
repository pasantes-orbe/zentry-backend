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
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.put('/send_to_segment/:role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const app_id = "df4ae4bb-9ade-4eba-9d09-06da4069a8c7";
    const { external_user_id } = req.body;
    try {
        const request = yield axios_1.default.put(`https://onesignal.com/api/v1/apps/${app_id}/users/${external_user_id}`, {
            tags: {
                account_type: req.params.role
            }
        });
        console.log(request);
        return res.status(200).send({ msg: "Segmento agregado", request });
    }
    catch (error) {
        console.log(error);
        return res.send({ error });
    }
}));
exports.default = router;
//# sourceMappingURL=push_notifications.routes.js.map