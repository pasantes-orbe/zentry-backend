import { DataTypes } from "sequelize";
import db from "../DB/connection";

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