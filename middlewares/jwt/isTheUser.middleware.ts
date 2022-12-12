import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import Role from '../../models/roles.model';

async function isTheUser(req:Request, res:Response, next:NextFunction) {

    const token = req.header("Authorization");

    if(!token){
        return res.status(401).json({
            msg: "No hay token de autorización"
        });
    }

    try {

        const { uid } = jwt.verify( token, "SUPER_SECRET_PASSWORD" );

        const user = await User.findByPk(uid, {
            include: {
                model: Role
            }
        });

        if(!user){
            return res.status(404).send({
                "msg": "El usuario no existe"
            })
        }

        const { id: idLoggedUser } = user.dataValues;
        const { id_user } = req.params;
        if(idLoggedUser == id_user || user.role.name == "administrador"){
            next();
        } else {
            return res.status(403).send({
                "msg": "No tenés permisos"
            })
        }
        
        
        
    } catch (error) {
        return res.status(403).send({
            "msg": "Token inválido",
            error
        })
    }

   
}

export default isTheUser;