// routes/amenity.routes.ts
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { Model, ModelStatic } from "sequelize";
import Amenity from "../classes/Amenity";
import Countries from "../classes/Countries";
import Uploader from "../classes/Uploader";
import amenityExists from "../middlewares/customs/amenityExists.middleware";
import countryExists from "../middlewares/customs/countryExists.middleware";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import db from "../models";

// ---- helpers de acceso seguros ----
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);

// ---- modelo (tipado laxo para TS) ----
const AmenityModel = db.amenity as unknown as ModelStatic<Model<any, any>>;

const router = Router();

// Obtener todos los amenities
router.get("/", async (_req: Request, res: Response) => {
  const amenities = await AmenityModel.findAll();
  res.json(amenities);
});

// Obtener amenities por país
router.get(
  "/country/:id_country",
  [
    check("id_country", "El id_country de country no puede estar vacío").notEmpty(),
    check("id_country", "El id de country debe ser numérico").isNumeric(),
    check("id_country").custom(countryExists),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const amenities = await AmenityModel.findAll({
      where: { id_country: req.params.id_country },
    });
    res.json(amenities);
  }
);

// Obtener amenity por país e id
router.get(
  "/country/:id_country/:id",
  [
    check("id_country", "El id_country de country no puede estar vacío").notEmpty(),
    check("id_country", "El id de country debe ser numérico").isNumeric(),
    check("id_country").custom(countryExists),
    check("id", "El id de amenity no puede estar vacío").notEmpty(),
    check("id", "El id de amenity debe ser numérico").isNumeric(),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const foundAmenity = await AmenityModel.findOne({
      where: {
        id: req.params.id,
        id_country: req.params.id_country,
      },
    });
    res.json(foundAmenity);
  }
);

// Obtener amenity por id
router.get(
  "/:id",
  [
    check("id", "El id de amenity no puede estar vacío").notEmpty(),
    check("id", "El id de amenity debe ser numérico").isNumeric(),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const foundAmenity = await AmenityModel.findByPk(req.params.id);
    res.json(foundAmenity);
  }
);

// Crear amenity
router.post(
  "/country/:id",
  [
    check("id").notEmpty(),
    check("id", "Proporciona un ID de Country numérico").isNumeric(),
    check("id").custom(countryExists),
    check("name", "Nombre del lugar de reserva obligatorio").notEmpty(),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const countryInstance = await new Countries().getOne(+req.params.id);
    if (!countryInstance) {
      return res.status(404).json({ msg: "El Country no existe" });
    }

    const { name, address } = req.body;

    const avatarFile = (req as any).files?.avatar;
    if (!avatarFile) {
      return res.status(400).json({ msg: "No se recibió archivo de imagen" });
    }

    const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;

    if (!file.tempFilePath) {
      return res.status(400).json({ msg: "Archivo inválido o sin tempFilePath" });
    }

    const { secure_url } = await new Uploader().uploadImage(file.tempFilePath);

    // Amenity (clase de dominio) espera un Country/POJO, no un Model de Sequelize:
    const countryPlain = (countryInstance as any)?.toJSON?.() ?? countryInstance;
    const newAmenity: Amenity = new Amenity(
      countryPlain as any,
      name,
      secure_url,
      address
    );

    const amenitySaved = await newAmenity.save();

    res.json({
      msg: "Amenity agregado con éxito!",
      amenitySaved,
    });
  }
);

// Eliminar amenity
router.delete(
  "/:id",
  [isAdmin, check("id").custom(amenityExists), noErrors],
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await AmenityModel.destroy({ where: { id } });
      return res.json({ msg: "Eliminado correctamente" });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

// Editar amenity
router.patch(
  "/:id",
  [
    isAdmin,
    check("id", "El ID del amenity no puede estar vacío").notEmpty(),
    check("id", "El ID del amenity debe ser numérico").isNumeric(),
    check("id").custom(amenityExists),
    check("name", "El nombre no puede estar vacío").optional().notEmpty(),
    noErrors,
  ],
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, address } = req.body;

    try {
      const amenityToUpdate = await AmenityModel.findByPk(id);

      if (!amenityToUpdate) {
        return res.status(404).json({ msg: "Amenity no encontrado" });
      }

      let newImageUrl: string | undefined;

      // Imagen (avatar)
      const avatarFile = (req as any).files?.avatar;
      if (avatarFile) {
        const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;
        if (file.tempFilePath) {
          const { secure_url } = await new Uploader().uploadImage(file.tempFilePath);
          newImageUrl = secure_url;
        }
      }

      const updateData: Record<string, any> = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (newImageUrl) updateData.image = newImageUrl;

      await amenityToUpdate.update(updateData);

      return res.json({
        msg: "Amenity actualizado correctamente",
        amenity: amenityToUpdate,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ msg: "Error interno al actualizar el amenity", error });
    }
  }
);

export default router;


