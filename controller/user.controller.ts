// src/controller/user.controller.ts

import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/roles.model";
import PasswordHelper from "../helpers/password.helper"; 
import UserClass from "../classes/UserClass";
import passwordChangeRequest from "../models/passwordChangeRequest.model";
import Mailer from "../helpers/mailer.helper";

class UserController {
    public async getAllUsers(req: Request, res: Response) {
        if (req.query.role) {
            try {
                const users = await new UserClass().getAllByRole(String(req.query.role));
                return res.json(users);
            } catch (error) {
                return res.status(500).send(error);
            }
        } try {
            const users = await new UserClass().getAll();
            return res.json(users);
        } catch (error) {
            return res.status(500).send(error);
        }
    }

    public async getUser(req: Request, res: Response) {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'role_id'] },
            include: {
                model: Role,
                as: 'role'
            },
        });

        if (user) {
            return res.json(user);
        }
        res.status(404);
        return res.json({ msg: `No existe usuario con el id ${id}` });

    }

    public async register(req: Request, res: Response) {
        const { body } = req;
        body.email = body.email.toLowerCase();
        try {
            // Cifrar password
            body.password = new PasswordHelper().hash(body.password);
            const user = await User.create(body);
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
            where: { email }
        })
        if (!exists) {
            return res.status(404).send({
                msg: "No existe el user"
            });
        }
        const requestBody = {
            id_user: exists.get('id'),
            date: Date.now(),
            changed: false
        }
        const request = await passwordChangeRequest.create(requestBody);
        return res.json({
            msg: "El administrador recibió la solicitud de reestablecimiento de contraseña",
            request
        });
    }

    public async allPasswordChangeRequests(req: Request, res: Response) {
        const { pendient } = req.query;
        if (pendient) {
            const requests = await passwordChangeRequest.findAll({
                where: {
                    changed: false
                },
                include: User
            })
            return res.json(requests);
        }
        const requests = await passwordChangeRequest.findAll();
        return res.json(requests);
    }

    /**
     * MÉTODO DE CAMBIO DE CONTRASEÑA (PARA PROPIETARIO CAMBIANDO SU PROPIA CONTRASEÑA)
     * Este método permite a un usuario cambiar su propia contraseña.
     * La ruta asociada es '/change-password/:id' donde :id es el ID del usuario.
     * El middleware 'isTheUser' asegura que el usuario logueado sea el mismo que el ID en la URL.
     */
    public async changePassword(req: Request, res: Response) {
        // Obtenemos el ID del usuario de los parámetros de la URL
        const { id } = req.params;
        // Obtenemos la nueva contraseña del cuerpo de la solicitud (JSON)
        const { newPassword } = req.body;

        // Validar que la nueva contraseña no esté vacía
        if (!newPassword) {
            return res.status(400).json({ msg: "La nueva contraseña es obligatoria." });
        }

        try {
            // Buscar al usuario en la base de datos por el ID obtenido de la URL
            const user = await User.findByPk(id);

            // Si el usuario no existe, enviamos un error 404
            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado." });
            }

            // El middleware 'isTheUser' ya debería haber verificado que el 'id' de la URL
            // coincide con el 'uid' del token. No necesitamos una verificación adicional aquí
            // a menos que quieras una capa extra de seguridad.

            // Instanciamos tu PasswordHelper para cifrar la nueva contraseña
            const passHelper = new PasswordHelper();
            const hashedPassword = passHelper.hash(newPassword); // Ciframos la nueva contraseña

            // Actualizamos la contraseña del usuario en la base de datos
            await user.update({ password: hashedPassword });

            // Enviamos una respuesta de éxito
            return res.status(200).json({ msg: "Contraseña actualizada exitosamente." });

        } catch (error) {
            // Capturamos y registramos cualquier error que ocurra durante el proceso
            console.error("Error al cambiar la contraseña del usuario:", error);
            // Enviamos una respuesta de error interno del servidor
            return res.status(500).json({ msg: "Error interno del servidor al cambiar la contraseña." });
        }
    }

    public async updateUser(req: Request, res: Response) {
        const { id } = req.params
        const { name, lastname, email, birthday, phone } = req.body
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).send({
                msg: `No existe ningun usuario con ese id ${id}`
            });
        }
        const user_update = await user.update(
            {
                name,
                lastname,
                email,
                phone,
                birthday
            }
        )
        return res.json({
            msg: "Actualizado correctamente",
            user: user_update
        })
    }
}
export default UserController;