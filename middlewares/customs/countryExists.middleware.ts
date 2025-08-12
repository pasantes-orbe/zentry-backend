import db from "../../models";

const { country } = db;

// La función debe recibir solo el valor a validar si se usa con `check().custom()`
async function countryExists(id: number){
    const exists = await country.findByPk(id);

    if(!exists){
        throw new Error(`El país con el id ${id} no existe.`);
    }

    // Si la validación pasa, no es necesario devolver nada
}

// Asegúrate de que esta línea esté presente
export default countryExists;
