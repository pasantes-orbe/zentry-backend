import User from "./user.model";
import Role from "./roles.model";
import Property from "./property.model";
import Recurrent from "./recurrent.model";
import Country from "./country.model";
import AmenityModel from "./amenity.model";

Role.hasOne(User, {
    foreignKey: 'role_id',
    sourceKey: 'id'
});

User.belongsTo(Role, {
    foreignKey: 'role_id',
    targetKey: 'id'
});


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



Property.sync({alter: true});
Recurrent.sync({alter: true});
Country.sync({alter: true});
AmenityModel.sync({alter: true});
