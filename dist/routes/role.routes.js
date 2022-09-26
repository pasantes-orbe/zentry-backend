"use strict";
<<<<<<< HEAD
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    return res.json("role Router");
});
=======
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const role_controller_1 = __importDefault(require("../controller/role.controller"));
const roleAlreadyExists_middleware_1 = __importDefault(require("../middlewares/customs/roleAlreadyExists.middleware"));
const noErrors_middleware_1 = __importDefault(require("../middlewares/noErrors.middleware"));
const router = (0, express_1.Router)();
const role = new role_controller_1.default();
//TODO: ADMIN only
router.get('/', role.getAll);
//TODO: ADMIN only
router.get('/:id', role.getByID);
//TODO: ADMIN only
router.post('/', [
    (0, express_validator_1.check)('name', 'El nombre de rol es obligatorio').notEmpty(),
    (0, express_validator_1.check)('name').custom(roleAlreadyExists_middleware_1.default),
    noErrors_middleware_1.default
], role.create);
>>>>>>> eb20a8dd88e987cfaa6b9827a6e66fcab6e18a90
exports.default = router;
//# sourceMappingURL=role.routes.js.map