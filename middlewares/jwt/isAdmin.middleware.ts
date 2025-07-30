import { NextFunction, Request, Response } from "express";
import { RoleInterface } from "../../interfaces/role.interface";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import Role from "../../models/roles.model";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD"; // <--- AÑADE ESTA LÍNEA
console.log("JWT_SECRET siendo utilizado en isAdmin.middleware:", JWT_SECRET);


async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token de autorización",
        });
    }

    try {
        const { uid } = jwt.verify(token, JWT_SECRET) as { uid: number };

        const user = await User.findByPk(uid, {
            include: {
                model: Role,
                attributes: ["name"],
            },
            attributes: { exclude: ["password", "role_id"] },
        });

        if (!user) {
            return res.status(404).json({
                msg: "El usuario no existe",
            });
        }

        // Accedemos a la asociación role con get()
        const roleRaw = user.get('role');

        // casteamos primero a unknown para evitar error TS
        const role = roleRaw as unknown as RoleInterface | null;

        if (!role || !role.name) {
            return res.status(403).json({
                msg: "No se encontró el rol del usuario",
            });
        }

        console.log("Rol del usuario en isAdmin.middleware.ts:", role.name);
        if (role.name === "Admin") {
            return next();
        } else {
            return res.status(403).json({
                msg: "No tenés acceso a esta funcionalidad",
            });
        }
    } catch (error) {
        return res.status(403).json({
            msg: "Token inválido",
        });
    }
}

export default isAdmin;
