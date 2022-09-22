import { DataTypes } from "sequelize";
import db from "../DB/connection";
import User from "./user.model";

const Role = db.define('role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: DataTypes.STRING},
    avatar: {type: DataTypes.STRING}

},
{
    timestamps: false
}
);



export default Role;