import { NextFunction, Request, Response } from "express";
import { RoleInterface } from "../../interfaces/role.interface";
import jwt from "jsonwebtoken";
// Importamos el objeto 'db' centralizado para acceder a los modelos
import db from "../../models";

// Desestructuramos los modelos 'user' y 'role' del objeto 'db'
const { user, role } = db;

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";
console.log("JWT_SECRET siendo utilizado en isAdmin.middleware:", JWT_SECRET);

async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            msg: "No hay token de autorización",
        });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({
            msg: "Token mal formado o ausente.",
        });
    }

    try {
        const { uid } = jwt.verify(token, JWT_SECRET) as { uid: string };

        // Buscamos el usuario en la base de datos usando el modelo 'user'
        const foundUser = await user.findByPk(uid, {
            // Incluimos el modelo 'role' para acceder a la asociación
            include: {
                model: role,
                attributes: ["name"],
            },
            attributes: { exclude: ["password", "role_id"] },
        });

        if (!foundUser) {
            return res.status(404).json({
                msg: "El usuario no existe",
            });
        }

        // Accedemos a la asociación role con get()
        const roleRaw = foundUser.get('role');

        // Casteamos primero a unknown para evitar error de TypeScript
        const userRole = roleRaw as unknown as RoleInterface | null;

        if (!userRole || userRole.name !== "Admin") {
            return res.status(403).json({
                msg: "No tenés acceso a esta funcionalidad",
            });
        }

        console.log("Rol del usuario en isAdmin.middleware.ts:", userRole.name);
        
        // Adjuntamos el usuario a la solicitud para que los siguientes middlewares puedan acceder a él
        (req as any).user = foundUser;
        
        next();
    } catch (error) {
        return res.status(403).json({
            msg: "Token inválido",
        });
    }
}

export default isAdmin;
