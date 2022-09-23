import { Router } from "express";
import { check } from "express-validator";
import PropertyController from "../controller/property.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();
const property: PropertyController = new PropertyController();

//TODO: ADMIN only
router.get('/', property.getAll);

//TODO: ADMIN only
router.get('/:id', property.getByID);

//TODO: ADMIN only
router.post('/', [
    check('address', 'La direccion es obligatoria').notEmpty(),
    noErrors
], property.create);


export default router;