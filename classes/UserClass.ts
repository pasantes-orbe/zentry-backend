//classes/UserClass.ts
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
        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = 'dkfzxplwp';
        const toAvatarUrl = (val?: string | null) => {
            if (!val) return placeholder;
            const s = String(val);
            if (/^https?:\/\//i.test(s)) return s; // absolute URL
            if (s.startsWith('/')) return s; // relative path, front will prefix base URL
            return `https://res.cloudinary.com/${cloudName}/image/upload/${s}`; // public_id
        };
        users.forEach((u: any) => {
            const current = u.get('avatar');
            u.setDataValue('avatar', toAvatarUrl(current));
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
        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = 'dkfzxplwp';
        const toAvatarUrl = (val?: string | null) => {
            if (!val) return placeholder;
            const s = String(val);
            if (/^https?:\/\//i.test(s)) return s; // absolute URL
            if (s.startsWith('/')) return s; // relative path
            return `https://res.cloudinary.com/${cloudName}/image/upload/${s}`; // public_id
        };
        users.forEach((u: any) => {
            const current = u.get('avatar');
            u.setDataValue('avatar', toAvatarUrl(current));
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

        // FIX: Se cambió el acceso de 'foundUser.role' a 'foundUser.userRole' para coincidir con el alias de la inclusión.
        // Esto previene los errores o cuelgues cuando se llama a esta función desde los middlewares/rutas POST.
        if (!foundUser || !foundUser.userRole) return false; 

        return foundUser.userRole.name === roleName;
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