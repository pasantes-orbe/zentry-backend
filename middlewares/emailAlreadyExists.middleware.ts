// middlewares/emailAlreadyExists.middleware.ts
import { NextFunction, Request, Response } from "express";
import { getModels } from "../models/getModels";

async function emailAlreadyExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { user } = getModels();
    const exists = await user.findOne({
        where: { email: req.body.email }
    });

    if (exists) {
        throw new Error(`El email ya existe`);
    }

    next();
}

export default emailAlreadyExists;