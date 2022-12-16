import { Request, Response, Router } from "express";
import { check } from "express-validator";
import noErrors from "../middlewares/noErrors.middleware";
import Role from "../models/roles.model";
import User from "../models/user.model";

const router = Router();

/**
 * Get All By Country
 */
router.get('/', async (req: Request, res: Response) => {
    const guards = await User.findAll({
        where: {
            '$role.name$': 'vigilador'
        },
        include: Role
    });
    return res.json(guards); 
})

export default router;