//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";


//const db = getDbInstance(); 

//const AmenityModel = db.define('amenity', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    name: {type: DataTypes.STRING},
//    image: {type: DataTypes.STRING},
//    address: {type: DataTypes.STRING}

//},
//{
//    timestamps: false
//}
//);



//module.exports = AmenityModel;

// models/amenity.model.ts
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
        }
    },
    {
        tableName: 'amenities',
        timestamps: false
    });

    AmenityModel.associate = (models: any) => {
        // CORRECCIÓN: Usamos el nombre del modelo en minúsculas para que coincida con la definición
        AmenityModel.hasMany(models.reservation, { foreignKey: 'id_amenity', as: 'reservations' });
    };

    return AmenityModel;
};
