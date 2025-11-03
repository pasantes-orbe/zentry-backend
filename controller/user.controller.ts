//controller/user.controller.ts
import { Request, Response } from "express";
import { getModels } from "../models/getModels"; 
import PasswordHelper from "../helpers/password.helper"; 
import UserClass from "../classes/UserClass";
import Mailer from "../helpers/mailer.helper";
import Server from "../server";
import jwt from "jsonwebtoken";
import Uploader from "../classes/Uploader";

// Los modelos se obtienen dentro de cada método con getModels()


// ✅ Helper: si solo tenemos public_id, construimos URL pública
function toCloudinaryUrlFromPublicId(publicId?: string | null) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  if (!publicId) return undefined;
  if (/^https?:\/\//i.test(publicId)) return publicId; // ya es URL completa
  return cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}` : publicId;
}

class UserController {
    public async getAllUsers(req: Request, res: Response) {
        if (req.query.role) {
            try {
                const users = await new UserClass().getAllByRole(String(req.query.role));
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

    /**
     * Admin aprueba/atiende una solicitud de cambio de contraseña
     * PATCH /api/users/change-password/:id_request
     * Body: { status: boolean }
     */
    public async approvePasswordChangeRequest(req: Request, res: Response) {
        const id_request = Number(req.params.id_request);
        const status = (req.body && typeof req.body.status !== 'undefined') ? !!req.body.status : true;

        if (!Number.isFinite(id_request)) {
            return res.status(400).json({ msg: 'Parámetro id_request inválido' });
        }

        const models: any = getModels();
        const passwordChangeRequest = models.passwordChangeRequest || models['password_change_request'];
        if (!passwordChangeRequest) {
            console.error('Modelo passwordChangeRequest no registrado en db');
            return res.status(500).json({ msg: 'Modelo de solicitud de cambio de contraseña no disponible' });
        }

        try {
            const reqRow = await passwordChangeRequest.findByPk(id_request);
            if (!reqRow) {
                return res.status(404).json({ msg: 'Solicitud no encontrada' });
            }

            await reqRow.update({ changed: !!status });

            // Notificar al propietario con instrucciones (opcional)
            try {
                const notificationModel: any = models.notification;
                const requesterUserId = (reqRow as any).id_user;
                const owner = await models.user.findByPk(requesterUserId);
                const ownerName = `${(owner as any)?.name || ''} ${(owner as any)?.lastname || ''}`.trim() || 'Propietario';
                const title = 'Instrucciones para restablecer contraseña';
                const content = 'Tu solicitud fue aprobada. Revisa tu email para cambiar la contraseña.';

                let createdNotification: any = null;
                if (notificationModel) {
                    createdNotification = await notificationModel.create({
                        id_user: requesterUserId,
                        title,
                        content,
                        read: false
                    });
                }

                const serverInstance = Server.instance;
                if (serverInstance && serverInstance.io) {
                    const payload = {
                        ...(createdNotification?.toJSON?.() ?? createdNotification ?? {}),
                        id_user: requesterUserId,
                        type: 'password_reset_instructions',
                        content,
                        createdAt: (createdNotification as any)?.createdAt ?? new Date().toISOString(),
                        requester_user_id: requesterUserId
                    };
                    serverInstance.io.emit('new-notification', payload);
                }

                // Enviar email con link de restablecimiento (token de un solo uso, expira en 30min)
                try {
                    const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";
                    const token = jwt.sign(
                        { uid: String(requesterUserId), requestId: String(id_request), type: 'password_reset' },
                        JWT_SECRET,
                        { expiresIn: '30m' }
                    );
                    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:4200';
                    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;
                    const mailer = new Mailer();
                    await mailer.sendResetLink((owner as any)?.email, resetLink);
                } catch (e) {
                    console.error('Error enviando email de restablecimiento:', e);
                }
            } catch (e) {
                console.error('Error notificando al propietario sobre reset de contraseña:', e);
            }

            return res.status(200).json({ msg: 'Solicitud actualizada', id_request, changed: !!status });
        } catch (error) {
            console.error('approvePasswordChangeRequest error:', error);
            return res.status(500).json({ msg: 'Error interno' });
        }
    }

    public async getUser(req: Request, res: Response) {
        const { id } = req.params;
        const { user, role } = getModels() as any;
        const foundUser = await user.findByPk(id, {
            attributes: { exclude: ['password', 'role_id'] },
            include: {
                model: role,
                as: 'userRole'
            },
        });

        if (foundUser) {
            const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
            const toAvatarUrl = (val?: string | null) => {
                if (!val) return placeholder;
                const s = String(val);
                if (/^https?:\/\//i.test(s)) return s;
                return cloudName
                    ? `https://res.cloudinary.com/${cloudName}/image/upload/${s}`
                    : s;
            };
            const current = (foundUser as any).get('avatar');
            (foundUser as any).setDataValue('avatar', toAvatarUrl(current));
            return res.json(foundUser);
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
            // Si viene archivo de avatar (express-fileupload)
            const files: any = (req as any).files;
            if (files?.avatar && files.avatar.tempFilePath) {
                try {
                    const tempFilePath = files.avatar.tempFilePath;
                    const uploader = new Uploader();
                    const uploaded: any = await uploader.uploadImage(tempFilePath);

                    // ❌ ORIGINAL:
                    // body.avatar = uploaded?.public_id || uploaded?.secure_url || body.avatar;

                    // ✅ NUEVO: priorizamos secure_url; si no existe, construimos desde public_id
                    const secureUrl = uploaded?.secure_url || toCloudinaryUrlFromPublicId(uploaded?.public_id);
                    body.avatar = secureUrl || body.avatar;

                } catch (e) {
                    console.error('Error subiendo avatar en register:', e);
                }
            }
            const { user } = getModels() as any;
            const createdUser = await user.create(body);
            res.json({
                msg: "El usuario se creo con exito",
                user: createdUser
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
        const { user } = getModels() as any;
        const exists = await user.findOne({
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
        const models: any = getModels();
        const passwordChangeRequest = models.passwordChangeRequest || models['password_change_request'];
        if (!passwordChangeRequest) {
            console.error('Modelo passwordChangeRequest no registrado en db');
            return res.status(500).json({ msg: "Modelo de solicitud de cambio de contraseña no disponible" });
        }
        const request = await passwordChangeRequest.create(requestBody);

        // Crear notificación para Admin y emitir por WebSocket
        try {
            const notificationModel: any = models.notification;
            const adminId = 1; // Destinatario: Admin principal (ajustar si hay multi-admin)

            const ownerName = `${exists.get('name') || ''} ${exists.get('lastname') || ''}`.trim() || 'Propietario';
            const title = 'Solicitud de cambio de contraseña';
            const content = `${ownerName} solicitó cambio de contraseña`;

            let createdNotification: any = null;
            if (notificationModel) {
                createdNotification = await notificationModel.create({
                    id_user: adminId,
                    title,
                    content,
                    read: false
                });
            }

            const serverInstance = Server.instance;
            if (serverInstance && serverInstance.io) {
                const payload = {
                    ...(createdNotification?.toJSON?.() ?? createdNotification ?? {}),
                    id_user: adminId,
                    type: 'password_request',
                    content,
                    createdAt: (createdNotification as any)?.createdAt ?? new Date().toISOString(),
                    requester_user_id: exists.get('id')
                };
                serverInstance.io.emit('new-notification', payload);
            }
        } catch (e) {
            console.error('Error creando/emitiendo notificación de password_request:', e);
            // No interrumpimos el flujo principal
        }

        return res.json({
            msg: "El administrador recibió la solicitud de reestablecimiento de contraseña",
            request
        });
    }
    

    public async allPasswordChangeRequests(req: Request, res: Response) {
        const { pendient } = req.query;
        if (pendient) {
            const models: any = getModels();
            const passwordChangeRequest = models.passwordChangeRequest || models['password_change_request'];
            const { user } = models;
            const requests = await passwordChangeRequest.findAll({
                where: {
                    changed: false
                },
                include: [{
                    model: user,
                    as: 'user'  // ✅ Agregado el alias correcto
                }]
                
            })
            return res.json(requests);
        }
        const models: any = getModels();
        const passwordChangeRequest = models.passwordChangeRequest || models['password_change_request'];
        if (!passwordChangeRequest) {
            console.error('Modelo passwordChangeRequest no registrado en db');
            return res.status(500).json([]);
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
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ msg: "La nueva contraseña es obligatoria." });
        }

        try {
            const { user } = getModels() as any;
            const foundUser = await user.findByPk(id);

            if (!foundUser) {
                return res.status(404).json({ msg: "Usuario no encontrado." });
            }

            const passHelper = new PasswordHelper();
            const hashedPassword = passHelper.hash(newPassword);

            await foundUser.update({ password: hashedPassword });

            return res.status(200).json({ msg: "Contraseña actualizada exitosamente." });

        } catch (error) {
            console.error("Error al cambiar la contraseña del usuario:", error);
            return res.status(500).json({ msg: "Error interno del servidor al cambiar la contraseña." });
        }
    }

    public async updateUser(req: Request, res: Response) {
        const { id } = req.params
        const { name, lastname, email, birthday, phone } = req.body
        const { user } = getModels() as any;
        const foundUser = await user.findByPk(id)
        if (!foundUser) {
            return res.status(404).send({
                msg: `No existe ningun usuario con ese id ${id}`
            });
        }
        const user_update = await foundUser.update(
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

    public async updateUserStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { isActive } = req.body as { isActive?: boolean };
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ msg: 'Campo isActive requerido y debe ser booleano' });
        }
        const { user } = getModels() as any;
        const foundUser = await user.findByPk(id);
        if (!foundUser) {
            return res.status(404).json({ msg: `No existe usuario con el id ${id}` });
        }
        const updated = await (foundUser as any).update({ isActive });
        return res.json({ msg: 'Estado actualizado', user: updated });
    }

    public async updateAvatar(req: Request, res: Response) {
        const { id } = req.params;
        const { avatar } = req.body as { avatar?: string };

        const files: any = (req as any).files;
        // Aceptar tanto 'file' (frontend nuevo) como 'avatar' (compatible con anterior)
        const inputFile: any = files?.file || files?.avatar;

        if ((!inputFile || !inputFile.tempFilePath) && (!avatar || typeof avatar !== 'string')) {
            return res.status(400).json({ msg: 'Campo avatar/file requerido' });
        }

        try {
            console.log('updateAvatar received:', {
                hasFiles: !!files,
                fieldUsed: inputFile ? (files?.file ? 'file' : 'avatar') : 'none',
                hasTempFilePath: !!inputFile?.tempFilePath,
                bodyHasAvatar: typeof avatar === 'string' && avatar.length > 0
            });
            const { user } = getModels() as any;
            const foundUser = await user.findByPk(id);
            if (!foundUser) {
                return res.status(404).json({ msg: `No existe usuario con el id ${id}` });
            }

            let valueToStore: string | undefined = undefined;

            if (inputFile && inputFile.tempFilePath) {
                // Validaciones de tipo/tamaño: <= 5MB y image/*
                const maxSize = 5 * 1024 * 1024; // 5MB
                const size = Number(inputFile.size) || 0;
                const mime = String(inputFile.mimetype || '');
                if (size > maxSize) {
                    return res.status(413).json({ msg: 'El archivo supera el tamaño máximo de 5MB' });
                }
                if (!/^image\//i.test(mime)) {
                    return res.status(400).json({ msg: 'El archivo debe ser una imagen (image/*)' });
                }
                const cloudOk = (!!process.env.CLOUDINARY_URL) || (!!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET);
                if (!cloudOk) {
                    return res.status(500).json({ msg: 'Cloudinary no configurado' });
                }
                try {
                    const tempFilePath = inputFile.tempFilePath;
                    const uploader = new Uploader();
                    const uploaded: any = await uploader.uploadImage(tempFilePath);

                    // ❌ ORIGINAL:
                    // valueToStore = uploaded?.public_id || uploaded?.secure_url;

                    // ✅ NUEVO:
                    valueToStore = uploaded?.secure_url || toCloudinaryUrlFromPublicId(uploaded?.public_id);

                } catch (e) {
                    console.error('Error subiendo avatar en updateAvatar:', e);
                }
            }

            if (!valueToStore && avatar) {
                let toUpload = avatar;
                if (!/^https?:\/\//i.test(avatar)) {
                    const cloudOk = (!!process.env.CLOUDINARY_URL) || (!!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET);
                    if (!cloudOk) {
                        return res.status(500).json({ msg: 'Cloudinary no configurado' });
                    }
                    const uploader = new Uploader();
                    const uploaded: any = await uploader.uploadImage(avatar);

                    // ❌ ORIGINAL:
                    // toUpload = uploaded?.public_id || uploaded?.secure_url || avatar;

                    // ✅ NUEVO:
                    toUpload = uploaded?.secure_url || toCloudinaryUrlFromPublicId(uploaded?.public_id) || avatar;
                }
                valueToStore = toUpload;
            }

            if (!valueToStore) {
                return res.status(400).json({ msg: 'No se pudo procesar el avatar' });
            }

            const updated = await (foundUser as any).update({ avatar: valueToStore });
            return res.json({ msg: 'Avatar actualizado', user: updated });
        } catch (error) {
            console.error('updateAvatar error:', error);
            return res.status(500).json({ msg: 'Error actualizando avatar' });
        }
    }

    public async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const models: any = getModels();
            const { user, guard_country, guard_schedule, owner_country, user_properties, notification, reservation, appid, antipanic, checkin } = models;
            const passwordChangeRequest = models.passwordChangeRequest || models['password_change_request'];

            // Buscar el usuario
            const foundUser = await user.findByPk(id);

            if (!foundUser) {
                return res.status(404).json({
                    ok: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Eliminar todos los registros relacionados en cascada
            // Usamos verificaciones para evitar errores si algún modelo no existe
            
            // 1. Eliminar registros en guard_country
            if (guard_country) {
                await guard_country.destroy({
                    where: { id_user: id }
                });
            }

            // 2. Eliminar horarios del guardia
            if (guard_schedule) {
                await guard_schedule.destroy({
                    where: { id_user: id }
                });
            }

            // 3. Eliminar registros en owner_country
            if (owner_country) {
                await owner_country.destroy({
                    where: { id_user: id }
                });
            }

            // 4. Eliminar propiedades asociadas al usuario
            if (user_properties) {
                await user_properties.destroy({
                    where: { id_user: id }
                });
            }

            // 5. Eliminar notificaciones del usuario
            if (notification) {
                await notification.destroy({
                    where: { id_user: id }
                });
            }

            // 6. Eliminar reservaciones del usuario
            if (reservation) {
                await reservation.destroy({
                    where: { id_user: id }
                });
            }

            // 7. Eliminar app IDs del usuario
            if (appid) {
                await appid.destroy({
                    where: { id_user: id }
                });
            }

            // 8. Eliminar solicitudes de cambio de contraseña
            if (passwordChangeRequest) {
                await passwordChangeRequest.destroy({
                    where: { id_user: id }
                });
            }

            // 9. Eliminar registros de antipanic donde el usuario es owner
            if (antipanic) {
                await antipanic.destroy({
                    where: { ownerId: id }
                });
            }

            // 10. Eliminar registros de antipanic donde el usuario es guard
            if (antipanic) {
                await antipanic.destroy({
                    where: { guardId: id }
                });
            }

            // 11. Eliminar registros de checkin donde el usuario es guard
            if (checkin) {
                await checkin.destroy({
                    where: { id_guard: id }
                });
            }

            // 12. Eliminar registros de checkin donde el usuario es owner
            if (checkin) {
                await checkin.destroy({
                    where: { id_owner: id }
                });
            }

            // Ahora sí eliminar el usuario
            await foundUser.destroy();

            return res.status(200).json({
                ok: true,
                message: 'Guardia eliminado exitosamente',
                id: parseInt(id)
            });

        } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar el usuario',
                error: error.message
            });
        }
    }
}
export default UserController;
