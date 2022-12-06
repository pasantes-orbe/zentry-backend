import User from "./user.model";
import Role from "./roles.model";
import Property from "./property.model";
import Recurrent from "./recurrent.model";
import Country from "./country.model";
import AmenityModel from "./amenity.model";
import UserProperties from "./user_properties.model";

Role.hasOne(User, {
    foreignKey: 'role_id',
    sourceKey: 'id'
});

User.belongsTo(Role, {
    foreignKey: 'role_id',
    targetKey: 'id'
});



Property.belongsTo(Country, {
    foreignKey: 'id_country',
    targetKey: 'id'
})

Country.hasMany(Property, {
    foreignKey: 'id_country',
    sourceKey: 'id'
})




Property.hasMany(Recurrent, {
    foreignKey: 'id_property',
    sourceKey: 'id'
});

Recurrent.belongsTo(Property, {
    foreignKey: 'id_property',
    targetKey: 'id'
})


Country.hasMany(AmenityModel, {
    foreignKey: 'id_country',
    sourceKey: 'id'
})

AmenityModel.belongsTo(Country, {
    foreignKey: 'id_country',
    targetKey: 'id'
})



// UserProperties.hasOne(User, {
//     foreignKey: 'id_user',
//     sourceKey: 'id'
// })

// UserProperties.hasOne(Property, {
//     foreignKey: 'id_property',
//     sourceKey: 'id'
// })

User.hasOne(UserProperties, {
    foreignKey: 'id_user',
    sourceKey: 'id'
});

UserProperties.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})


Property.hasOne(UserProperties, {
    foreignKey: 'id_property',
    sourceKey: 'id'
});

UserProperties.belongsTo(Property, {
    foreignKey: 'id_property',
    targetKey: 'id'
})


UserProperties.sync({ alter: false });
Property.sync({ alter: true });
Country.sync({ alter: true });
Recurrent.sync({ alter: true });
AmenityModel.sync({ alter: true });
