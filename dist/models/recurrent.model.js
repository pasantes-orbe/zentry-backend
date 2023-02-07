"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const Recurrent = connection_1.default.define('recurrent', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: { type: sequelize_1.DataTypes.BOOLEAN },
    guest_name: { type: sequelize_1.DataTypes.STRING },
    guest_lastname: { type: sequelize_1.DataTypes.STRING },
    dni: { type: sequelize_1.DataTypes.INTEGER },
}, {
    timestamps: false
});
exports.default = Recurrent;
//# sourceMappingURL=recurrent.model.js.map