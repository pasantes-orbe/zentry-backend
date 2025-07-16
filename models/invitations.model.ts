import { Model, Optional, DataTypes } from 'sequelize';
import db from '../DB/connection';

interface InvitationAttributes {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  fullname?: string; // si usas fullname también
}

interface InvitationCreationAttributes extends Optional<InvitationAttributes, 'id'> {}

class Invitation extends Model<InvitationAttributes, InvitationCreationAttributes> implements InvitationAttributes {
  public id!: number;
  public name!: string;
  public lastname!: string;
  public dni!: string;
  public fullname?: string;

  // timestamps si los usas
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Invitation.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  fullname: { type: DataTypes.STRING },
  dni: { type: DataTypes.STRING },
  lastname: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
}, {
  sequelize: db,
  modelName: 'invitation',
  timestamps: false,
});

export default Invitation;
