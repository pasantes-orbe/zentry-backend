import db from '../models'; // Importamos el objeto 'db'
import Country from './Country';

// Desestructuramos el modelo 'country' del objeto 'db'
const { country } = db;

class Countries {
    public async getAll() {
        try {
            // Usamos el modelo 'country' corregido para la consulta
            return await country.findAll();
        } catch (error) {
            console.error("Error al obtener todos los países:", error);
            return false;
        }
    }

    public async getOne(id: number): Promise<Country | null> {
        try {
            // Usamos el modelo 'country' corregido para la consulta
            const c = await country.findByPk(id);

            if (!c) {
                // No se encontró el país con ese id
                return null;
            }

            const { name, latitude, longitude, avatar, id: countryId } = c.dataValues;
            const newCountry = new Country(name, latitude, longitude, avatar, countryId);
            return newCountry;

        } catch (error) {
            console.error("Error al obtener un país:", error);
            return Promise.reject(false);
        }
    }
}
export default Countries;
