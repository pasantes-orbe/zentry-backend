"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const CheckOutModel = connection_1.default.define('checkout', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    details: { type: sequelize_1.DataTypes.TEXT }
}, {
    // timestamps: false
    createdAt: 'out_date',
    updatedAt: false
});
exports.default = CheckOutModel;
//# sourceMappingURL=checkout.model.js.map