//middlewares/jwt/validateJWT.middleware.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getModels } from "../../models/getModels";

const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    // Busca el encabezado de autorización que contiene el token
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            msg: "No hay token de autorización"
        });
    }

    // Extrae el token, eliminando la palabra 'Bearer ' si está presente
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // Si el token aún está ausente o mal formado, responde con un error
    if (!token) {
        return res.status(401).json({
            msg: "Token mal formado o ausente."
        });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                msg: "Error interno del servidor: Falta la clave secreta de JWT"
            });
        }
        
        const decoded = jwt.verify(token, secret) as { uid: string };
        const { uid } = decoded;

        const { user } = getModels();
        // Buscamos el usuario en la base de datos usando el modelo del objeto 'db'
        const foundUser = await user.findByPk(uid);

        if (!foundUser) {
            return res.status(401).json({
                msg: "Token no válido - usuario no existe en DB"
            });
        }

        // Verificamos si el usuario está activo
        if (foundUser.get('is_active') === false) {
            return res.status(401).json({
                msg: "Token no válido - usuario con estado inactivo"
            });
        }
        
        // Agregamos el usuario al objeto de la solicitud (req) para usarlo en los controladores
        (req as any).user = foundUser;

        next();

    } catch (error) {
        // 🚨 CORRECCIÓN/DEBUGGING: Imprimir el error de JWT antes de responder 🚨
        console.error("❌ FALLA DE AUTENTICACIÓN (validateJWT - Token Inválido):", error);
        // -------------------------------------------------------------------------
        // En caso de que el token sea inválido (expirado, mal firmado, etc.), respondemos con 401
        res.status(401).json({
            msg: "Token no válido"
        });
    }
}

export default validateJWT;