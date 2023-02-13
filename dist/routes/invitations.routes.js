"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invitation_controller_1 = __importDefault(require("../controller/invitation.controller"));
const router = (0, express_1.Router)();
const invitation = new invitation_controller_1.default();
router.post('/:id_reservation', invitation.create);
router.get('/:id_reservation', invitation.getInvitations);
exports.default = router;
//# sourceMappingURL=invitations.routes.js.map