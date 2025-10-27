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

//module.exports = passwordChangeRequest;

//models/passwordChangeRequest.model.ts
import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

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
        // Asociación correcta: cada request pertenece a un usuario
        PasswordChangeRequest.belongsTo(models.user, {
            foreignKey: 'id_user',
            as: 'user',
        });
    };

    return PasswordChangeRequest;
};
