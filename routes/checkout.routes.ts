import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import checkOutController from "../controller/checkout.controller";
import checkInApproved from "../middlewares/customs/checkInApproved.middleware";
import checkInExists from "../middlewares/customs/checkInExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

const router = Router();

const controller: checkOutController = new checkOutController();

router.post('/', [
    check('id_checkin').notEmpty(),
    check('id_checkin').isNumeric(),
    check('id_checkin').custom(checkInApproved),

    noErrors
] ,controller.create);

export default router;