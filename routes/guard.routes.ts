import { Request, Response, Router } from "express";
import { check } from "express-validator";
import Guard from "../classes/Guard";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isGuard from "../middlewares/customs/isGuard.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import GuardCountry from "../models/guard_country.model";
import GuardSchedule from "../models/guard_schedule.model";
import Role from "../models/roles.model";
import User from "../models/user.model";

const router = Router();

/**
 * Get All
 */
router.get('/', async (req: Request, res: Response) => {
    const guards = await new Guard().getAll();
    return res.json(guards); 
});

/**
 * Get All By Country
 */
router.get('/get_by_country/:id_country', [
    check('id_country').isNumeric(),
    check('id_country').notEmpty(),
] , async (req: Request, res: Response) => {

    const guards = await new Guard().getByCountry( +req.params.id_country );

    return res.json(guards);

});

/**
 * Assign Country
 */

router.post('/assign', [
    check('id_user').notEmpty(),
    check('id_user').isNumeric(),
    check('id_country').notEmpty(),
    check('id_country').isNumeric(),
    check('id_country').custom(countryExists),
    check('id_user').custom(isGuard),
    noErrors
] , async (req: Request, res: Response) => {

    const guard  = req.body;
    const assign = await new Guard().assignCountry(guard);
    res.json(assign);

});

/**
 * Get Schedule by Country
 */
router.get('/schedule/all/:id_country', [
    check('id_country').isNumeric(),
    check('id_country').notEmpty(),
] , async (req: Request, res: Response) => {

    const guards = await GuardSchedule.findAll({
        where: {
            id_country: req.params.id_country
        }
    })

    return res.json(guards);

});

/**
 * Assign Schedule
 */
router.post('/schedule', [
    check('id_country').isNumeric(),
    check('id_country').notEmpty(),
    check('week_day').notEmpty(),
    check('week_day').isString(),
    check('start').notEmpty(),
    check('exit').notEmpty(),
    check('id_user').notEmpty(),
    check('id_user').isNumeric(),
    noErrors
] , async (req: Request, res: Response) => {



    const schedule = new GuardSchedule(req.body)
    schedule.save();

    return res.json(schedule);

});

export default router;