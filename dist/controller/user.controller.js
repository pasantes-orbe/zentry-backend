"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const password_helper_1 = __importDefault(require("../helpers/password.helper"));
const UserClass_1 = __importDefault(require("../classes/UserClass"));
const passwordChangeRequest_model_1 = __importDefault(require("../models/passwordChangeRequest.model"));
class UserController {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.query.role) {
                try {
                    const users = yield new UserClass_1.default().getAllByRole(String(req.query.role));
                    return res.json(users);
                }
                catch (error) {
                    return res.status(500).send(error);
                }
            }
            try {
                const users = yield new UserClass_1.default().getAll();
                return res.json(users);
            }
            catch (error) {
                return res.status(500).send(error);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const user = yield user_model_1.default.findByPk(id, {
                attributes: { exclude: ['password', 'role_id'] },
                include: {
                    model: roles_model_1.default
                },
            });
            if (user) {
                return res.json(user);
            }
            res.status(404).json({
                msg: `No existe usuario con el id ${id}`
            });
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            body.email = body.email.toLowerCase();
            try {
                // Cifrar password
                body.password = new password_helper_1.default().hash(body.password);
                const user = new user_model_1.default(body);
                yield user.save();
                res.json({
                    msg: "El usuario se creo con exito",
                    user
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: "No se pudo registrar al usuario, intente de nuevo."
                });
            }
        });
    }
    RequestChangePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const exists = yield user_model_1.default.findOne({
                where: { email }
            });
            if (!exists) {
                return res.status(404).send({
                    msg: "No existe el user"
                });
            }
            const requestBody = {
                id_user: exists.id,
                date: Date.now(),
                changed: false
            };
            const request = yield new passwordChangeRequest_model_1.default(requestBody);
            request.save();
            return res.json({
                msg: "El administrador recibió la solicitud de reestablecimiento de contraseña",
                request
            });
        });
    }
    allPasswordChangeRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pendient } = req.query;
            if (pendient) {
                const requests = yield passwordChangeRequest_model_1.default.findAll({
                    where: {
                        changed: false
                    },
                    include: user_model_1.default
                });
                return res.json(requests);
            }
            const requests = yield passwordChangeRequest_model_1.default.findAll();
            return res.json(requests);
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_request } = req.params;
            const request = yield passwordChangeRequest_model_1.default.findByPk(id_request);
            if (!request) {
                return res.status(404).send({
                    msg: `No existe ninguna solicitud con id ${id_request}`
                });
            }
            if (request.dataValues.changed) {
                return res.status(403).send({
                    msg: `Ya se reestableció la contraseña para esta solicitud`
                });
            }
            const passHelper = new password_helper_1.default();
            const generated_pass = passHelper.generate(6);
            const new_password = passHelper.hash(generated_pass);
            const user_update = yield user_model_1.default.update({
                password: new_password
            }, {
                where: {
                    id: request.id_user
                }
            });
            const request_update = yield passwordChangeRequest_model_1.default.update({
                changed: true
            }, {
                where: {
                    id: id_request
                }
            });
            console.log(user_update.email);
            //        const mail = await new Mailer().send(generated_pass, );
            return res.json({
                msg: "Reestablecimiento de contraseña exitoso",
                new_password: generated_pass
            });
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, lastname, email, birthday, phone } = req.body;
            const user = yield user_model_1.default.findByPk(id);
            if (!user) {
                return res.status(404).send({
                    msg: `No existe ningun usuario con ese id ${id}`
                });
            }
            const user_update = yield user.update({
                name,
                lastname,
                email,
                phone,
                birthday
            });
            return res.json({
                msg: "Actualizado correctamente",
                user: user_update
            });
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map