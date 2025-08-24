// models/roles.model.ts
import { DataTypes } from 'sequelize';

//antes module.exports = (sequelize: any, DataTypes: any) => { 
module.exports = (sequelize: any, DataTypes: any) => {

    const Role = sequelize.define('role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: { 
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'roles',
        timestamps: false
    });

    Role.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        Role.hasMany(models.user, { foreignKey: 'role_id', as: 'users' });
    };

    return Role;
};
