import { DataTypes } from "sequelize";
import db from "../DB/connection";

const Notifcation = db.define('notification', {

    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title:{type: DataTypes.STRING},
    content:{type:DataTypes.STRING},
    id_user: { type: DataTypes.INTEGER } //15/7/25
},{
    updatedAt: false,
    timestamps: true // por defecto true, para createdAt 15/07/25
}
);

export default Notifcation;
