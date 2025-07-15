import { DataTypes, Model } from "sequelize";
import db from "../DB/connection";

class CheckOutModel extends Model {}

CheckOutModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idCheckin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_checkin',  // mapea el nombre de la columna en la base de datos
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  observation: {
    type: DataTypes.STRING,
  },
}, {
  sequelize: db,
  modelName: "checkout",
  tableName: "checkout",
  timestamps: false,
});

export default CheckOutModel;

/* 15/7/25
export interface CheckoutInterface {
  id: number;
  idCheckin: number;
  date: string;
  observation: string;
}*/
