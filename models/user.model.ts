//15/7/25 role.interface corregido
import { DataTypes, Model, Optional } from "sequelize";
import db from "../DB/connection";
import { UserInterface } from "../interfaces/user.interface";

interface UserCreationAttributes extends Optional<UserInterface, "id" | "role"> { }

class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
    public id!: number;
    public email!: string;
    public name!: string;
    public lastname!: string;
    public password!: string;
    public phone!: string;
    public birthday!: string;
    public dni!: string;
    public avatar!: string;
    public role_id!: number;
    public role?: any; // Sequelize no mapea automáticamente el tipo del include
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        lastname: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        birthday: { type: DataTypes.STRING },
        dni: { type: DataTypes.STRING },
        avatar: { type: DataTypes.STRING },
        role_id: { type: DataTypes.INTEGER }, // clave foránea
    },
    {
        sequelize: db,
        tableName: "user",
        timestamps: false,
    }
);

export default User;



/* 12-7-25import { DataTypes } from "sequelize";
import db from "../DB/connection";
import Role from "./roles.model";

const User = db.define('user', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING},
    birthday: {type: DataTypes.DATE},
    dni: {type: DataTypes.INTEGER},
    avatar: {type: DataTypes.STRING}
},
{
    timestamps: false
}
);
export default User;*/


// const Role = db.define('role', {
//     id:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     name: {type: DataTypes.STRING},
//     avatar: {type: DataTypes.STRING}

// },
// {
//     timestamps: false
// }
// );

// Role.hasOne(User);
// User.belongsTo(Role);

