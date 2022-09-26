"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
const roles_model_1 = __importDefault(require("./roles.model"));
roles_model_1.default.hasOne(user_model_1.default, {
    foreignKey: 'user_id',
    sourceKey: 'id'
});
user_model_1.default.belongsTo(roles_model_1.default, {
    foreignKey: 'user_id',
    targetKey: 'id'
});
//# sourceMappingURL=associations.js.map