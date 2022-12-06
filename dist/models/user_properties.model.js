"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const property_model_1 = __importDefault(require("./property.model"));
const user_model_1 = __importDefault(require("./user.model"));
const UserProperties = connection_1.default.define('user_properties', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    defaultScope: {
        include: [
            { model: user_model_1.default },
            { model: property_model_1.default }
        ],
        attributes: {
            exclude: ['id_user', 'id_property']
        }
    },
    timestamps: false
});
exports.default = UserProperties;
//# sourceMappingURL=user_properties.model.js.map