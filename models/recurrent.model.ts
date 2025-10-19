//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const Recurrent = db.define('recurrent', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    status: {type: DataTypes.BOOLEAN},
//    guest_name: {type: DataTypes.STRING},
//    guest_lastname: {type: DataTypes.STRING},
//    dni: {type: DataTypes.INTEGER},
//},{
//    timestamps: false
//}
//);

//module.exports = Recurrent;

// models/recurrent.model.ts// models/recurrent.model.ts
import { DataTypes } from "sequelize";

// patrón clásico de sequelize v5/v6 con CommonJS
module.exports = (sequelize: any, _DataTypes: typeof DataTypes) => {
  const Recurrent = sequelize.define(
    "recurrent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      guest_name: { type: DataTypes.STRING, allowNull: false },
      guest_lastname: { type: DataTypes.STRING, allowNull: false },
      dni: { type: DataTypes.INTEGER, allowNull: false },

      // Campos de negocio usados por las rutas/controller
      roleRecurrent: { type: DataTypes.STRING }, // ojo: en rutas usan "roleRecurrent"
      access_days: { type: DataTypes.STRING },

      // Relaciones
      id_property: { type: DataTypes.INTEGER, allowNull: false },
      id_country: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "recurrents",
      timestamps: false,
    }
  );

  // Asociaciones (el loader de modelos suele inyectar models en Recurrent.associate)
  (Recurrent as any).associate = (models: any) => {
    if (models.property) {
      Recurrent.belongsTo(models.property, {
        foreignKey: "id_property",
        as: "property",
      });
    }
    if (models.country) {
      Recurrent.belongsTo(models.country, {
        foreignKey: "id_country",
        as: "country",
      });
    }
  };

  return Recurrent;
};
