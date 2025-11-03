// middlewares/customs/optionalUserExists.middleware.ts
import db from "../../models"; // Importamos el objeto 'db' centralizado

const { user } = db; // Desestructuramos el modelo 'user'

/**
 * Middleware de validación opcional para verificar si un usuario existe.
 * A diferencia de userExists.middleware.ts, este permite valores null, undefined o 0.
 * Útil para casos donde el campo id_owner es opcional (ej: check-ins sin propietario).
 */
async function optionalUserExists(id: number) {
    // Si el ID es null, undefined, 0 o falsy, permitir (no validar)
    if (!id || id === 0) {
        return true; // ✅ Permitir valores vacíos
    }
    
    // Si viene un ID, verificar que exista en la base de datos
    const exists = await user.findByPk(id);
    
    if (!exists) {
        throw new Error(`El usuario con ID ${id} no existe`);
    }
    
    return true;
}

export default optionalUserExists;
