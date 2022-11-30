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
const Amenity_1 = __importDefault(require("../classes/Amenity"));
const Countries_1 = __importDefault(require("../classes/Countries"));
const Uploader_1 = __importDefault(require("../classes/Uploader"));
const countryExists_middleware_1 = __importDefault(require("../middlewares/customs/countryExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json("Obtener todos los Amenities");
});
/**
 * Add New Amenity
 */
router.post('/:id', [
    (0, express_validator_1.check)('id').notEmpty(),
    (0, express_validator_1.check)('id', "Proporciona un ID de Country numérico").isNumeric(),
    (0, express_validator_1.check)('id').custom(countryExists_middleware_1.default),
    (0, express_validator_1.check)('name', "Nombre del lugar de reserva obligatorio").notEmpty(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const country = yield new Countries_1.default().getOne(+req.params.id);
    const { name, address } = req.body;
    //TODO: Verificar que hacer en caso de que no llegue la imagen
    const { tempFilePath } = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar;
    const { secure_url } = yield new Uploader_1.default().uploadImage(tempFilePath);
    const amenity = new Amenity_1.default(country, name, secure_url, address);
    const amenitySaved = yield amenity.save();
    res.json({
        msg: "Amenity agregado con éxito!",
        amenitySaved
    });
}));
exports.default = router;
//# sourceMappingURL=amenity.routes.js.map