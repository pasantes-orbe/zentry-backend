import { Request, Response } from "express";
import bcrypt from "bcrypt";
// Importamos el objeto 'db' centralizado
import db from "../models";
import generateToken from "../helpers/jwt/generateToken";
import jwt, { JwtPayload } from "jsonwebtoken";

// Corregimos la desestructuración de los modelos a minúsculas
const { user, role } = db;

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";
console.log("JWT_SECRET siendo utilizado auth.controller:", JWT_SECRET);

interface TokenPayload extends JwtPayload {
    uid: string;
}

class AuthController {
    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ msg: "Email y contraseña son obligatorios" });
            }

            const emailMinusculas = email.toLowerCase();

            // Usamos los modelos corregidos 'user' y 'role'
            const foundUser = await user.findOne({
                where: { email: emailMinusculas },
                include: [{ model: role, as: 'role' }],
            });

            if (!foundUser || !foundUser.password) {
                return res.status(404).json({ msg: "Usuario o contraseña inválido" });
            }

            const validPassword = await bcrypt.compare(password, foundUser.password);
            if (!validPassword) {
                return res.status(404).json({ msg: "Usuario o contraseña inválido" });
            }

            const token = await generateToken(String(foundUser.id));
            return res.status(200).json({ user: foundUser, token });

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ msg: "Error al iniciar sesión" });
        }
    }

    public async jwtValidate(req: Request, res: Response) {
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        if (!token) {
            return res.status(401).json({ msg: "No hay token de autorización" });
        }

        try {
            const { uid } = jwt.verify(token, JWT_SECRET) as TokenPayload;
            // Usamos el modelo 'user' corregido
            const foundUser = await user.findByPk(uid);
            if (!foundUser) {
                return res.status(404).json({ msg: "El usuario no existe" });
            }
            return res.status(200).json(true);
        } catch (error) {
            return res.status(403).json({ msg: "Token inválido" });
        }
    }

    public async isRole(req: Request, res: Response) {
        const { role: requiredRole } = req.params;
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        if (!token) {
            return res.status(401).json({ msg: "No hay token de autorización" });
        }

        try {
            const { uid } = jwt.verify(token, JWT_SECRET) as TokenPayload;
            // Usamos los modelos corregidos 'user' y 'role'
            const foundUser = await user.findByPk(uid, {
                include: [{ model: role, as: "role" }],
            });

            if (!foundUser) return res.status(404).json({ msg: "El usuario no existe" });

            if (foundUser.role?.name === requiredRole) {
                return res.status(200).json(true);
            }

            return res.status(400).json(false);
        } catch (error) {
            return res.status(403).json({ msg: "Token inválido" });
        }
    }
}

export default AuthController;




/* 15/7/25 import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import generateToken from "../helpers/jwt/generateToken";
import jwt, { JwtPayload } from "jsonwebtoken";
import Role from "../models/roles.model";


class AuthController {

    public async login(req: Request, res: Response) {

        const { email, password } = req.body;

            // Verify if email exists

            const emailMinusculas = email.toLowerCase()

            const user = await User.findOne({
                where:{
                    email: emailMinusculas
                },
                include: Role
            });
            
            if(!user){
                return res.status(404).json({
                    msg: "Usuario o contraseña inválido"
                });
            }
            
            // // Verify if password is correct
            const validPassword = bcrypt.compareSync(password, user.password);
            

            if(!validPassword){
                return res.status(404).json({
                    msg: "Usuario o contraseña inválido"
                });
            }

            const token = await generateToken(user.id);
            res.json({
                user,
                token
            });

    }

    public async jwtValidate(req: Request, res: Response){
        const token = req.header("Authorization");
        
        if(!token){
            return res.status(401).json({
                msg: "No hay token de autorización"
            });
        }

        try {

            const { uid }= jwt.verify( token, "SUPER_SECRET_PASSWORD" );
    
            const user = await User.findByPk(uid);
    
            if(!user){
                return res.status(404).send({
                    "msg": "El usuario no existe"
                })
            }

            return res.send(true)

            
            
        } catch (error) {
            return res.status(403).send({
                "msg": "Token inválido"
            })
        }

        
    }

    public async isRole(req: Request, res: Response){

        const { role } = req.params;

        const token = req.header("Authorization");

        if(!token){
            return res.status(401).json({
                msg: "No hay token de autorización"
            });
        }

        try {

            const { uid }= jwt.verify( token, "SUPER_SECRET_PASSWORD" );
    
            const user = await User.findByPk(uid, {
                include: Role
            });

            if(!user){
                return res.status(404).send({
                    "msg": "El usuario no existe"
                })
            }
            
            // Verifica que es un usuario del tipo ROLE de la request
            if(user.role.name == role){
                return res.json(true)
            }

            // El role no coincide con el buscado
            return res.status(400).send(false)

            
        } catch (error) {
            return res.status(403).send({
                "msg": "Token inválido"
            })
        }
        
    }
}

export default AuthController;*/