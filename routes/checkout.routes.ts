import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import checkInController from "../controller/checkin.controller";
import checkOutController from "../controller/checkout.controller";
import checkInApproved from "../middlewares/customs/checkInApproved.middleware";
import checkInExists from "../middlewares/customs/checkInExists.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Server from "../models/server";
import db from "../models"; // Importamos el objeto db centralizado

const router = Router();

// Desestructuramos los modelos desde el objeto 'db'
const { checkout, checkin } = db;

const controller: checkOutController = new checkOutController();

router.post('/', [
    check('id_checkin').notEmpty(),
    check('id_checkin').isNumeric(),
    check('id_checkin').custom(checkInApproved),

    noErrors
], controller.create);

router.post('/socket', async (req: Request, res: Response) => {

    const checkouts = await checkout.findAll({ // Usamos el modelo 'checkout' de db
        include: [checkin] // Usamos el modelo 'checkin' de db
    });

    const server = Server.instance;
    server.io.emit('mensaje', checkouts);

    res.send(checkouts);

})

export default router;