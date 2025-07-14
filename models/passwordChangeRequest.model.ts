import { DataTypes } from "sequelize";
import db from "../DB/connection";

const passwordChangeRequest = db.define('password_change_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false
        // La asociación se hace en otro archivo
    },
    changed: {
        type: DataTypes.BOOLEAN
    },
    date: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false
});

export default passwordChangeRequest;
