import { DataTypes } from "sequelize";
import db from "../DB/connection";

const AmenityModel = db.define('amenity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: DataTypes.STRING},
    image: {type: DataTypes.STRING},
    address: {type: DataTypes.STRING}

},
{
    timestamps: false
}
);



export default AmenityModel;