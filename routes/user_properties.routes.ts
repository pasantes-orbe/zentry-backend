// routes/user_properties.routes.ts
import { Router } from "express";
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
import UserPropertiesController from "../controller/user_properties.controller";

const router = Router();
const controller: UserPropertiesController = new UserPropertiesController();

/**
 * POST /api/user-properties
 * Asigna un usuario existente a una propiedad existente.
 */
router.post('/', [
    // Validaciones para asegurar que los IDs son números y existen
    check('id_user', 'El id_user es obligatorio y debe ser numérico.').notEmpty().isNumeric(),
    check('id_property', 'El id_property es obligatorio y debe ser numérico.').notEmpty().isNumeric(),
    noErrors
], controller.assignProperty);

export default router;