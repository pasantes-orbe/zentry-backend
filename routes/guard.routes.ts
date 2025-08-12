import { Request, Response, Router } from "express";
import { check } from "express-validator";
import Guard from "../classes/Guard";
import UserClass from "../classes/UserClass";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isGuard from "../middlewares/customs/isGuard.middleware";
import userExists from "../middlewares/customs/userExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";

// Importamos el objeto 'db' para acceder a todos los modelos inicializados
import db from "../models";
import moment from "moment";
import DatesHelper from "../classes/Dates";

const router = Router();
// Desestructuramos los modelos desde el objeto 'db'
const { guard_schedule, user } = db;

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
    // Usamos el modelo inicializado 'guard_schedule'
    const guards = await guard_schedule.findAll({
        where: {
            id_country: req.params.id_country
        },
        // Usamos el modelo inicializado 'user'
        include: [{ model: user, as: 'user' }] // incluimos la relación con alias
    });

    const now = moment();
    const isWorkDay = new DatesHelper().getDay(now.day());

    const object = guards.map((guard: any) => {
        const start = guard.start;
        const exit = guard.exit;
        const week_day = guard.week_day;
        const isInHournow = now.isBetween(start, exit);
        const isWorking = isInHournow && isWorkDay === week_day;
        return {
            guard,
            working: isWorking
        };
    });

    return res.json(object);
});

// GET BY USER ID
router.get('/schedule/:id_user', [
    check('id_user').isNumeric(),
    check('id_user').notEmpty(),
], async (req: Request, res: Response) => {
    // Usamos el modelo inicializado 'guard_schedule'
    const guards = await guard_schedule.findAll({
        where: {
            id_user: req.params.id_user
        },
    })
    console.log(guards);
    const object = guards.map((x: any) => {
        const guard = x;
        const id = x.id
        const week_day = x.week_day
        const start = x.start
        const exit = x.exit
        const format_start = moment.utc(start).format();
        const format_exit = moment.utc(exit).format();
        return {
            id,
            week_day,
            start: start,
            exit: exit
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
    const { newStart, newExit, week_day } = req.body
    console.log(newStart);
    console.log(newExit);
    console.log(week_day)
    const { id } = req.params
    // Usamos el modelo inicializado 'guard_schedule'
    const schedule = await guard_schedule.findByPk(id)
    if (!schedule) {
        return res.status(404).send('No se encontró calendario')
    } else {
        const updatedSchedule = await schedule.update({
            'start': newStart,
            'exit': newExit,
            week_day
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

    try {
        // Usamos el modelo inicializado 'guard_schedule'
        const schedule = await guard_schedule.create(req.body); // ✅ Usar .create()
        return res.json(schedule);
    } catch (error) {
        console.error("Error al crear horario:", error);
        return res.status(500).json({ message: "Error al asignar horario" });
    }
});

export default router;
