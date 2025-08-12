//import { DataTypes } from "sequelize";
//import CountryModel from "./country.model";
//import Role from "./roles.model";
//import User from "./user.model";

//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const GuardSchedule = db.define('guard_schedule', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    week_day: { type: DataTypes.STRING },
//    start: { type: DataTypes.DATE },
//    exit: { type: DataTypes.DATE },
//},
//{
//    defaultScope: {
//        include: [
//            {
//                model: User,
//                include: [Role]
//            },
//            {model: CountryModel}
//        ],
//        attributes: {
//           exclude: ['id_user', 'id_country']
//        }
//    },
//    timestamps: false
//}
//);

//export default GuardSchedule;

// models/guard_schedule.ts
import { DataTypes } from "sequelize";

export default (sequelize: any, DataTypes: any) => {

    const GuardSchedule = sequelize.define('guard_schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        week_day: { type: DataTypes.STRING },
        start: { type: DataTypes.DATE },
        exit: { type: DataTypes.DATE },
    },
    {
        tableName: 'guard_schedules', // Se recomienda usar el nombre de la tabla en plural
        timestamps: false
    });

    GuardSchedule.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        GuardSchedule.belongsTo(models.user, {
            foreignKey: 'id_user',
            targetKey: 'id',
            as: 'user'
        });

        GuardSchedule.belongsTo(models.country, {
            foreignKey: 'id_country',
            targetKey: 'id',
            as: 'country'
        });
    };

    return GuardSchedule;
};

