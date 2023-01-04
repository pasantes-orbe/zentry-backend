import { DataTypes } from "sequelize";
import db from "../DB/connection";

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
    createdAt: 'out_date',
}
);



export default CheckOutModel;