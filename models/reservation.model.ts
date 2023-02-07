import { DataTypes } from "sequelize";
import db from "../DB/connection";
import AmenityModel from "./amenity.model";
import User from "./user.model";

const Reservation = db.define('reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {type: DataTypes.DATE},
    details: {type: DataTypes.TEXT},
    status: {type: DataTypes.STRING}

},
{
    timestamps: false,
    defaultScope: {
        include: [User, AmenityModel]
    }
}
);



export default Reservation;