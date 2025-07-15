import { DataTypes } from "sequelize";
import db from "../DB/connection";

const Recurrent = db.define('recurrent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {type: DataTypes.BOOLEAN},
    guest_name: {type: DataTypes.STRING},
    guest_lastname: {type: DataTypes.STRING},
    dni: {type: DataTypes.INTEGER},
},{
    timestamps: false
}
);

export default Recurrent;