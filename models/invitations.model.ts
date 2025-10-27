// models/invitations.model.ts
import { Model, Optional, DataTypes } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {

    const Invitation = sequelize.define('invitation', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_reservation: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        guest_name: { type: DataTypes.STRING, allowNull: false },
        guest_lastname: { type: DataTypes.STRING, allowNull: false },
        dni: { type: DataTypes.STRING, allowNull: false },
        fullname: { type: DataTypes.STRING, allowNull: true },
    }, {
        tableName: 'invitations', // Nombre de la tabla en la base de datos (pluralizado por convención)
        timestamps: false,
    });

    // Definición de las asociaciones (si las hay)
    Invitation.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        // Asumiendo que una invitación pertenece a una reserva
        Invitation.belongsTo(models.reservation, { foreignKey: 'id_reservation', as: 'reservation' });
    };

    return Invitation;
};
