"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const antipanic_controller_1 = __importDefault(require("../controller/antipanic.controller"));
const router = (0, express_1.Router)();
const antipanicController = new antipanic_controller_1.default();
// Get All By Country ID
router.get('/:id_country', antipanicController.getAllByCountry);
// New Antipanic from owner
router.post('/', antipanicController.newAntipanic);
// Update Antipanic from guard
router.put('/:id', antipanicController.guardConfirm);
//Desactivate Antipanic
router.patch('/:id', antipanicController.desactivateAntipanic);
exports.default = router;
//# sourceMappingURL=antipanic.routes.js.map