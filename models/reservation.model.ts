// models/reservation.model.ts
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ReservationAttributes, ReservationCreationAttributes } from '../interfaces/reservation.interface';

module.exports = (sequelize: Sequelize) => {
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
        
        Reservation.hasMany(models.invitation, {
            foreignKey: 'id_reservation',
            as: 'invitations'
        });
    };

    return Reservation;
};
