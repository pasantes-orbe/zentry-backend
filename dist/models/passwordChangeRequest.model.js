"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const passwordChangeRequest = connection_1.default.define('password_change_request', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    changed: { type: sequelize_1.DataTypes.BOOLEAN },
    date: { type: sequelize_1.DataTypes.DATE }
}, {
    timestamps: false
});
exports.default = passwordChangeRequest;
//# sourceMappingURL=passwordChangeRequest.model.js.map