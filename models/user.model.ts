// models/user.model.ts
import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: { 
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        password: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        birthday: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        dni: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        role_id: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: "users",
        timestamps: false,
    });

    User.associate = (models: any) => {
        User.belongsTo(models.role, { foreignKey: 'role_id', as: 'userRole' });

        // ✅ CORREGIDO: Cambiar de hasMany a belongsToMany para relación many-to-many
        User.belongsToMany(models.property, { 
            through: models.user_properties,
            foreignKey: 'id_user',
            otherKey: 'id_property',
            as: 'properties'
        });
        
        User.hasMany(models.user_properties, { foreignKey: 'id_user', as: 'userProperties' });
        User.hasMany(models.guard_country, { foreignKey: 'id_user', as: 'guardCountries' });
        User.hasMany(models.appid, { foreignKey: 'id_user', sourceKey: 'id' });
        User.hasMany(models.notification, { foreignKey: 'id_user', as: 'notifications' });
        User.hasMany(models.password_change_request, { foreignKey: 'id_user', as: 'passwordChangeRequests' });
    };

    return User;
};





/* 12-7-25import { DataTypes } from "sequelize";
import db from "../DB/connection";
import Role from "./roles.model";

const User = db.define('user', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING},
    birthday: {type: DataTypes.DATE},
    dni: {type: DataTypes.INTEGER},
    avatar: {type: DataTypes.STRING}
},
{
    timestamps: false
}
);
module.exports = User;*/


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

