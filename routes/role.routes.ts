import { Router } from "express";
import { check } from "express-validator";
import RoleController from "../controller/role.controller";
import roleAlreadyExists from "../middlewares/customs/roleAlreadyExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const role: RoleController = new RoleController();

//TODO: ADMIN only
router.get('/', role.getAllRoles);

// TODO: ADMIN only
// Corregido: se cambió 'getRoleByID' a 'getRoleById' para que coincida con el controlador
router.get('/:id', role.getRoleById);

//TODO: ADMIN only
router.post('/',[
    check('name', 'El nombre de rol es obligatorio').notEmpty(),
    check('name').custom(roleAlreadyExists),
    noErrors
], role.createRole);


export default router;