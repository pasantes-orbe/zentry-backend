"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const Property = connection_1.default.define('property', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: sequelize_1.DataTypes.STRING },
    number: { type: sequelize_1.DataTypes.INTEGER },
    address: { type: sequelize_1.DataTypes.STRING },
    avatar: { type: sequelize_1.DataTypes.STRING }
}, {
    timestamps: false
});
exports.default = Property;
//# sourceMappingURL=property.model.js.map