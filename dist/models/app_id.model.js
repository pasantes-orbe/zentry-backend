"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
const AppId = connection_1.default.define('appid', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    onesignal_id: { type: sequelize_1.DataTypes.STRING }
    // address: {type: DataTypes.STRING},
    // details: {type: DataTypes.STRING},
    // finishAt: {type: DataTypes.DATE},
    // state: {type: DataTypes.BOOLEAN},
    // propertyNumber: {type: DataTypes.INTEGER}
}, {
    timestamps: true,
    updatedAt: false
});
exports.default = AppId;
//# sourceMappingURL=app_id.model.js.map