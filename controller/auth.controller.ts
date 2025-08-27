// controller/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

// Cambiar la importación a 'require' para asegurar la compatibilidad con el archivo index.js
const db = require("../models");
const generateToken = require("../helpers/jwt/generateToken").default; // Asumiendo que generateToken es un export default

// Obtenemos el secreto JWT del entorno o usamos un valor por defecto
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";

// Definimos una interfaz para la carga útil del token
interface TokenPayload extends JwtPayload {
    uid: string;
}

class AuthController {
    /**
     * Maneja la lógica de inicio de sesión de un usuario.
     * Valida las credenciales y devuelve un token JWT y los datos del usuario.
     */
    public login = async (req: Request, res: Response) => {
        console.log('🔐 Login controller ejecutado');
        console.log('Body recibido:', req.body);
        try {
            const { email, password } = req.body;

            // Validación básica de la entrada
            if (!email || !password) {
                return res.status(400).json({ msg: "Email y contraseña son obligatorios" });
            }

            const emailMinusculas = email.toLowerCase();

            // Buscamos el usuario en la base de datos, incluyendo su rol.
            // Accedemos a los modelos directamente desde el objeto 'db'
            const foundUser = await db.user.findOne({
                where: { email: emailMinusculas },
                include: [{ model: db.role, as: 'userRole' }],
            });

            // Verificamos si el usuario existe y si la contraseña es válida
            if (!foundUser || !foundUser.password) {
                return res.status(404).json({ msg: "Usuario o contraseña inválido" });
            }

            const validPassword = await bcrypt.compare(password, foundUser.password);
            if (!validPassword) {
                return res.status(404).json({ msg: "Usuario o contraseña inválido" });
            }

            // Generamos el token de autenticación
            const token = await generateToken(String(foundUser.id));
            
            // Creamos un nuevo objeto para la respuesta al cliente
            const userResponse = {
                // Copiamos todas las propiedades del usuario encontrado
                ...foundUser.get({ plain: true }),
                // Asignamos el rol a una propiedad 'role' para que el frontend lo pueda leer
                role: foundUser.userRole.get({ plain: true })
            };
            
            // Eliminamos la propiedad 'userRole' para evitar duplicados en la respuesta
            delete userResponse.userRole;

            // Devolvemos la respuesta exitosa
            return res.status(200).json({ user: userResponse, token });

        } catch (error) {
            // Manejo de errores
            console.error("Login error:", error);
            return res.status(500).json({ msg: "Error al iniciar sesión" });
        }
    };

    /**
     * Valida si un token JWT es válido.
     */
    public jwtValidate = async (req: Request, res: Response) => {
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        if (!token) {
            return res.status(401).json({ msg: "No hay token de autorización" });
        }

        try {
            const { uid } = jwt.verify(token, JWT_SECRET) as TokenPayload;
            const foundUser = await db.user.findByPk(uid);
            if (!foundUser) {
                return res.status(404).json({ msg: "El usuario no existe" });
            }
            return res.status(200).json(true);
        } catch (error) {
            return res.status(403).json({ msg: "Token inválido" });
        }
    };

    /**
     * Verifica si el usuario autenticado tiene un rol específico.
     */
    public isRole = async (req: Request, res: Response) => {
        const { role: requiredRole } = req.params;
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        if (!token) {
            return res.status(401).json({ msg: "No hay token de autorización" });
        }

        try {
            const { uid } = jwt.verify(token, JWT_SECRET) as TokenPayload;
            // Buscamos el usuario por su ID e incluimos su rol
            const foundUser = await db.user.findByPk(uid, {
                // Alias correcto para la consulta
                include: [{ model: db.role, as: "userRole" }],
            });

            if (!foundUser) return res.status(404).json({ msg: "El usuario no existe" });

            // Verificamos si el nombre del rol coincide con el rol requerido
            // Importante: Usamos el alias 'userRole' para acceder a los datos del rol
            if (foundUser.userRole?.name === requiredRole) {
                return res.status(200).json(true);
            }

            return res.status(400).json(false);
        } catch (error) {
            return res.status(403).json({ msg: "Token inválido" });
        }
    };
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