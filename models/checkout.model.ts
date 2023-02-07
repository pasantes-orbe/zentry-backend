import { DataTypes } from "sequelize";
import db from "../DB/connection";
import CheckInModel from "./checkin.model";

const CheckOutModel = db.define('checkout', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    details: { type: DataTypes.TEXT }

},
{
    // timestamps: false
    defaultScope: {
        include: [CheckInModel]
    },
    createdAt: 'out_date',
    updatedAt: false
}
);



export default CheckOutModel;