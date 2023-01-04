"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/', (req, res) => {
    res.send("hola");
});
exports.default = router;
//# sourceMappingURL=checkout.routes.js.map