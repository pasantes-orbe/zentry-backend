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
const Country_1 = __importDefault(require("../classes/Country"));
const isAdmin_middleware_1 = __importDefault(require("../middlewares/jwt/isAdmin.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const Countries_1 = __importDefault(require("../classes/Countries"));
const Uploader_1 = __importDefault(require("../classes/Uploader"));
const router = (0, express_1.Router)();
router.get('/', [], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const countries = yield new Countries_1.default().getAll();
    res.json(countries);
}));
router.get('/:id', [
    isAdmin_middleware_1.default,
    noErrors_middleware_1.default
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const country = yield new Countries_1.default().getOne(Number(req.params.id));
    res.json(country);
}));
router.post('/', [
// isAdmin,
// noErrors
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get String Data
    const { name, latitude, longitude } = req.body;
    // Get Image from request
    const { tempFilePath } = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar;
    // Upload to cloudinary
    const { secure_url } = yield new Uploader_1.default().uploadImage(tempFilePath);
    // Save to DB
    const country = new Country_1.default(name, latitude, longitude, secure_url);
    const result = country.save();
    // Response
    if (result) {
        res.json({
            msg: "Se registró el country con éxito"
        });
    }
    else {
        res.status(500).send({
            msg: "ERROR"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=country.routes.js.map