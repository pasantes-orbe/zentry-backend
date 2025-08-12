//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const Recurrent = db.define('recurrent', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    status: {type: DataTypes.BOOLEAN},
//    guest_name: {type: DataTypes.STRING},
//    guest_lastname: {type: DataTypes.STRING},
//    dni: {type: DataTypes.INTEGER},
//},{
//    timestamps: false
//}
//);

//export default Recurrent;

// models/recurrent.model.ts
import { DataTypes } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {

    const Recurrent = sequelize.define('recurrent', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: { type: DataTypes.BOOLEAN },
        guest_name: { type: DataTypes.STRING },
        guest_lastname: { type: DataTypes.STRING },
        dni: { type: DataTypes.INTEGER },
    }, {
        tableName: 'recurrents', // Se recomienda usar el nombre de la tabla en plural
        timestamps: false
    });

    Recurrent.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        Recurrent.belongsTo(models.property, {
            foreignKey: 'id_property',
            targetKey: 'id'
        });
    };

    return Recurrent;
};
