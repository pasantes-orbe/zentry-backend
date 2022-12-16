import { DataTypes } from "sequelize";
import db from "../DB/connection";
import CountryModel from "./country.model";
import Property from "./property.model";
import Role from "./roles.model";
import User from "./user.model";

const OwnerCountry = db.define('owner_country', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }

},
{
    
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
    timestamps: false

}
);



export default OwnerCountry;