"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
const roles_model_1 = __importDefault(require("./roles.model"));
const property_model_1 = __importDefault(require("./property.model"));
const recurrent_model_1 = __importDefault(require("./recurrent.model"));
const country_model_1 = __importDefault(require("./country.model"));
roles_model_1.default.hasOne(user_model_1.default, {
    foreignKey: 'role_id',
    sourceKey: 'id'
});
user_model_1.default.belongsTo(roles_model_1.default, {
    foreignKey: 'role_id',
    targetKey: 'id'
});
property_model_1.default.hasMany(recurrent_model_1.default, {
    foreignKey: 'id_property',
    sourceKey: 'id'
});
recurrent_model_1.default.belongsTo(property_model_1.default, {
    foreignKey: 'id_property',
    targetKey: 'id'
});
property_model_1.default.sync({ alter: true });
recurrent_model_1.default.sync({ alter: true });
country_model_1.default.sync({ alter: true });
//# sourceMappingURL=associations.js.map