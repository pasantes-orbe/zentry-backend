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



export default CountryModel;