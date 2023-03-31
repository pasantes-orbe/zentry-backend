import { Router } from "express";
import { check } from "express-validator";
import AntipanicController from "../controller/antipanic.controller";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const antipanicController: AntipanicController = new AntipanicController()

// Get All By Country ID

router.get('/:id_country', antipanicController.getAllByCountry);

// New Antipanic from owner

router.post('/', antipanicController.newAntipanic)

// Update Antipanic from guard


router.put('/:id', antipanicController.guardConfirm)

//Desactivate Antipanic

router.patch('/:id', antipanicController.desactivateAntipanic);

export default router;