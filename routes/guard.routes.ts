import { Request, Response, Router } from "express";
import { check } from "express-validator";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isGuard from "../middlewares/customs/isGuard.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import GuardCountry from "../models/guard_country.model";
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
});

/**
 * Assign Country
 */

router.post('/assign', [
    check('id_user').notEmpty(),
    check('id_country').notEmpty(),
    check('id_user').isNumeric(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    check('id_user').custom(isGuard),
    noErrors
] , async (req: Request, res: Response) => {

    try {

        const guard_to_country = new GuardCountry(req.body);
        guard_to_country.save();

        return res.json("vigilador asignado con éxito al country");
        
    } catch (error) {
        return res.status(500).send(error);
    }

    

});


export default router;