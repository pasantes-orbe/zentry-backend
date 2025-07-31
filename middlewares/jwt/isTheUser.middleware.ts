//import { NextFunction, Request, Response } from "express";
//import jwt, { JwtPayload } from "jsonwebtoken";
//import User from "../../models/user.model";
//import Role from '../../models/roles.model';

//const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD"; // <--- AÑADE ESTA LÍNEA
//console.log("JWT_SECRET siendo utilizado:", JWT_SECRET);


//async function isTheUser(req: Request, res: Response, next: NextFunction) {

//    const token = req.header("Authorization");

//    if (!token) {
//        return res.status(401).json({
//            msg: "No hay token de autorización"
//        });
//    }

//    try {
//        const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

//        const decoded = jwt.verify(tokenWithoutBearer, JWT_SECRET) as JwtPayload;

//        const uid = decoded.uid as string;

        //const user = await User.findByPk(uid, {
        //    include: {
        //        model: Role
        //    }
        //});

//        if (!user) {
//            return res.status(404).send({
//                msg: "El usuario no existe"
//            });
//        }


                // El ID del usuario logueado (desde el token)
//        const idLoggedUser = parseInt(uid, 10); // Convierte a número si uid es string y los IDs son números

        // El ID del usuario que se intenta modificar (desde los parámetros de la URL)
        // La ruta es '/change-password/:id', por lo tanto, el parámetro es 'id'.
//        const idUserInParams = parseInt(req.params.id, 10); // <-- CORRECCIÓN: Usamos req.params.id

        // Comprobación crucial: Asegurarse de que el usuario logueado está modificando SU PROPIO recurso.
        // Eliminamos la excepción para el "Admin", ya que este middleware es específicamente
        // para el flujo donde el propietario cambia el mismo la contraseña.
//        if (idLoggedUser === idUserInParams) {
//            next(); // Permite que la solicitud continúe
//        } else {
//            return res.status(403).send({
//                msg: "No tienes permiso para modificar la contraseña de otro usuario." // Mensaje más específico
//            });
//        }

        //const { id: idLoggedUser } = user.dataValues;
        //const { id_user } = req.params;

        //if (!idLoggedUser) {
        //    return res.status(500).json({ msg: "Error interno: usuario sin ID" });
        //}

        // id_user viene como string por ser parámetro de URL, por eso convertimos idLoggedUser a string también
        //if (idLoggedUser.toString() === id_user || user.role.name === "Admin") {
        //    next();
        //} else {
        //    return res.status(403).send({
        //        msg: "No tenés permisos"
        //    });
        //}

//    } catch (error) {
//        return res.status(403).send({
//            msg: "Token inválido",
//            error
//        });
//    }
//}

//export default isTheUser;




import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";
console.log("JWT_SECRET siendo utilizado en isTheUser.middleware:", JWT_SECRET);


async function isTheUser(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({
            msg: "No hay token de autorización."
        });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({
            msg: "Token mal formado o ausente después de 'Bearer '."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Payload del token realmente tenga una propiedad 'uid'.
        // Si es 'id' o cualquier otro nombre, cámbialo aquí.
        // Convertimos a número para asegurar la comparación de tipos.
        const uid = parseInt(decoded.uid as string, 10);

        // Obtenemos el ID del usuario de los parámetros de la URL
        // La ruta es '/change-password/:id', por eso usamos req.params.id
        const idUserInParams = parseInt(req.params.id, 10);

        // El ID del token es igual al ID de la URL
        if (uid === idUserInParams) {
            next(); // Los IDs coinciden, el usuario está autorizado a modificar su propio recurso.
        } else {
            // Los IDs no coinciden
            return res.status(403).send({
                msg: "No tienes permiso para modificar la contraseña de otro usuario."
            });
        }

    } catch (error) {
        // Manejo de errores de JWT más específicos
        let errorMessage = "Token inválido.";
        if (error instanceof jwt.TokenExpiredError) {
            errorMessage = "Token expirado.";
        } else if (error instanceof jwt.JsonWebTokenError) {
            errorMessage = "Token malformado o firma inválida.";
        }

        console.error("Error en isTheUser middleware:", errorMessage, error);

        return res.status(403).send({
            msg: errorMessage,
        });
    }
}
export default isTheUser;
