//import { DataTypes, Model, Optional } from "sequelize";
//import { CountryInterface } from "../interfaces/country.interface"; // Puede que no sea necesaria aquí si solo se usa en associations
//import { GuardInterface } from "../interfaces/guard.interface"; // Puede que no sea necesaria aquí si solo se usa en classes/Guard.ts
//import CountryModel from "./country.model";
//import Property from "./property.model"; // Si no se usa en este modelo, puedes removerla
//import Role from "./roles.model"; // Si no se usa en este modelo, puedes removerla
//import User from "./user.model";

//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();


// 1. Interfaz para los atributos del modelo (cómo se ve en la DB)
//interface GuardCountryAttributes {
//    id: number;
//    id_user: number;
//    id_country: number;
//}

// 2. Interfaz para los atributos de creación (id es opcional)
//interface GuardCountryCreationAttributes extends Optional<GuardCountryAttributes, "id"> {}

// 3. Clase del modelo que extiende Model, usando ambas interfaces
//class GuardCountry extends Model<GuardCountryAttributes, GuardCountryCreationAttributes> implements GuardCountryAttributes {
//    public id!: number;
//    public id_user!: number;
//    public id_country!: number;

    // Propiedad estática para las asociaciones (requerido por TypeScript y el index.js)
//    static associate: (models: any) => void;
//}

// 4. Inicialización del modelo
//GuardCountry.init({
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    id_user: {
//        type: DataTypes.INTEGER,
//        allowNull: false
//    },
//    id_country: {
//        type: DataTypes.INTEGER,
//        allowNull: false
//    }
//}, {
//    sequelize: db, // La instancia de Sequelize a la que se conecta el modelo
//    tableName: 'guard_countries', // Nombre de la tabla en la base de datos (pluralizado, según convención)
//    timestamps: false // No usa campos createdAt y updatedAt
//});

// 5. Definición de las asociaciones (llamada por models/index.js)
//GuardCountry.associate = (models: any) => {
//    GuardCountry.belongsTo(models.User, { foreignKey: 'id_user', as: 'user' });
//    GuardCountry.belongsTo(models.CountryModel, { foreignKey: 'id_country', as: 'country' });
//};

// Comentar momentáneamente el defaultScope para evitar problemas de referencia circular con sequelize
// defaultScope: {
//     include: [
//         {
//             model: User,
//             include: [Role]
//         },
//         { model: CountryModel }
//     ],
//     attributes: {
//         exclude: ['id_user', 'id_country']
//     }
// },

//export default GuardCountry;


// models/guard_country.model.ts
import { DataTypes } from "sequelize";

export default (sequelize: any, DataTypes: any) => {

    const GuardCountry = sequelize.define('guard_country', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_country: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'guard_countries',
        timestamps: false,
    });

    GuardCountry.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas
        GuardCountry.belongsTo(models.user, { foreignKey: 'id_user', as: 'user' });
        GuardCountry.belongsTo(models.country, { foreignKey: 'id_country', as: 'country' });
    };

    return GuardCountry;
};
