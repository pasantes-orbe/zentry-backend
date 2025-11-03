import { getModels } from "../../models/getModels";

// Corregimos la función para que funcione como un validador de Express Validator
const emailAlreadyExistsValidator = async (email: string) => {
    const { user } = getModels();
    // Usamos el modelo 'user' del objeto 'db'
    const exists = await user.findOne({
        where: { email }
    });

    if (exists) {
        // Si el email ya existe, lanzamos un error que Express Validator capturará
        throw new Error(`El email ${email} ya se encuentra registrado`);
    }

    // Si no existe, la validación pasa
    return true;
}

export default emailAlreadyExistsValidator;

