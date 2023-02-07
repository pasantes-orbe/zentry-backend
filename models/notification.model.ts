import { DataTypes } from "sequelize";
import db from "../DB/connection";

const Notifcation = db.define('notification', {

    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title:{type: DataTypes.STRING},
    content:{type:DataTypes.STRING}
},
{
    updatedAt: false
}
);

export default Notifcation;
