//import { Model, Optional, DataTypes } from 'sequelize';
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//interface InvitationAttributes {
//  id_reservation: number;  
//  id: number;
//  name: string;
//  lastname: string;
//  dni: string;
//  fullname?: string; // si usas fullname también
//}

//interface InvitationCreationAttributes extends Optional<InvitationAttributes, 'id'> {}

//class Invitation extends Model<InvitationAttributes, InvitationCreationAttributes> implements InvitationAttributes {
//  public id_reservation!: number;    
//  public id!: number;
//  public name!: string;
//  public lastname!: string;
//  public dni!: string;
//  public fullname?: string;

  // timestamps si los usas
//  public readonly createdAt!: Date;
//  public readonly updatedAt!: Date;
//}

//Invitation.init({
//  id: {
//    type: DataTypes.INTEGER.UNSIGNED,
//    autoIncrement: true,
//    primaryKey: true,
//  },
//   id_reservation: {  // <-- agregar esta propiedad
//    type: DataTypes.INTEGER.UNSIGNED,
//    allowNull: false,
//  },  
//  fullname: { type: DataTypes.STRING },
//  dni: { type: DataTypes.STRING },
//  lastname: { type: DataTypes.STRING },
//  name: { type: DataTypes.STRING },
//}, {
//  sequelize: db,
//  modelName: 'invitation',
//  timestamps: false,
//});

//module.exports = Invitation;

// models/invitation.model.ts

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
        name: { type: DataTypes.STRING, allowNull: false },
        lastname: { type: DataTypes.STRING, allowNull: false },
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
