// models/checkout.model.ts

import { DataTypes, Model, Optional } from "sequelize";
import db from "../DB/connection";
import CheckInModel from "./checkin.model";
import { CheckoutInterface } from "../interfaces/checkout.interface";

// Para creación, el campo id es opcional
interface CheckoutCreationAttributes extends Optional<CheckoutInterface, "id"> {}

class CheckOutModel extends Model<CheckoutInterface, CheckoutCreationAttributes>
  implements CheckoutInterface {
  public id!: number;
  public id_checkin!: number;
  public date!: string;
  public observation!: string;
}

CheckOutModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_checkin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // No hace falta usar 'field' si el nombre es igual a la columna
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "out_date", // si en la DB la columna se llama así
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "details", // si en la DB la columna se llama así
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
