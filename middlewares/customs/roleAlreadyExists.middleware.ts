import db from "../../models";

// Desestructuramos el modelo 'role' de la base de datos
const { role } = db;

// Adaptamos la función para que funcione como un validador de Express Validator
const roleAlreadyExists = async (name: string) => {
    // Buscamos el rol usando el modelo correcto
    const exists = await role.findOne({
        where: { name }
    });
    
    // Si el rol ya existe, lanzamos un error que Express Validator capturará
    if (exists) {
        throw new Error(`El rol ${name} ya se encuentra registrado`);
    }

    // Si no existe, la validación pasa
    return true;
}

export default roleAlreadyExists;