"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const GuardCountry = connection_1.default.define('guard_country', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    // defaultScope: {
    //     include: [
    //         {model: User},
    //         {model: CountryModel}
    //     ],
    //     attributes: {
    //         exclude: ['id_user', 'id_property']
    //     }
    // },
    timestamps: false
});
exports.default = GuardCountry;
//# sourceMappingURL=guard_country.model.js.map