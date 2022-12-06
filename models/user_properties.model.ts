import { DataTypes } from "sequelize";
import db from "../DB/connection";
import Property from "./property.model";
import User from "./user.model";

const UserProperties = db.define('user_properties', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }

},
{
    
    defaultScope: {
        include: [
            {model: User},
            {model: Property}
        ],
        attributes: {
            exclude: ['id_user', 'id_property']
        }
    },
    timestamps: false

}
);



export default UserProperties;