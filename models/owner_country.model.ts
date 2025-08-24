//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const OwnerCountry = db.define('owner_country', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    }

//},
//{
    
    // defaultScope: {
    //     include: [
    //         {
    //             model: User,
    //             include: [Role]
    //         },
    //         {model: CountryModel}
    //     ],
    //     attributes: {
    //         exclude: ['id_user', 'id_country']
    //     }
    // },
//    timestamps: false

//}
//);

//module.exports = OwnerCountry;

//07/08/25
// models/owner_country.model.ts
import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

    const OwnerCountry = sequelize.define('owner_country', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    },
    {
        tableName: 'owner_countries', // Se recomienda usar el nombre de la tabla en plural
        timestamps: false
    });

    OwnerCountry.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas para que coincidan con el resto del proyecto
        OwnerCountry.belongsTo(models.user, {
            foreignKey: 'id_user',
            targetKey: 'id'
        });

        OwnerCountry.belongsTo(models.country, {
            foreignKey: 'id_country',
            targetKey: 'id'
        });
    };

    return OwnerCountry;
};
