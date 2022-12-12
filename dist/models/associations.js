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
const amenity_model_1 = __importDefault(require("./amenity.model"));
const user_properties_model_1 = __importDefault(require("./user_properties.model"));
const passwordChangeRequest_model_1 = __importDefault(require("./passwordChangeRequest.model"));
roles_model_1.default.hasOne(user_model_1.default, {
    foreignKey: 'role_id',
    sourceKey: 'id'
});
user_model_1.default.belongsTo(roles_model_1.default, {
    foreignKey: 'role_id',
    targetKey: 'id'
});
property_model_1.default.belongsTo(country_model_1.default, {
    foreignKey: 'id_country',
    targetKey: 'id'
});
country_model_1.default.hasMany(property_model_1.default, {
    foreignKey: 'id_country',
    sourceKey: 'id'
});
property_model_1.default.hasMany(recurrent_model_1.default, {
    foreignKey: 'id_property',
    sourceKey: 'id'
});
recurrent_model_1.default.belongsTo(property_model_1.default, {
    foreignKey: 'id_property',
    targetKey: 'id'
});
country_model_1.default.hasMany(amenity_model_1.default, {
    foreignKey: 'id_country',
    sourceKey: 'id'
});
amenity_model_1.default.belongsTo(country_model_1.default, {
    foreignKey: 'id_country',
    targetKey: 'id'
});
// UserProperties.hasOne(User, {
//     foreignKey: 'id_user',
//     sourceKey: 'id'
// })
// UserProperties.hasOne(Property, {
//     foreignKey: 'id_property',
//     sourceKey: 'id'
// })
user_model_1.default.hasOne(user_properties_model_1.default, {
    foreignKey: 'id_user',
    sourceKey: 'id'
});
user_properties_model_1.default.belongsTo(user_model_1.default, {
    foreignKey: 'id_user',
    targetKey: 'id'
});
property_model_1.default.hasOne(user_properties_model_1.default, {
    foreignKey: 'id_property',
    sourceKey: 'id'
});
user_properties_model_1.default.belongsTo(property_model_1.default, {
    foreignKey: 'id_property',
    targetKey: 'id'
});
passwordChangeRequest_model_1.default.belongsTo(user_model_1.default, {
    foreignKey: 'id_user',
    targetKey: 'id'
});
user_properties_model_1.default.sync({ alter: false });
property_model_1.default.sync({ alter: true });
country_model_1.default.sync({ alter: true });
recurrent_model_1.default.sync({ alter: true });
amenity_model_1.default.sync({ alter: true });
passwordChangeRequest_model_1.default.sync({ alter: true });
//# sourceMappingURL=associations.js.map