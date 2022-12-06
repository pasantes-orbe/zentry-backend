import { Op } from "sequelize";
import Role from "../models/roles.model";
import User from "../models/user.model";

class UserClass {

    public async getAll(){

            const users = await User.findAll({
                attributes: {exclude: ['password', 'role_id']},
                include: {
                    model: Role
                },
            });

            return users;

    }

    public async getAllByRole(role: string | ""){

        const users = await User.findAll({
            where:{
                '$role.name$': role
            },
            attributes: {exclude: ['password', 'role_id']},
            include: {
                model: Role
            },
        });

        return users;

}

}

export default UserClass;