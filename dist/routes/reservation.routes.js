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
const amenityExists_middleware_1 = __importDefault(require("../middlewares/customs/amenityExists.middleware"));
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const reservationExists_middleware_1 = __importDefault(require("../middlewares/customs/reservationExists.middleware"));
const userExists_middleware_1 = __importDefault(require("../middlewares/customs/userExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const amenity_model_1 = __importDefault(require("../models/amenity.model"));
const reservation_model_1 = __importDefault(require("../models/reservation.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const router = (0, express_1.Router)();
/**
 * Create Reservation
 */
router.post('/', [
    (0, express_validator_1.check)('id_amenity', "El campo 'id_amenity' no puede estar vacío").notEmpty(),
    (0, express_validator_1.check)('id_amenity', "El campo 'id_amenity' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_amenity').custom(amenityExists_middleware_1.default),
    (0, express_validator_1.check)('id_user', "El campo 'id_user' no puede estar vacío").notEmpty(),
    (0, express_validator_1.check)('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_user').custom(userExists_middleware_1.default),
    (0, express_validator_1.check)('date', "El campo 'date' no puede estar vacío").notEmpty(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, details, id_user, id_amenity } = req.body;
    const reservationBody = {
        date,
        details,
        id_user,
        id_amenity,
        status: "pendiente"
    };
    const isPendient = yield reservation_model_1.default.findOne({
        where: {
            id_user,
            id_amenity,
            status: "pendiente"
        }
    });
    if (isPendient) {
        return res.json("Ya tenés una reserva pendiente de aprobación para este lugar de reserva.");
    }
    const reservation = new reservation_model_1.default(reservationBody);
    reservation.save();
    return res.json(reservation);
}));
/**
 * Get all Reservations
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    if (status) {
        const reservations = yield reservation_model_1.default.findAll({
            where: {
                status
            },
            include: amenity_model_1.default
        });
        return res.json(reservations);
    }
    const reservations = yield reservation_model_1.default.findAll();
    return res.json(reservations);
}));
/**
 * Update Status
 */
router.patch('/:id_reservation/:status', [
    (0, express_validator_1.check)('id_reservation', "El campo 'id_reservation' no puede estar vacío").notEmpty(),
    (0, express_validator_1.check)('id_reservation', "El campo 'id_reservation' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_reservation').custom(reservationExists_middleware_1.default),
    (0, express_validator_1.check)('status', "El campo 'status' no puede estar vacío").notEmpty(),
    (0, express_validator_1.check)('status', "El campo 'status' debe ser booleano").isBoolean(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let msg = "";
    let newStatus = "";
    const { status, id_reservation } = req.params;
    const st = Boolean(status);
    if (status == 'false') {
        msg = "Se cambió el estado de la reserva a 'Rechazado' ";
        newStatus = "rechazado";
    }
    if (status == 'true') {
        msg = "Se cambió el estado de la reserva a 'Aprobado' ";
        newStatus = "aprobado";
    }
    try {
        const update = reservation_model_1.default.update({ status: newStatus }, {
            where: {
                id: id_reservation
            }
        });
    }
    catch (error) {
        return res.status(500).send({
            msg: "Error interno en el servidor"
        });
    }
    return res.json(msg);
}));
/**
 * Get All Reservations By User
 */
router.get('/:id_user', [
    (0, express_validator_1.check)('id_user', "El campo 'id_user' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_user').custom(userExists_middleware_1.default)
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_user } = req.params;
    const reservations = yield reservation_model_1.default.findAll({
        where: {
            id_user
        }
    });
    return res.json(reservations);
}));
/**
 * Get All Reservations by Country
 */
router.get('/country/get_by_id/:id_country', [
    (0, express_validator_1.check)('id_country', "El campo 'id_country' debe ser numérico").isNumeric(),
    (0, express_validator_1.check)('id_country', "El campo 'id_country' es obligatorio").notEmpty(),
    (0, express_validator_1.check)('id_country').custom(countryExists_middleware_1.default)
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_country } = req.params;
    const reservations = yield reservation_model_1.default.findAll({
        include: [user_model_1.default, amenity_model_1.default]
    });
    const reservations_by_country = reservations.filter((reservation) => {
        return reservation.amenity.id_country == id_country;
    });
    return res.json(reservations_by_country);
}));
exports.default = router;
//# sourceMappingURL=reservation.routes.js.map