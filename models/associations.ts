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
import CheckOutModel from "./checkout.model";
import AntipanicModel from "./antipanic.model";
import AppId from "./app_id.model";
import Notifcation from "./notification.model";

Country.sync();
Property.sync();
UserProperties.sync();
Recurrent.sync();
AmenityModel.sync();
Reservation.sync();
GuardCountry.sync();
OwnerCountry.sync();
GuardSchedule.sync();
CheckInModel.sync();
CheckOutModel.sync();
AntipanicModel.sync()
passwordChangeRequest.sync();
AppId.sync();


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
    as: 'guard',
    foreignKey: 'id_guard',
    targetKey: 'id'
})

CheckInModel.belongsTo(User, {
    as: 'owner',
    foreignKey: 'id_owner',
    targetKey: 'id'
})

CheckInModel.belongsTo(Country,{
    foreignKey: 'id_country',
    targetKey: 'id'
})

CheckOutModel.belongsTo(CheckInModel, {
    foreignKey: 'id_checkin',
    targetKey: 'id'
})

AntipanicModel.belongsTo(User, { as: 'owner' })

AntipanicModel.belongsTo(User, { as: 'guard' })

AntipanicModel.belongsTo(Country, {
    foreignKey: 'id_country',
    targetKey: 'id'
})

AppId.belongsTo(User, {
    foreignKey: 'id_user',
    targetKey: 'id'
})

Notifcation.belongsTo(User,{
    foreignKey: 'id_user',
    targetKey:'id'
})

User.hasMany(AppId, {
    foreignKey: 'id_user',
    sourceKey: 'id'
})