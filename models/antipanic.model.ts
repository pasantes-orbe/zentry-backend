import { DataTypes } from "sequelize";
import db from "../DB/connection";

const AntipanicModel = db.define('antipanic', {
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

    // 🔽 Claves foráneas necesarias para las asociaciones
    ownerId: { type: DataTypes.INTEGER },
    guardId: { type: DataTypes.INTEGER },
    id_country: { type: DataTypes.INTEGER }
}, {
    timestamps: true,
    updatedAt: false
});

export default AntipanicModel;


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

export default AntipanicModel;*/