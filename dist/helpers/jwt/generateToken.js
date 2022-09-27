"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (uid = '') => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jsonwebtoken_1.default.sign(payload, "SUPER_SECRET_PASSWORD", { expiresIn: '1h' }, (err, token) => {
            if (err)
                reject('No se pudo generar el token');
            resolve(token);
        });
    });
};
exports.default = generateToken;
//# sourceMappingURL=generateToken.js.map