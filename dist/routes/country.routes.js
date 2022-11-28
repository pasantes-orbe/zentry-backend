"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Country_1 = __importDefault(require("../classes/Country"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json("hola");
});
router.post('/', (req, res) => {
    const { name, latitude, longitude, avatar } = req.body;
    const country = new Country_1.default(name, latitude, longitude);
    res.json({
        name: country.getName()
    });
});
exports.default = router;
//# sourceMappingURL=country.routes.js.map