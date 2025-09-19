//07/08/25
// models/antipanic.model.ts
import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

    const AntipanicModel = sequelize.define('antipanic', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        address: { type: DataTypes.STRING },
        details: { type: DataTypes.STRING },
        finishAt: { type: DataTypes.DATE },
        state: { type: DataTypes.BOOLEAN },
        propertyNumber: { type: DataTypes.INTEGER },
        ownerId: { type: DataTypes.INTEGER },
        guardId: { type: DataTypes.INTEGER },
        id_country: { type: DataTypes.INTEGER },
        lat: { type: DataTypes.FLOAT }, 
        lng: { type: DataTypes.FLOAT }
    }, {
        tableName: 'antipanics', // Se recomienda usar el nombre de la tabla en plural
        timestamps: true,
        updatedAt: false
    });

    AntipanicModel.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        AntipanicModel.belongsTo(models.user, { foreignKey: 'ownerId', as: 'owner' });
        AntipanicModel.belongsTo(models.user, { foreignKey: 'guardId', as: 'guard' });
        AntipanicModel.belongsTo(models.country, { foreignKey: 'id_country', as: 'country' });
    };

    return AntipanicModel;
};



//06/08/25
//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const AntipanicModel = db.define('antipanic', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    address: { type: DataTypes.STRING },
//    details: { type: DataTypes.STRING },
//    finishAt: { type: DataTypes.DATE },
//    state: { type: DataTypes.BOOLEAN },
//    propertyNumber: { type: DataTypes.INTEGER },

    // 🔽 Claves foráneas necesarias para las asociaciones
//    ownerId: { type: DataTypes.INTEGER },
//    guardId: { type: DataTypes.INTEGER },
//    id_country: { type: DataTypes.INTEGER }
//}, {
//    timestamps: true,
//    updatedAt: false
//});

//module.exports = AntipanicModel;


/*15/7/25
import { DataTypes } from "sequelize";
import db from "../DB/connection";

const AntipanicModel = db.define('antipanic', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address: {type: DataTypes.STRING},
    details: {type: DataTypes.STRING},
    finishAt: {type: DataTypes.DATE},
    state: {type: DataTypes.BOOLEAN},
    propertyNumber: {type: DataTypes.INTEGER}
},
{
    timestamps: true,
    updatedAt: false
}
);

module.exports = AntipanicModel;*/