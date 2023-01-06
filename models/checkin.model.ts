import { DataTypes } from "sequelize";
import db from "../DB/connection";
import User from "./user.model";

const CheckInModel = db.define('checkin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guest_name: {type: DataTypes.STRING},
    guest_lastname: {type: DataTypes.STRING},
    DNI: {type: DataTypes.BIGINT},
    income_date: {type: DataTypes.DATE},
    transport: {type: DataTypes.STRING},
    patent: {type: DataTypes.STRING},
    details: {type: DataTypes.TEXT},
    confirmed_by_owner: {type: DataTypes.BOOLEAN},
    check_in: {type: DataTypes.BOOLEAN}

},
{
    
    timestamps: false
}
);



export default CheckInModel;