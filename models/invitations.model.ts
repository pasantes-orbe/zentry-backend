import { DataTypes } from "sequelize";
import db from "../DB/connection";

const Invitation = db.define('invitation', {
    
    fullname: { type: DataTypes.STRING },
    dni: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    
},
{
    timestamps: false
}
);



export default Invitation;