import { Router } from "express";
import { check } from "express-validator";
import AntipanicController from "../controller/antipanic.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const antipanicController: AntipanicController = new AntipanicController()

//TODO: ADMIN only
router.get('/', antipanicController.getAll);

router.post('/', antipanicController.newAntipanic)

router.put('/:id', antipanicController.guardConfirm)

router.patch('/:id', antipanicController.desactivateAntipanic);

export default router;