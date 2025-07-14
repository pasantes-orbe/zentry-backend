import { DataTypes } from "sequelize";
import db from "../DB/connection";
import CountryModel from "./country.model";
import Role from "./roles.model";
import User from "./user.model";

const GuardSchedule = db.define('guard_schedule', {
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
    defaultScope: {
        include: [
            {
                model: User,
                include: [Role]
            },
            {model: CountryModel}
        ],
        attributes: {
            exclude: ['id_user', 'id_country']
        }
    },
    timestamps: false
}
);

export default GuardSchedule;