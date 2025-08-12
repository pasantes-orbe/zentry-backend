import db from "../models"; // Importa el objeto db completo
import { Op } from "sequelize";

const { user, role } = db; // Extrae los modelos que necesitas

class UserClass {
    public async getAll() {
        const users = await user.findAll({
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: role,
                as: 'userRole'
            }],
        });
        return users;
    }

    public async getAllByRole(roleName: string) {
        const users = await user.findAll({
            where: {
                '$userRole.name$': roleName
            },
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: role,
                as: 'userRole'
            }],
        });
        return users;
    }

    public async is(roleName: string, id: number) {
        const foundUser = await user.findByPk(id, {
            attributes: { exclude: ['password', 'role_id'] },
            include: [{
                model: role,
                as: 'userRole'
            }],
        });

        if (!foundUser || !foundUser.role) return false;

        return foundUser.role.name === roleName;
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