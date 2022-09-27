import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import generateToken from "../helpers/jwt/generateToken";

class AuthController {

    public async login(req: Request, res: Response) {

        const { email, password } = req.body;

            // Verify if email exists

            const user = await User.findOne({
                where:{
                    email
                }
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
}

export default AuthController;