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

// models/recurrent.model.ts
// models/recurrent.model.ts
import { DataTypes } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  const Recurrent = sequelize.define('recurrent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    guest_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guest_lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dni: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Lo siguiente es CRÍTICO para filtrado por country:
    id_property: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Si tenés relación directa con country:
    id_country: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'recurrents',
    timestamps: true // Lo activo para guardar createdAt/updatedAt por mejor trazabilidad
  });

  Recurrent.associate = (models: any) => {
    // Suele estar tanto con property como con country:
    Recurrent.belongsTo(models.property, {
      foreignKey: 'id_property',
      targetKey: 'id'
    });

    // Relación directa (opcional, si lo tenés en modelo country)
    if (models.country) {
      Recurrent.belongsTo(models.country, {
        foreignKey: 'id_country',
        targetKey: 'id'
      });
    }
  };

  return Recurrent;
};

