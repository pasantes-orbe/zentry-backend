"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const country_model_1 = __importDefault(require("./country.model"));
const roles_model_1 = __importDefault(require("./roles.model"));
const user_model_1 = __importDefault(require("./user.model"));
const GuardSchedule = connection_1.default.define('guard_schedule', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    week_day: { type: sequelize_1.DataTypes.STRING },
    start: { type: sequelize_1.DataTypes.DATE },
    exit: { type: sequelize_1.DataTypes.DATE },
}, {
    defaultScope: {
        include: [
            {
                model: user_model_1.default,
                include: [roles_model_1.default]
            },
            { model: country_model_1.default }
        ],
        attributes: {
            exclude: ['id_user', 'id_country']
        }
    },
    timestamps: false
});
exports.default = GuardSchedule;
//# sourceMappingURL=guard_schedule.model.js.map