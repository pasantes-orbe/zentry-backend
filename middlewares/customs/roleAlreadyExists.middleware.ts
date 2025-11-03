// middlewares/customs/roleAlreadyExists.middleware.ts
import { getModels } from "../../models/getModels";

/** Obtiene el modelo role de forma segura (evita undefined en tiempo de carga) */
function getRoleModel() {
  const db: any = getModels() as any;
  const m: any = db.role ?? db.roles;
  if (!m) {
    console.error(
      "[roleAlreadyExists] Modelo 'role' no encontrado. Modelos cargados:",
      Object.keys(db || {})
    );
  }
  return m;
}

/**
 * Validador para express-validator:
 *  - Normaliza el nombre (trim + toLowerCase)
 *  - Falla si ya existe un rol con ese nombre
 */
const roleAlreadyExists = async (rawName: string) => {
  const role = getRoleModel();
  if (!role) {
    throw new Error("Modelo 'role' no disponible");
  }

  const name = String(rawName ?? "").trim().toLowerCase();
  if (!name) {
    throw new Error("El nombre del rol es obligatorio");
  }

  const exists = await role.findOne({ where: { name } });
  if (exists) {
    throw new Error(`El rol '${name}' ya se encuentra registrado`);
  }

  return true;
};

export default roleAlreadyExists;
