/*12-7-25
import { DataTypes } from "sequelize";
import db from "../DB/connection";
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
export default CountryModel;*/

import { DataTypes, Model, Optional } from "sequelize";
import db from "../DB/connection";
import { CountryInterface } from "../interfaces/country.interface";

// Campos opcionales en la creación (como el id)
interface CountryCreationAttributes extends Optional<CountryInterface, 'id'> { }

class CountryModel extends Model<CountryInterface, CountryCreationAttributes> implements CountryInterface {
    public id!: number;
    public name!: string;
    public latitude!: number;
    public longitude!: number;
    public avatar!: string;
}

CountryModel.init(
    {
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
        avatar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: db,
        tableName: 'country',
        timestamps: false,
    }
);

export default CountryModel;
