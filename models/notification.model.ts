//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const Notifcation = db.define('notification', {

//    id:{
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    title:{type: DataTypes.STRING},
//    content:{type:DataTypes.STRING},
//    id_user: { type: DataTypes.INTEGER } //15/7/25
//},{
//    updatedAt: false,
//    timestamps: true // por defecto true, para createdAt 15/07/25
//}
//);

//module.exports = Notifcation;



// models/notification.model.ts
import { DataTypes } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {

    const Notification = sequelize.define('notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: { type: DataTypes.STRING },
        content: { type: DataTypes.STRING },
        id_user: { type: DataTypes.INTEGER },
        read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'notifications', // Se recomienda usar el nombre de la tabla en plural
        updatedAt: false,
        timestamps: true
    });

    Notification.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        Notification.belongsTo(models.user, {
            foreignKey: 'id_user',
            as: 'notifications',
        });
    };

    return Notification;
};
