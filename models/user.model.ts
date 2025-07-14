import { DataTypes, Model, Optional } from "sequelize";
import db from "../DB/connection";
import Role from "./roles.model";
import { UserInterface } from "../interfaces/user.interface";

// Para definir los campos opcionales en creación (id es opcional)
interface UserCreationAttributes extends Optional<UserInterface, "id"> { }

class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
    public id?: number;
    public email!: string;
    public name!: string;
    public lastname!: string;
    public password!: string;
    public phone!: number;
    public birthday!: string;
    public dni!: number;
    public avatar!: string;
    public role!: number;
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
        phone: { type: DataTypes.INTEGER },       // según tu interfaz es number
        birthday: { type: DataTypes.STRING },     // también string según interfaz
        dni: { type: DataTypes.INTEGER },
        avatar: { type: DataTypes.STRING },
        role: { type: DataTypes.INTEGER },        // debe estar para respetar tu interfaz
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

