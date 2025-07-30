import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/user.model";
import Role from '../../models/roles.model';

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD"; // <--- AÑADE ESTA LÍNEA
console.log("JWT_SECRET siendo utilizado:", JWT_SECRET);


async function isTheUser(req: Request, res: Response, next: NextFunction) {

    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token de autorización"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const uid = decoded.uid as string;

        const user = await User.findByPk(uid, {
            include: {
                model: Role
            }
        });

        if (!user) {
            return res.status(404).send({
                msg: "El usuario no existe"
            });
        }

        const { id: idLoggedUser } = user.dataValues;
        const { id_user } = req.params;

        if (!idLoggedUser) {
            return res.status(500).json({ msg: "Error interno: usuario sin ID" });
        }

        // id_user viene como string por ser parámetro de URL, por eso convertimos idLoggedUser a string también
        if (idLoggedUser.toString() === id_user || user.role.name === "Admin") {
            next();
        } else {
            return res.status(403).send({
                msg: "No tenés permisos"
            });
        }

    } catch (error) {
        return res.status(403).send({
            msg: "Token inválido",
            error
        });
    }
}

export default isTheUser;
