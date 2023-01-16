"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const AntipanicModel = connection_1.default.define('antipanic', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address: { type: sequelize_1.DataTypes.STRING },
    details: { type: sequelize_1.DataTypes.STRING },
    finishAt: { type: sequelize_1.DataTypes.DATE },
    state: { type: sequelize_1.DataTypes.BOOLEAN },
}, {
    timestamps: true
});
exports.default = AntipanicModel;
//# sourceMappingURL=antipanic.model.js.map