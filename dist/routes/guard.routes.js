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
    return res.json(guards);
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
    const schedule = new guard_schedule_model_1.default(req.body);
    schedule.save();
    return res.json(schedule);
}));
exports.default = router;
//# sourceMappingURL=guard.routes.js.map