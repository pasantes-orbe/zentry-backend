"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const OwnerCountry = connection_1.default.define('owner_country', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    // defaultScope: {
    //     include: [
    //         {
    //             model: User,
    //             include: [Role]
    //         },
    //         {model: CountryModel}
    //     ],
    //     attributes: {
    //         exclude: ['id_user', 'id_country']
    //     }
    // },
    timestamps: false
});
exports.default = OwnerCountry;
//# sourceMappingURL=owner_country.model.js.map