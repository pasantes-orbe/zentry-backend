// models/property.model.ts
import { DataTypes } from "sequelize";

module.exports = (sequelize: any, DataTypes: any) => {

    const Property = sequelize.define('property', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING },
        number: { type: DataTypes.INTEGER },
        address: { type: DataTypes.STRING },
        avatar: { type: DataTypes.STRING }
    },
    {
        tableName: 'properties',
        timestamps: false
    });

    Property.associate = (models: any) => {
        // Asociación con country
        Property.belongsTo(models.country, {
            foreignKey: 'id_country',
            targetKey: 'id'
        });

        // Asociación con recurrent
        Property.hasMany(models.recurrent, {
            foreignKey: 'id_property',
            sourceKey: 'id'
        });

        // ✅ CORREGIDO: Agregado alias 'userProperty' 
        Property.hasOne(models.user_properties, {
            foreignKey: 'id_property',
            sourceKey: 'id',
            as: 'userProperty'  // ← Este alias estaba faltando
        });
    };

    return Property;
};














//import { DataTypes } from "sequelize";
//import { getDbInstance } from "../DB/connection";

//const db = getDbInstance();

//const Property = db.define('property', {
//    id: {
//        type: DataTypes.INTEGER,
//        primaryKey: true,
//        autoIncrement: true
//    },
//    name: {type: DataTypes.STRING},
//    number: {type: DataTypes.INTEGER},
//    address: {type: DataTypes.STRING},
//    avatar: {type: DataTypes.STRING}

//},
//{
//    timestamps: false
//}
//);



//module.exports = Property;

// models/property.model.ts
/* 25-8 import { DataTypes } from "sequelize";
-
module.exports = (sequelize: any, DataTypes: any) => {
    const Property = sequelize.define('property', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING },
        number: { type: DataTypes.INTEGER },
        address: { type: DataTypes.STRING },
        avatar: { type: DataTypes.STRING }
    },
    {
        tableName: 'properties', // Se recomienda usar el nombre de la tabla en plural
        timestamps: false
    });
    Property.associate = (models: any) => {
        // CORRECCIÓN: Nombres de modelos en minúsculas
        Property.belongsTo(models.country, {
            foreignKey: 'id_country',
            targetKey: 'id'
        });
        Property.hasMany(models.recurrent, {
            foreignKey: 'id_property',
            sourceKey: 'id'
        });
        Property.hasOne(models.user_properties, {
            foreignKey: 'id_property',
            sourceKey: 'id'
        });
    };
    return Property;
};*/
