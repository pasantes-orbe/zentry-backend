/*import { DataTypes } from "sequelize";
import db from "../DB/connection";
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

import { DataTypes } from "sequelize";
import db from "../DB/connection";
import AmenityModel from "./amenity.model";
import User from "./user.model";

const Reservation = db.define('reservation', {
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
    timestamps: false,
    defaultScope: {
        include: [
            { model: User, as: 'user' },
            { model: AmenityModel, as: 'amenity' }
        ]
    }
});

Reservation.belongsTo(AmenityModel, {
    foreignKey: 'id_amenity',
    as: 'amenity'
});

Reservation.belongsTo(User, {
    foreignKey: 'id_user',
    as: 'user'
});

export default Reservation;
