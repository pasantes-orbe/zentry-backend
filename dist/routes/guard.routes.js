"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Guard_1 = __importDefault(require("../classes/Guard"));
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const isGuard_middleware_1 = __importDefault(require("../middlewares/customs/isGuard.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const guard_schedule_model_1 = __importDefault(require("../models/guard_schedule.model"));
const moment_1 = __importDefault(require("moment"));
const Dates_1 = __importDefault(require("../classes/Dates"));
const router = (0, express_1.Router)();
/**
 * Get All
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guards = yield new Guard_1.default().getAll();
    return res.json(guards);
}));
/**
 * Get All By Country
 */
router.get('/get_by_country/:id_country', [
    (0, express_validator_1.check)('id_country').isNumeric(),
    (0, express_validator_1.check)('id_country').notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guards = yield new Guard_1.default().getByCountry(+req.params.id_country);
    return res.json(guards);
}));
/**
 * Get Guard Country
 */
router.get('/get_country/:id_user', [
    (0, express_validator_1.check)('id_user').isNumeric(),
    (0, express_validator_1.check)('id_user').notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const country = yield new Guard_1.default().getCountry(+req.params.id_user);
    return res.json(country);
}));
/**
 * Assign Country
 */
router.post('/assign', [
    (0, express_validator_1.check)('id_user').notEmpty(),
    (0, express_validator_1.check)('id_user').isNumeric(),
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('id_country').isNumeric(),
    (0, express_validator_1.check)('id_country').custom(countryExists_middleware_1.default),
    (0, express_validator_1.check)('id_user').custom(isGuard_middleware_1.default),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guard = req.body;
    const assign = yield new Guard_1.default().assignCountry(guard);
    res.json(assign);
}));
/**
 * Get Schedule by Country
 */
router.get('/schedule/all/:id_country', [
    (0, express_validator_1.check)('id_country').isNumeric(),
    (0, express_validator_1.check)('id_country').notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guards = yield guard_schedule_model_1.default.findAll({
        where: {
            id_country: req.params.id_country
        }
    });
    const object = guards.map(x => {
        const guard = x;
        const now = (0, moment_1.default)();
        const start = guard.start;
        const exit = guard.exit;
        const isInHournow = now.isBetween(start, exit);
        const isWorkDay = new Dates_1.default().getDay(now.day());
        console.log("ESTE ES EL DIA LABORAL", isWorkDay, "Este es si esta en horario", isInHournow);
        const isWorking = () => (isInHournow && (isWorkDay == guard.week_day)) ? true : false;
        console.log("GUARDIA", guard.user.id);
        console.log("NOw", now);
        console.log("start", start);
        console.log("exit", exit);
        console.log("@", isWorkDay == guard.week_day);
        console.log("@@", isWorkDay);
        console.log("@@@", guard.week_day);
        return {
            guard,
            guard, ['working']: isWorking()
        };
    });
    return res.json(object);
}));
// GET BY USER ID
router.get('/schedule/:id_user', [
    (0, express_validator_1.check)('id_user').isNumeric(),
    (0, express_validator_1.check)('id_user').notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guards = yield guard_schedule_model_1.default.findAll({
        where: {
            id_user: req.params.id_user
        },
    });
    console.log(guards);
    const object = guards.map((x) => {
        const guard = x;
        const id = x.id;
        const week_day = x.week_day;
        const start = x.start;
        const exit = x.exit;
        const format_start = moment_1.default.utc(start).format();
        const format_exit = moment_1.default.utc(exit).format();
        return {
            id,
            week_day,
            start: start,
            exit: exit
        };
    });
    return res.json(object);
}));
// Update Schedule By ID
router.put(`/schedule/:id`, [
    (0, express_validator_1.check)('id').isNumeric(),
    (0, express_validator_1.check)('id').notEmpty(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newStart, newExit } = req.body;
    console.log(newStart);
    console.log(newExit);
    const { id } = req.params;
    const schedule = yield guard_schedule_model_1.default.findByPk(id);
    if (!schedule) {
        return res.status(404).send('No se encontró calendario');
    }
    else {
        const updatedSchedule = yield schedule.update({
            'start': newStart,
            'exit': newExit
        });
        return res.json(updatedSchedule);
    }
}));
/**
 * Assign Schedule
 */
router.post('/schedule', [
    (0, express_validator_1.check)('id_country').isNumeric(),
    (0, express_validator_1.check)('id_country').notEmpty(),
    (0, express_validator_1.check)('week_day').notEmpty(),
    (0, express_validator_1.check)('week_day').isString(),
    (0, express_validator_1.check)('start').notEmpty(),
    (0, express_validator_1.check)('exit').notEmpty(),
    (0, express_validator_1.check)('id_user').notEmpty(),
    (0, express_validator_1.check)('id_user').isNumeric(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.week_day = req.body.week_day.toLowerCase();
    const schedule = new guard_schedule_model_1.default(req.body);
    schedule.save();
    return res.json(schedule);
}));
exports.default = router;
//# sourceMappingURL=guard.routes.js.map