import { DataTypes } from "sequelize";
import db from "../DB/connection";

const Property = db.define('property', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: DataTypes.STRING},
    number: {type: DataTypes.INTEGER},
    address: {type: DataTypes.STRING},
    avatar: {type: DataTypes.STRING}

},
{
    timestamps: false
}
);



export default Property;