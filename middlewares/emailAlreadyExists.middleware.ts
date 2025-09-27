// middlewares/emailAlreadyExists.middleware.ts
import { NextFunction, Request, Response } from "express";
// ❌ ANTES: import { User } from "../models/user.model";
// Ajusta la ruta según la ubicación real de tu carpeta 'models'
import db from "../models"; // ⬅️ Importa el objeto central de modelos
const { user: User } = db;     // ⬅️ Desestructura el modelo 'user' y asígnale el alias 'User'

async function emailAlreadyExists(req:Request, res:Response, next:NextFunction): Promise<void> {
    // Utilizamos el alias 'User' que creamos arriba
    const exists = await User.findOne({ 
        where: {
            email: req.body.email
        }
    });

    if(exists){
        // El uso de 'throw new Error' detendrá la ejecución y será capturado por un 'catch'
        throw new Error(`El email ya existe`) 
    }

    next();
}

export default emailAlreadyExists;