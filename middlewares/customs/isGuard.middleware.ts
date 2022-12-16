import { NextFunction, Request, Response } from "express";
import UserClass from "../../classes/UserClass";
import userExists from "./userExists.middleware";

async function isGuard(id: number){

    const exists = await userExists(id);
    const isGuard = await new UserClass().is("vigilador", id);
    if(!isGuard){
        throw new Error(`El usuario no es un vigilador`);
    }
}

export default isGuard;