import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import checkOutController from "../controller/checkout.controller";
import checkInApproved from "../middlewares/customs/checkInApproved.middleware";
import checkInExists from "../middlewares/customs/checkInExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Server from "../server";
import { getModels } from "../models/getModels";

const router = Router();

const controller: checkOutController = new checkOutController();

router.post('/', [
    check('id_checkin').notEmpty(),
    check('id_checkin').isNumeric(),
    check('id_checkin').custom(checkInApproved),

    noErrors
], (req: Request, res: Response) => controller.create(req, res));

router.post('/socket', async (req: Request, res: Response) => {
    const { checkout, checkin } = getModels();
    const checkouts = await checkout.findAll({
        include: [checkin]
    });

    const server = Server.instance;
    server.io.emit('mensaje', checkouts);

    res.send(checkouts);
})

export default router;