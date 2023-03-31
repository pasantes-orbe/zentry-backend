"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const Invitation = connection_1.default.define('invitation', {
    fullname: { type: sequelize_1.DataTypes.STRING },
    dni: { type: sequelize_1.DataTypes.STRING },
    lastname: { type: sequelize_1.DataTypes.STRING },
    name: { type: sequelize_1.DataTypes.STRING },
}, {
    timestamps: false
});
exports.default = Invitation;
//# sourceMappingURL=invitations.model.js.map