import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/roles.model";
import PasswordHelper from "../helpers/password.helper";
import UserClass from "../classes/UserClass";

class UserController {

    public async getAllUsers(req: Request, res: Response) {

        if(req.query.role){
            try {
                const users = await new UserClass().getAllByRole( String(req.query.role) );
                return res.json(users);
            } catch (error) {
                return res.status(500).send(error);
            }
        }

        try {
            const users = await new UserClass().getAll();
            return res.json(users);
        } catch (error) {
            return res.status(500).send(error);
        }

    }

    public async getUser(req: Request, res: Response) {

        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: {exclude: ['password', 'role_id']},
            include: {
                model: Role
            },
        });

        if (user) {
            return res.json(user);
        }

        res.status(404).json({
            msg: `No existe usuario con el id ${id}`
        });

    }

    

    public async register(req: Request, res: Response) {

        const { body } = req;

        try {

            // Cifrar password
            body.password = new PasswordHelper().hash(body.password);
            
            const user = new User(body);
            await user.save();
            
            res.json({
                msg: "El usuario se creo con exito",
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