import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

     const AmenityModel = sequelize.define('amenity', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        image: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        id_country: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

     },
     {
         tableName: 'amenities',
         timestamps: false
     });

     AmenityModel.associate = (models: any) => {
         // Relación One-to-Many con reservations
         AmenityModel.hasMany(models.reservation, { foreignKey: 'id_amenity', as: 'reservations' });
         // Relación con country (opcional, pero útil si se usa include)
         AmenityModel.belongsTo(models.country, { foreignKey: 'id_country', as: 'country' });
     };

     return AmenityModel;
 };
