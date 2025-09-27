// middlewares/noErrors.middleware.ts
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

function noErrors(req: Request, res:Response, next: NextFunction){
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        // 🚨 AÑADIR ESTE LOG para ver qué falla 🚨
        console.error("❌ ERRORES DE VALIDACIÓN DETECTADOS:");
        console.error(errors.array());
        // ------------------------------------
        
        return res.status(400).json({
            errors: errors.array()
        })
    }

    next();

}

export default noErrors;