// config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// ✅ Caso A: si existe CLOUDINARY_URL, el SDK se auto-configura solo.
//    NO llamamos cloudinary.config({}) porque resetea la config.
if (process.env.CLOUDINARY_URL) {
  // opcional: forzar conexiones seguras sin pisar credenciales
  cloudinary.config({ secure: true });
}
// ✅ Caso B: si NO hay CLOUDINARY_URL pero sí las 3 vars explícitas, configuramos manualmente.
else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
// ❗ Caso C: faltan credenciales
else {
  console.warn('[cloudinary] No se encontraron credenciales en .env (CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)');
}

// Helpers útiles
export function getCloudName(): string | undefined {
  return cloudinary.config().cloud_name || undefined;
}

export function isCloudinaryConfigured(): boolean {
  const cfg = cloudinary.config();
  return Boolean(cfg.cloud_name && cfg.api_key);
}

export default cloudinary;
