import { DataTypes } from "sequelize";
import db from "../DB/connection";
import User from "./user.model";

const passwordChangeRequest = db.define('password_change_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    changed: {type: DataTypes.BOOLEAN},
    date: {type: DataTypes.DATE}
},
{
    timestamps: false
}
);



export default passwordChangeRequest;