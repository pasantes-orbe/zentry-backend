//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const AppId = db.define('appid', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },

//    onesignal_id: { type: DataTypes.STRING }
    // address: {type: DataTypes.STRING},
    // details: {type: DataTypes.STRING},
    // finishAt: {type: DataTypes.DATE},
    // state: {type: DataTypes.BOOLEAN},
    // propertyNumber: {type: DataTypes.INTEGER}
//},
//{
//    timestamps: true,
//    updatedAt: false
//}
//);



//export default AppId;

// models/appid.model.ts
import { DataTypes } from "sequelize";

export default (sequelize: any, DataTypes: any) => {

    const AppId = sequelize.define('appid', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        onesignal_id: { type: DataTypes.STRING }
    },
    {
        tableName: 'appids', // Se recomienda usar el nombre de la tabla en plural
        timestamps: true,
        updatedAt: false
    });

    // Definición de las asociaciones
    AppId.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        AppId.belongsTo(models.user, { foreignKey: 'id_user', as: 'user' });
    };

    return AppId;
};
