"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const amenity_model_1 = __importDefault(require("./amenity.model"));
const user_model_1 = __importDefault(require("./user.model"));
const Reservation = connection_1.default.define('reservation', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: { type: sequelize_1.DataTypes.DATE },
    details: { type: sequelize_1.DataTypes.TEXT },
    status: { type: sequelize_1.DataTypes.STRING }
}, {
    timestamps: false,
    defaultScope: {
        include: [user_model_1.default, amenity_model_1.default]
    }
});
exports.default = Reservation;
//# sourceMappingURL=reservation.model.js.map