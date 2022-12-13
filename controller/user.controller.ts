import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/roles.model";
import PasswordHelper from "../helpers/password.helper";
import UserClass from "../classes/UserClass";
import passwordChangeRequest from "../models/passwordChangeRequest.model";

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


    public async RequestChangePassword(req: Request, res: Response) {

        const { email } = req.body;

        const exists = await User.findOne({
            where: {email}
        })

        if(!exists){
            return res.status(404).send({
                msg: "No existe el user"
            });
        }


        
        const requestBody = {
            id_user: exists.id,
            date: Date.now(),
            changed: false
        }

        const request = await new passwordChangeRequest(requestBody);
        request.save();

        return res.json({
            msg: "El administrador recibió la solicitud de reestablecimiento de contraseña",
            request
        });



    }

    public async allPasswordChangeRequests(req: Request, res: Response){

        const { pendient } = req.query;
        
        if(pendient){
            const requests = await passwordChangeRequest.findAll({
                where: {
                    changed: false
                }
            })
            return res.json(requests);
        }

        const requests = await passwordChangeRequest.findAll();
        return res.json(requests);
    }

    public async changePassword(req: Request, res: Response) {

        const { id_request } = req.params;

        const request = await passwordChangeRequest.findByPk(id_request);

        if(!request){
            return res.status(404).send({
                msg: `No existe ninguna solicitud con id ${id_request}`
            });
        }

        if(request.dataValues.changed){
            return res.status(403).send({
                msg: `Ya se reestableció la contraseña para esta solicitud`
            });
        }

        const passHelper = new PasswordHelper();
        const generated_pass = passHelper.generate(6);
        const new_password = passHelper.hash(generated_pass);
        
        const user_update = await User.update({ 
            password: new_password
         }, {
            where: {
                id: request.id_user
            }
        });

        const request_update = await passwordChangeRequest.update({
            changed: true
        }, {
            where: {
                id: id_request
            }
        })

        return res.json({
            msg: "Reestablecimiento de contraseña exitoso",
            new_password: generated_pass
        });

        

    }


}

export default UserController;