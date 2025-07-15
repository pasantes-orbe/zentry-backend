import { Op } from "sequelize";
import Role from "../models/roles.model";
import User from "../models/user.model";

class UserClass {
    public async getAll() {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: Role,
                as: 'role' // alias que usaste en associations.ts
            }],
        });
        return users;
    }

    public async getAllByRole(role: string) {
        const users = await User.findAll({
            where: {
                '$role.name$': role
            },
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: Role,
                as: 'role' // necesario para que '$role.name$' funcione
            }],
        });
        return users;
    }

    public async is(role: string, id: number) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: Role,
                as: 'role'
            }],
        });

        if (!user || !user.role) return false;

        return user.role.name === role;
    }
}

export default UserClass;

/*15/7/25
import { Op } from "sequelize";
import Role from "../models/roles.model";
import User from "../models/user.model";

class UserClass {
    public async getAll() {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'role_id'] },
            include: {
                model: Role
            },
        });
        return users;
    }

    public async getAllByRole(role: string) {
        const users = await User.findAll({
            where: {
                '$role.name$': role
            },
            attributes: { exclude: ['password', 'role_id'] },
            include: {
                model: Role
            },
        });
        return users;
    }

    public async is(role: string, id: number){
        const user = await User.findByPk(id, {
            attributes: {exclude: ['password', 'role_id']},
            include: {
                model: Role
            },
        });
        return (user as any).role.name === role;
    }
}
export default UserClass;*/