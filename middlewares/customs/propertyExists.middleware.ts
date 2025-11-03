import { getModels } from "../../models/getModels";

// La función debe recibir solo el valor a validar si se usa con `check().custom()`
async function propertyExists(id: number) {
    const { property } = getModels();

    // Usamos el modelo correcto 'property' para buscar por clave primaria
    const exists = await property.findByPk(id);

    if (!exists) {
        // Si no existe, lanzamos un error que Express Validator capturará
        throw new Error(`La propiedad con ID ${id} no existe`);
    }

    // Si existe, la validación pasa y no es necesario devolver nada
}

export default propertyExists;
