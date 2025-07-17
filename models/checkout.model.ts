/* 12-7-25
mport { DataTypes } from "sequelize";
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
export default CheckOutModel;*/

import { DataTypes, Model, Optional } from "sequelize";
import db from "../DB/connection";
import CheckInModel from "./checkin.model";
import { CheckoutInterface } from "../interfaces/checkout.interface"
// Para crear, id es opcional
interface CheckoutCreationAttributes extends Optional<CheckoutInterface, "id"> { }

class CheckOutModel extends Model<CheckoutInterface, CheckoutCreationAttributes> implements CheckoutInterface {
    public id!: number;
    public idCheckin!: number;
    public date!: string;
    public observation!: string;

    // aquí podés definir métodos si querés
}

CheckOutModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idCheckin: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_checkin", // si la DB usa snake_case
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "out_date",
        },
        observation: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "details", // si en tu tabla la columna es "details" y en interfaz "observation", mapea acá
        },
    },
    {
        sequelize: db,
        tableName: "checkout",
        timestamps: false,
        defaultScope: {
            include: [CheckInModel],
        },
    }
);

export default CheckOutModel;
