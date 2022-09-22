"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../DB/connection"));
// import Role from "./roles.model";
const User = connection_1.default.define('user', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: { type: sequelize_1.DataTypes.STRING },
    name: { type: sequelize_1.DataTypes.STRING },
    lastname: { type: sequelize_1.DataTypes.STRING },
    password: { type: sequelize_1.DataTypes.STRING },
    phone: { type: sequelize_1.DataTypes.STRING },
    birthday: { type: sequelize_1.DataTypes.DATE },
    dni: { type: sequelize_1.DataTypes.INTEGER },
    avatar: { type: sequelize_1.DataTypes.STRING }
}, {
    timestamps: false
});
exports.default = User;
// const Role = db.define('role', {
//     id:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     name: {type: DataTypes.STRING},
//     avatar: {type: DataTypes.STRING}
// },
// {
//     timestamps: false
// }
// );
// Role.hasOne(User);
// User.belongsTo(Role);
//# sourceMappingURL=user.model.js.map