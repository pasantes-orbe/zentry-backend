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

import moment from "moment";
import DatesHelper from "../classes/Dates";

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
], async (req: Request, res: Response) => {

    const guards = await new Guard().getByCountry(+req.params.id_country);

    return res.json(guards);

});

/**
 * Get Guard Country
 */
router.get('/get_country/:id_user', [
    check('id_user').isNumeric(),
    check('id_user').notEmpty(),
], async (req: Request, res: Response) => {

    const country = await new Guard().getCountry(+req.params.id_user)

    return res.json(country);

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
], async (req: Request, res: Response) => {

    const guard = req.body;
    const assign = await new Guard().assignCountry(guard);
    res.json(assign);

});

/**
 * Get Schedule by Country
 */
router.get('/schedule/all/:id_country', [
    check('id_country').isNumeric(),
    check('id_country').notEmpty(),
], async (req: Request, res: Response) => {

    const guards = await GuardSchedule.findAll({
        where: {
            id_country: req.params.id_country
        }
    })

    const object = guards.map(x => {

        const guard = x;
        const now = moment();
        const start = guard.start;
        const exit = guard.exit;
        const isInHournow = now.isBetween(start, exit);

        const isWorkDay = new DatesHelper().getDay(now.day());
        console.log("ESTE ES EL DIA LABORAL", isWorkDay, "Este es si esta en horario", isInHournow);
        const isWorking = () => (isInHournow && (isWorkDay == guard.week_day)) ? true : false;

        return {
            guard,
            guard['working']: isWorking()
        }
    })


    return res.json(object);

});

// GET BY USER ID


router.get('/schedule/:id_user', [
    check('id_user').isNumeric(),
    check('id_user').notEmpty(),
], async (req: Request, res: Response) => {

    const guards = await GuardSchedule.findAll({
        where: {
            id_user: req.params.id_user
        }
    })

    const object = guards.map(x => {

        const guard = x;
        const id = x.id
        const week_day = x.week_day
        const start = x.start
        const exit = x.exit


        return {
            id,
            week_day,
            start,
            exit
        }
    })


    return res.json(object);

});

// Update Schedule By ID

router.put(`/schedule/:id`, [
    check('id').isNumeric(),
    check('id').notEmpty(),
    noErrors
], async (req: Request, res: Response) => {

    const {newStart, newExit} = req.body

    const { id } = req.params
    const schedule = await GuardSchedule.findByPk(id)

    if(!schedule){
        return res.status(404).send('No se encontró calendario')
    } else {
        const updatedSchedule = await schedule.update({
            'start': newStart,
            'exit': newExit
        })
        return res.json(updatedSchedule)
    }

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
], async (req: Request, res: Response) => {

    req.body.week_day = req.body.week_day.toLowerCase();

    const schedule = new GuardSchedule(req.body)
    schedule.save();

    return res.json(schedule);

});




export default router;