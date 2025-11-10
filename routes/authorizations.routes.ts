// routes/authorizations.routes.ts
import { Router, Request, Response } from "express";
import { query } from "express-validator";
import AuthorizationsController from "../controller/authorizations.controller";
import noErrors from "../middlewares/noErrors.middleware";
import validateJWT from "../middlewares/jwt/validateJWT.middleware";

const router = Router();
const ctrl = new AuthorizationsController();

// GET /api/authorizations/pending-checkin?id_country=..&id_property=..&from=..&to=..
router.get(
  "/pending-checkin",
  [
    validateJWT,
    // uno de los dos filtros debería venir: id_country o id_property
    query("id_country").optional().isNumeric(),
    query("id_property").optional().isNumeric(),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    noErrors,
  ],
  (req: Request, res: Response) => ctrl.getPendingCheckin(req, res)
);

// GET /api/authorizations/recurrent-attendance?id_country=..&id_property=..&from=..&to=..
router.get(
  "/recurrent-attendance",
  [
    validateJWT,
    query("id_country").optional().isNumeric(),
    query("id_property").optional().isNumeric(),
    query("from").notEmpty().isISO8601(),
    query("to").notEmpty().isISO8601(),
    noErrors,
  ],
  (req: Request, res: Response) => ctrl.getRecurrentAttendanceSummary(req, res)
);

export default router;
