import { DataTypes } from "sequelize";
import db from "../DB/connection";
import CountryModel from "./country.model";
import Property from "./property.model";
import User from "./user.model";

const GuardCountry = db.define('guard_country', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }

},
{
    
    // defaultScope: {
    //     include: [
    //         {model: User},
    //         {model: CountryModel}
    //     ],
    //     attributes: {
    //         exclude: ['id_user', 'id_property']
    //     }
    // },
    timestamps: false

}
);



export default GuardCountry;