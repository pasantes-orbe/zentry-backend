//import { DataTypes } from "sequelize";
//import Property from "./property.model";
//import User from "./user.model";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const UserProperties = db.define('user_properties', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//       autoIncrement: true
//    }

//},
//{
    
    //defaultScope: {
    //    include: [
    //        {model: User},
    //        {model: Property}
    //    ],
    //    attributes: {
    //        exclude: ['id_user', 'id_property']
    //    }
    //},
    //timestamps: false

//}
//);
//module.exports = UserProperties;

// models/user_properties.model.ts
// Este modelo ya estaba bien, pero lo unificamos al patrón con un par de ajustes para evitar errores
import { DataTypes, Model } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

    const UserProperties = sequelize.define('user_properties', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_property: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'user_properties',
        timestamps: false
    });

    UserProperties.associate = (models: any) => {
        UserProperties.belongsTo(models.user, { foreignKey: 'id_user', as: 'user' });
        UserProperties.belongsTo(models.property, { foreignKey: 'id_property', as: 'property' });
    };

    return UserProperties;
};
