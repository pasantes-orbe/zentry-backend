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
const GuardCountry = connection_1.default.define('guard_country', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
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
exports.default = GuardCountry;
//# sourceMappingURL=guard_country.model.js.map