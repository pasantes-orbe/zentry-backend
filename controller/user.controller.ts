import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import Role from "../models/roles.model";

class UserController {

    public async getAllUsers(req: Request, res: Response) {

        const users = await User.findAll({
            include: {
                model: Role
            }
        });

        res.json(users);

    }

    public async getUser(req: Request, res: Response) {

        const { id } = req.params;

        const user = await User.findByPk(id);

        if (user) {
            return res.json(user);
        }

        res.status(404).json({
            msg: `No existe usuario con el id ${id}`,
            user
        });

    }

    public async register(req: Request, res: Response) {

        const { body } = req;

        try {

            // Compare if the user already exists by email.
            const exists = await User.findOne({
                where: {
                    email: body.email
                }
            });

            if(exists){
                return res.status(302).json({
                    msg: `Ya existe un usuario con el email`,
                    email: body.email
                })
            }

            // Cifrar password

            const password: string = bcrypt.hashSync(body.password, 10);
            


            const user = new User(body);
            await user.save();
            
            res.json({
                msg: "req.body",
                user
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo registrar al usuario, intente de nuevo."
            })
        }
    }

}

export default UserController;