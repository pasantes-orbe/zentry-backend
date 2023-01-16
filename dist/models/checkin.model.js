"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const CheckInModel = connection_1.default.define('checkin', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guest_name: { type: sequelize_1.DataTypes.STRING },
    guest_lastname: { type: sequelize_1.DataTypes.STRING },
    DNI: { type: sequelize_1.DataTypes.BIGINT },
    income_date: { type: sequelize_1.DataTypes.DATE },
    transport: { type: sequelize_1.DataTypes.STRING },
    patent: { type: sequelize_1.DataTypes.STRING },
    details: { type: sequelize_1.DataTypes.TEXT },
    confirmed_by_owner: { type: sequelize_1.DataTypes.BOOLEAN },
    check_in: { type: sequelize_1.DataTypes.BOOLEAN },
    check_out: { type: sequelize_1.DataTypes.BOOLEAN },
}, {
    timestamps: false
});
exports.default = CheckInModel;
//# sourceMappingURL=checkin.model.js.map