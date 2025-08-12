/*import { DataTypes } from "sequelize";
import { db } from "../DB/connection";
import AmenityModel from "./amenity.model";
import User from "./user.model";

const Reservation = db.define('reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE },
    details: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
    id_user: { type: DataTypes.INTEGER },
    id_amenity: { type: DataTypes.INTEGER }
},
    {
        timestamps: false,
        defaultScope: {
            include: [User, AmenityModel]
        }
    }
);
Reservation.belongsTo(AmenityModel, {
    foreignKey: 'id_amenity',
    as: 'amenity'
});
Reservation.belongsTo(User, {
    foreignKey: 'id_user',
    as: 'user'
});
export default Reservation;*/

//import { DataTypes } from "sequelize";
//import AmenityModel from "./amenity.model";
//import User from "./user.model";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const Reservation = db.define('reservation', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    date: {
//        type: DataTypes.DATE
//    },
//    details: {
//       type: DataTypes.TEXT
//    },
//    status: {
//        type: DataTypes.STRING
//    },
//    id_user: {
//        type: DataTypes.INTEGER,
//        allowNull: false
//    },
//    id_amenity: {
//        type: DataTypes.INTEGER,
//        allowNull: false
//    }
//}, {
//    timestamps: false,
//    defaultScope: {
//        include: [
//            { model: User, as: 'user' },
//            { model: AmenityModel, as: 'amenity' }
//        ]
//    }
//});

//Reservation.belongsTo(AmenityModel, {
//    foreignKey: 'id_amenity',
//    as: 'amenity'
//});

//Reservation.belongsTo(User, {
//    foreignKey: 'id_user',
//    as: 'user'
//});

//export default Reservation;


// models/reservation.model.ts
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ReservationAttributes, ReservationCreationAttributes } from '../interfaces/reservation.interface';

export default (sequelize: Sequelize) => {
    // Definimos la interfaz del modelo, especificando sus atributos y los atributos de creación.
    // Esto es lo que soluciona los errores de tipado.
    const Reservation = sequelize.define<Model<ReservationAttributes, ReservationCreationAttributes>>('reservation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE
        },
        details: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.STRING
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_amenity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'reservations',
        timestamps: false
    });

    (Reservation as any).associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        Reservation.belongsTo(models.amenity, {
            foreignKey: 'id_amenity',
            as: 'amenity'
        });

        Reservation.belongsTo(models.user, {
            foreignKey: 'id_user',
            as: 'user'
        });
        
        // CORRECCIÓN: Nombres de modelos en minúsculas
        Reservation.hasMany(models.invitation, {
            foreignKey: 'id_reservation',
            sourceKey: 'id' //cambiar a "as"
        });
    };

    return Reservation;
};
