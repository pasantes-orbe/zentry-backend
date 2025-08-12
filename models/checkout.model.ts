// models/checkout.model.ts

//import { DataTypes, Model, Optional } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//import CheckInModel from "./checkin.model";
//import { CheckoutInterface } from "../interfaces/checkout.interface";



//const db = getDbInstance();

// Para creación, el campo id es opcional
//interface CheckoutCreationAttributes extends Optional<CheckoutInterface, "id"> {}

//class CheckOutModel extends Model<CheckoutInterface, CheckoutCreationAttributes>
//  implements CheckoutInterface {
//  public id!: number;
//  public id_checkin!: number;
//  public date!: string;
//  public observation!: string;
//}

//CheckOutModel.init(
//  {
//    id: {
//      type: DataTypes.INTEGER,
//      primaryKey: true,
//      autoIncrement: true,
//    },
//    id_checkin: {
//      type: DataTypes.INTEGER,
//      allowNull: false,
      // No hace falta usar 'field' si el nombre es igual a la columna
//    },
//    date: {
//      type: DataTypes.DATE,
//      allowNull: false,
//      field: "out_date", // si en la DB la columna se llama así
//    },
//    observation: {
//      type: DataTypes.TEXT,
//      allowNull: true,
//      field: "details", // si en la DB la columna se llama así
//    },
//  },
//  {
//    sequelize: db,
//    tableName: "checkout",
//    timestamps: false,
//    defaultScope: {
//      include: [CheckInModel],
//    },
//  }
//);

//export default CheckOutModel;


// models/checkout.model.ts
// Eliminamos imports directos de Sequelize (DataTypes, Model, Optional) y getDbInstance.
// Mantenemos la interfaz CheckoutInterface si la utilizas.
// import { DataTypes, Model, Optional } from "sequelize"; // NO VA
// import { getDbInstance } from "../DB/connection"; // NO VA
// import CheckInModel from "./checkin.model"; // NO VA, se accede vía 'models' en associate o sequelize.models

// models/checkout.model.ts
import { DataTypes } from "sequelize";

export default (sequelize: any, DataTypes: any) => {

    const CheckOut = sequelize.define('checkout', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_checkin: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "out_date",
        },
        observation: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "details",
        },
    }, {
        tableName: 'checkouts', 
        timestamps: false
    });

    CheckOut.associate = (models: any) => {
        // CORRECCIÓN: El nombre del modelo se define como 'checkin' en minúsculas en 'checkin.model.ts'
        // por lo que debemos usar models.checkin para referenciarlo
        CheckOut.belongsTo(models.checkin, {
            foreignKey: 'id_checkin',
            as: 'checkin'
        });
    };

    return CheckOut;
};
