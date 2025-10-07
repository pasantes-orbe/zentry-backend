/*12-7-25
import { Request, Response, Router } from "express";
import { check } from "express-validator";
//import Country from '../classes/Country';
import CountryModel from "../models/country.model";
import Country from "../classes/Country";
import isAdmin from "../middlewares/jwt/isAdmin.middleware";
import noErrors from "../middlewares/noErrors.middleware";
import Countries from "../classes/Countries";
import Uploader from "../classes/Uploader";

const router = Router();
router.get('/', [
], async (req: Request, res: Response) => {
    
    const countries = await new Countries().getAll();
    res.json(countries);

});

router.get('/:id', [
    noErrors
], async (req: Request, res: Response) => {
    
    const country = await new Countries().getOne( Number(req.params.id) );
    res.json(country);

});

router.post('/', [
    // isAdmin,
    // noErrors
], async (req: Request, res: Response) => {
    
    // Get String Data
    const { name, latitude, longitude} = req.body;

    //TODO: Verificar que hacer en caso de que no llegue la imagen

    // Get Image from request
    //12-7-25const { tempFilePath } = req.files?.avatar;
    if (req.files && req.files.avatar) {
    const avatarFile = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
    const tempFilePath = (avatarFile as UploadedFile).tempFilePath;
    // Usar tempFilePath acá...
}

    // Upload to cloudinary
    const { secure_url } = await new Uploader().uploadImage(tempFilePath);

    
    // Save to DB
    const country: Country = new Country(name, latitude, longitude, secure_url);
    const result = country.save();

    // Response
    if(result){
        res.json({
            msg: "Se registró el country con éxito"
        });
    } else {
        res.status(500).send({
            msg: "ERROR"
        });
    }
})
export default router;*/

// routes/country.routes.ts
// routes/country.routes.ts
import { Request, Response, Router } from "express";
import { UploadedFile } from "express-fileupload";
import Countries from "../classes/Countries";
import Country from "../classes/Country";
import Uploader from "../classes/Uploader";

const router = Router();

/**
 * GET /api/countries
 */
router.get("/", async (_req: Request, res: Response) => {
  const countries = await new Countries().getAll();
  res.json(countries);
});

/**
 * GET /api/countries/:id
 * Normaliza la respuesta y parsea perimeter_points a objeto
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const raw: any = await new Countries().getOne(id);
    if (!raw) return res.status(404).json({ msg: "Country not found" });
    return res.json(normalizeCountry(raw));
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/countries
 * Espera multipart/form-data con:
 *  - avatar: archivo (imagen)
 *  - name, latitude, longitude, address, locality, phone (text)
 *  - perimeterPoints: string JSON [{lat,lng},...]
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      name,
      latitude,
      longitude,
      address = "",
      locality = "",
      phone = "",
      perimeterPoints = "",
    } = req.body as {
      name: string;
      latitude: string | number;
      longitude: string | number;
      address?: string;
      locality?: string;
      phone?: string;
      perimeterPoints?: string;
    };

    // Validaciones mínimas
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ msg: "name, latitude y longitude son requeridos" });
    }

    // Imagen requerida
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ msg: "Imagen requerida (campo 'avatar')" });
    }

    // Normalizar archivo
    const avatarFile = Array.isArray(req.files.avatar)
      ? (req.files.avatar[0] as UploadedFile)
      : (req.files.avatar as UploadedFile);

    // Subir a Cloudinary
    const { secure_url } = await new Uploader().uploadImage(avatarFile.tempFilePath);

    // Guardar en DB (Country.save() escribe perimeter_points)
    const country = new Country(
      String(name),
      Number(latitude),
      Number(longitude),
      secure_url,
      String(address),
      String(locality),
      String(phone),
      String(perimeterPoints || "") // JSON string del perímetro
    );

    const ok = await country.save();
    if (!ok) return res.status(500).json({ msg: "No se pudo registrar el country" });

    return res.status(201).json({ msg: "Se registró el country con éxito" });
  } catch (error) {
    console.error("Error en POST /api/countries:", error);
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ---------- helpers ---------- */
function normalizeCountry(raw: any) {
  const rawPerim = raw.perimeter_points ?? raw.perimeterPoints ?? null;

  let perimeterPoints: Array<{ lat: number; lng: number }> | null = null;
  if (typeof rawPerim === "string" && rawPerim.trim() !== "") {
    try {
      perimeterPoints = JSON.parse(rawPerim);
    } catch {
      perimeterPoints = null;
    }
  } else if (Array.isArray(rawPerim)) {
    perimeterPoints = rawPerim;
  }

  return {
    id: Number(raw.id),
    name: raw.name,
    latitude: raw.latitude !== undefined ? Number(raw.latitude) : null,
    longitude: raw.longitude !== undefined ? Number(raw.longitude) : null,
    image: raw.image ?? raw.avatar ?? null,
    address: raw.address ?? "",
    locality: raw.locality ?? "",
    phone: raw.phone ?? "",
    perimeterPoints,
  };
}

export default router;
