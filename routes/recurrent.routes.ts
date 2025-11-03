// routes/recurrent.routes.ts
import { Router, Request, Response } from "express";
import { check } from "express-validator";
import RecurrentController from "../controller/recurrent.controller";
import propertyExists from "../middlewares/customs/propertyExists.middleware";
import recurrentExists from "../middlewares/customs/recurrentExists.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import { getModels } from "../models/getModels";

const router = Router();
// Usar un nombre claro para la instancia del controlador
const recurrentController = new RecurrentController();

// ---------- GET específicas primero ----------
router.get("/", (req: Request, res: Response) => recurrentController.getAll(req, res));

router.get(
  "/get-by-country/:id_country",
  [
    check("id_country").notEmpty(),
    check("id_country").isNumeric(),
    noErrors,
  ],
  (req: Request, res: Response) => recurrentController.getByCountry(req, res)
);

router.get(
  "/get-by-property/:id_property",
  [
    check("id_property").notEmpty(),
    check("id_property").isNumeric(),
    noErrors,
  ],
  (req: Request, res: Response) => recurrentController.getByProperty(req, res)
);

// Endpoint nuevo para Owner (preferido con guion medio)
router.get(
  "/get-by-owner/:id_owner",
  [check("id_owner").notEmpty(), check("id_owner").isNumeric(), noErrors],
  (req: Request, res: Response) => recurrentController.getByOwner(req, res)
);

// (Opcional) Alias con guion bajo por compatibilidad temporal con el front
router.get(
  "/get_by_owner/:id_owner",
  [check("id_owner").notEmpty(), check("id_owner").isNumeric(), noErrors],
  (req: Request, res: Response) => recurrentController.getByOwner(req, res)
);

// ---------- GET genérica AL FINAL ----------
router.get("/:id", (req: Request, res: Response) => recurrentController.getByID(req, res));

// ---------- POST ----------
router.post(
  "/",
  [
    check("id_property", "El id de propiedad es obligatorio").notEmpty(),
    check("id_property", "El id de propiedad debe ser numerico").isNumeric(),
    check("guest_name", "El nombre del invitado es obligatorio").notEmpty(),
    check("guest_lastname", "El apellido del invitado es obligatorio").notEmpty(),
    check("dni", "El dni del invitado es obligatorio").notEmpty(),
    // NUEVA VALIDACIÓN: Campo Rol
    check("roleRecurrent", "El rol del invitado es obligatorio").notEmpty(),
    // NUEVA VALIDACIÓN: Días de Acceso
    check("access_days", "Los días de acceso son obligatorios").notEmpty(),
    check("id_property").custom(propertyExists),
    noErrors,
  ],
  (req: Request, res: Response) => recurrentController.create(req, res)
);

// ---------- PATCH ----------
router.patch(
  "/:id_recurrent",
  [
    check("id_recurrent", "El id de recurrente debe ser numerico").isNumeric(),
    check("id_recurrent").custom(recurrentExists),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const { recurrent, property } = getModels() as any;
    const recurrentID = Number(req.params.id_recurrent);
    if (isNaN(recurrentID)) {
      return res.status(400).json({ msg: "ID de recurrente inválido" });
    }

    const {
      id_property,
      guest_name,
      guest_lastname,
      dni,
      roleRecurrent,
      access_days,
      status,
    } = (req.body || {}) as any;

    try {
      const rec = await recurrent.findByPk(recurrentID);
      if (!rec) return res.status(404).json({ msg: `No existe el invitado recurrente con el id ${recurrentID}` });

      const updateData: any = {};
      if (guest_name !== undefined) updateData.guest_name = String(guest_name).trim();
      if (guest_lastname !== undefined) updateData.guest_lastname = String(guest_lastname).trim();
      if (dni !== undefined) updateData.dni = String(dni).trim();
      if (roleRecurrent !== undefined) updateData.roleRecurrent = roleRecurrent;
      if (access_days !== undefined) updateData.access_days = access_days;
      if (status !== undefined) updateData.status = !!status;

      if (id_property !== undefined) {
        const idPropNum = Number(id_property);
        if (isNaN(idPropNum)) return res.status(400).json({ msg: "id_property debe ser numérico" });
        const prop = await property.findByPk(idPropNum);
        if (!prop) return res.status(400).json({ msg: "La propiedad indicada no existe" });
        updateData.id_property = idPropNum;
        if ((prop as any).id_country) updateData.id_country = (prop as any).id_country;
      }

      await rec.update(updateData);
      const refreshed = await recurrent.findByPk(recurrentID, { include: [{ model: property, as: "property" }] });
      return res.status(200).json({ msg: "Recurrente actualizado correctamente", recurrent: refreshed });
    } catch (error) {
      console.error("Error al actualizar recurrente:", error);
      return res.status(500).json({ msg: "Error al actualizar el invitado recurrente", error });
    }
  }
);

// ---------- DELETE (hard delete, opcional) ----------
router.delete(
  "/:id_recurrent",
  [
    check("id_recurrent", "El id de recurrente debe ser numerico").isNumeric(),
    check("id_recurrent").custom(recurrentExists),
    noErrors,
  ],
  (req: Request, res: Response) => recurrentController.delete(req, res)
);

export default router;
