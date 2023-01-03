import User from "./user.model";
import Role from "./roles.model";
import Property from "./property.model";
import Recurrent from "./recurrent.model";
import Country from "./country.model";
import AmenityModel from "./amenity.model";
import UserProperties from "./user_properties.model";
import passwordChangeRequest from "./passwordChangeRequest.model";
import Reservation from "./reservation.model";
import GuardCountry from "./guard_country.model";
import CountryModel from "./country.model";
import OwnerCountry from "./owner_country.model";
import GuardSchedule from "./guard_schedule.model";
import CheckInModel from "./checkin.model";

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

GuardCountry.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})

GuardCountry.belongsTo(CountryModel, {
    foreignKey: 'id_country',
    targetKey: 'id'
})

OwnerCountry.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})

OwnerCountry.belongsTo(CountryModel, {
    foreignKey: 'id_country',
    targetKey: 'id'
})

passwordChangeRequest.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})


Reservation.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
});

Reservation.belongsTo(AmenityModel, {
    foreignKey: 'id_amenity',
    targetKey: 'id'
});

GuardSchedule.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})

GuardSchedule.belongsTo(CountryModel, {
    foreignKey: 'id_country',
    targetKey: 'id'
});




CheckInModel.belongsTo(User, {
    foreignKey: 'id_guard',
    targetKey: 'id'
})

CheckInModel.belongsTo(User, {
    foreignKey: 'id_owner',
    targetKey: 'id'
})


CheckInModel.belongsTo(User, {
    foreignKey: 'id_guard',
    targetKey: 'id'
})

CheckInModel.belongsTo(User, {
    foreignKey: 'id_owner',
    targetKey: 'id'
})


UserProperties.sync({ alter: false });
Property.sync({ alter: true });
Country.sync({ alter: true });
Recurrent.sync({ alter: true });
AmenityModel.sync({ alter: true });
passwordChangeRequest.sync({alter: true});
Reservation.sync({alter: true});
GuardCountry.sync({alter: true});
OwnerCountry.sync({alter: true});
GuardSchedule.sync({alter: true});
CheckInModel.sync({alter: true});