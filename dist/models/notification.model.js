"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const Notifcation = connection_1.default.define('notification', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: { type: sequelize_1.DataTypes.STRING },
    content: { type: sequelize_1.DataTypes.STRING }
}, {
    updatedAt: false
});
exports.default = Notifcation;
//# sourceMappingURL=notification.model.js.map