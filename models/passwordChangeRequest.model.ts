//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const passwordChangeRequest = db.define('password_change_request', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    id_user: {
//        type: DataTypes.INTEGER,
//        allowNull: false
//        // La asociación se hace en otro archivo
//    },
//    changed: {
//        type: DataTypes.BOOLEAN
//    },
//    date: {
//        type: DataTypes.DATE
//    }
//}, {
//    timestamps: false
//});

//export default passwordChangeRequest;

//models/passwordChangeRequest.model.ts
import { DataTypes } from "sequelize";

export default (sequelize: any, DataTypes: any) => {

    const PasswordChangeRequest = sequelize.define('password_change_request', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        changed: {
            type: DataTypes.BOOLEAN
        },
        date: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'password_change_requests', // Se recomienda usar el nombre de la tabla en plural
        timestamps: false
    });

    PasswordChangeRequest.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        PasswordChangeRequest.belongsTo(models.user, {
            foreignKey: 'id_user',
            as: 'passwordChangeRequests',
        });
    };

    return PasswordChangeRequest;
};
