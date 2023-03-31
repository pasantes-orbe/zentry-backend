import { DataTypes } from "sequelize";
import db from "../DB/connection";

const AppId = db.define('appid', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    onesignal_id: { type: DataTypes.STRING }
    // address: {type: DataTypes.STRING},
    // details: {type: DataTypes.STRING},
    // finishAt: {type: DataTypes.DATE},
    // state: {type: DataTypes.BOOLEAN},
    // propertyNumber: {type: DataTypes.INTEGER}
},
{
    timestamps: true,
    updatedAt: false
}
);



export default AppId;