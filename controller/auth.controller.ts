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

            //let ownerResponse = null;

            //if (userResponse.role.name === 'propietario') {
                // Buscamos la información del propietario/user_property, incluyendo la propiedad
                //const foundOwner = await db.owner.findOne({ 
                //    where: { id_user: foundUser.id },
                //    include: [{ model: db.property, as: 'property' }] 
                //});

                //if (foundOwner) {
                //    ownerResponse = foundOwner.get({ plain: true });
                    // Limpiamos los datos del usuario dentro del owner para evitar duplicados en el storage
                //    delete ownerResponse.user; 
                //}
            //}
                        // Devolvemos la respuesta exitosa con el objeto owner (si aplica)
            //return res.status(200).json({ 
            //    user: userResponse, 
            //    token, 
            //    owner: ownerResponse //¡CLAVE PARA EL FRONTEND!
            //});

            // Reemplazá desde la línea 88 hasta la 127

let ownerResponse = null;

if (userResponse.role.name === 'propietario') {
    console.log('🏠 Usuario es propietario, buscando datos...');
    console.log('🔍 ID usuario:', foundUser.id);

    // 1. Buscar la propiedad asignada al usuario
    const propertyAssignment = await db.user_properties.findOne({
        where: { id_user: foundUser.id },
        include: [{ model: db.property, as: 'property' }]
    });

    console.log('📍 Propiedad encontrada:', propertyAssignment ? 'SÍ' : 'NO');
    if (propertyAssignment) {
        console.log('   - ID propiedad:', propertyAssignment.id_property);
        console.log('   - Nombre:', propertyAssignment.property?.name);
        console.log('   - Número:', propertyAssignment.property?.number);
    }

    // 2. Buscar el país asignado al usuario
    const ownerCountry = await db.owner_country.findOne({
        where: { id_user: foundUser.id },
        include: [{ model: db.country, as: 'country' }]
    });

    console.log('🌍 País encontrado:', ownerCountry ? 'SÍ' : 'NO');
    if (ownerCountry) {
        console.log('   - ID país:', ownerCountry.id_country);
        console.log('   - Nombre país:', ownerCountry.country?.name);
    }

    // 3. Armar la respuesta en el formato que espera el frontend
    if (propertyAssignment) {
        ownerResponse = {
            id: propertyAssignment.id,
            id_user: foundUser.id,
            id_property: propertyAssignment.id_property,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                lastname: foundUser.lastname,
                email: foundUser.email
            },
            property: propertyAssignment.property
                ? {
                      id: propertyAssignment.property.id,
                      name: propertyAssignment.property.name,
                      number: propertyAssignment.property.number,
                      address: propertyAssignment.property.address,
                      id_country: propertyAssignment.property.id_country
                  }
                : null
        };

        console.log('✅ Owner response armado correctamente');
        console.log('   - Owner ID:', ownerResponse.id);
        console.log('   - User ID:', ownerResponse.id_user);
        console.log('   - Property ID:', ownerResponse.id_property);
    } else {
        console.warn('⚠️ No se encontró propiedad asignada para el usuario');
    }
}

// Devolvemos la respuesta exitosa
console.log('📤 Enviando respuesta al frontend...');
return res.status(200).json({
    user: userResponse,
    token,
    owner: ownerResponse
});

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
            return res.status(401).json(false); // Sin token = no autenticado
        }

        try {
            const { uid } = jwt.verify(token, JWT_SECRET) as TokenPayload;
            const foundUser = await db.user.findByPk(uid, {
                include: [{ model: db.role, as: "userRole" }],
            });

            if (!foundUser) {
                return res.status(401).json(false); // Usuario no existe
            }

        // ✅ CORRECCIÓN: Siempre devolver 200, pero cambiar el booleano
            if (foundUser.userRole?.name === requiredRole) {
                return res.status(200).json(true);
            }
        
            return res.status(200).json(false); // ← CAMBIO AQUÍ: 200 en vez de 400

        } catch (error) {
            return res.status(401).json(false); // Token inválido
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