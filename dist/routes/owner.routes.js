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
const UserClass_1 = __importDefault(require("../classes/UserClass"));
const propertyExists_middleware_1 = __importDefault(require("../middlewares/customs/propertyExists.middleware"));
const userExists_middleware_1 = __importDefault(require("../middlewares/customs/userExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const user_properties_model_1 = __importDefault(require("../models/user_properties.model"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield user_properties_model_1.default.findAll();
    return res.json(keys);
}));
/**
 * Get Property by Owner ID
 */
router.get('/:id_owner', [
    (0, express_validator_1.check)('id_owner').custom(userExists_middleware_1.default),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const property = yield user_properties_model_1.default.findOne({
        where: {
            id_user: req.params.id_owner
        }
    });
    return res.json(property);
}));
/**
 * Get Owners By Property ID
 */
router.get('/:id_property', [
    (0, express_validator_1.check)('id_property').isNumeric(),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO:
    // const keys = await UserProperties.findAll({
    //     where: {
    //         id
    //     }
    // })
}));
router.post('/', [
    (0, express_validator_1.check)('id_user', "Id de usuario obligatorio").notEmpty(),
    (0, express_validator_1.check)('id_user', "El id de usuario debe ser numerico").isNumeric(),
    (0, express_validator_1.check)('id_user').custom(userExists_middleware_1.default),
    (0, express_validator_1.check)('id_property', "Id de propiedad obligatorio").notEmpty(),
    (0, express_validator_1.check)('id_property', "El id de propiedad debe ser numerico").isNumeric(),
    (0, express_validator_1.check)('id_property').custom(propertyExists_middleware_1.default),
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isOwnerRole = yield new UserClass_1.default().is("propietario", +req.body.id_user);
    const key = new user_properties_model_1.default(req.body);
    key.save();
    return res.json(key);
}));
exports.default = router;
//# sourceMappingURL=owner.routes.js.map