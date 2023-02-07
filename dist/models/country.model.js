"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const CountryModel = connection_1.default.define('country', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: sequelize_1.DataTypes.STRING },
    latitude: { type: sequelize_1.DataTypes.DOUBLE },
    longitude: { type: sequelize_1.DataTypes.DOUBLE },
    avatar: { type: sequelize_1.DataTypes.STRING }
}, {
    timestamps: false
});
exports.default = CountryModel;
//# sourceMappingURL=country.model.js.map