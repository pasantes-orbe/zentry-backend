/*12-7-25
import { DataTypes } from "sequelize";
import { db } from "../DB/connection";
const CountryModel = db.define('country', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: DataTypes.STRING},
    latitude: {type: DataTypes.DOUBLE},
    longitude: {type: DataTypes.DOUBLE},
    avatar: {type: DataTypes.STRING}
},
{
    timestamps: false
}
);
module.exports = CountryModel;*/

//import { DataTypes, Model, Optional } from "sequelize";
//import { getDbInstance } from "../DB/connection";
//import { CountryInterface } from "../interfaces/country.interface";
//import GuardCountry from "./guard_country.model"; // Importa el modelo GuardCountry

//const db = getDbInstance();

// Campos opcionales en la creación (como el id)
//interface CountryCreationAttributes extends Optional<CountryInterface, 'id'> { }

//class CountryModel extends Model<CountryInterface, CountryCreationAttributes> implements CountryInterface {
//    public id!: number;
//    public name!: string;
//    public latitude!: number;
//    public longitude!: number;
//    public avatar!: string;

    // Propiedad estática para las asociaciones (requerido por TypeScript y el index.js)
//    static associate: (models: any) => void;
//}

//CountryModel.init(
//    {
//        id: {
//            type: DataTypes.INTEGER,
//            primaryKey: true,
//            autoIncrement: true,
//        },
//        name: {
//            type: DataTypes.STRING,
//            allowNull: false,
//        },
//        latitude: {
//            type: DataTypes.DOUBLE,
//            allowNull: false,
//        },
//        longitude: {
//            type: DataTypes.DOUBLE,
//            allowNull: false,
//        },
//        avatar: {
//            type: DataTypes.STRING,
//            allowNull: false,
//        },
//    },
//    {
//        sequelize: db,
//        tableName: 'countries', // 
//        timestamps: false,
//    }
//);

// Definición de las asociaciones
//CountryModel.associate = (models: any) => {
//    CountryModel.hasMany(models.GuardCountry, { foreignKey: 'id_country', as: 'guardCountries' });
//};

//module.exports = CountryModel;


// models/country.model.ts
import { DataTypes } from "sequelize";
module.exports = (sequelize: any, DataTypes: any) => {

    const Country = sequelize.define('country', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        locality: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // `perimeter_points` guarda el JSON de los 4 puntos
        perimeter_points: {
            type: DataTypes.TEXT, 
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'countries',
        timestamps: false,
    });

    Country.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas
        Country.hasMany(models.guard_country, { foreignKey: 'id_country', as: 'guardCountries' });
        Country.hasMany(models.property, { foreignKey: 'id_country', as: 'properties' });
        Country.hasMany(models.checkin, { foreignKey: 'id_country', as: 'checkins' });
    };

    return Country;
};
