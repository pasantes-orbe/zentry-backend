// classes/Countries.ts
import { getModels } from '../models/getModels';

class Countries {
  public async getAll() {
    try {
      const { country } = getModels();
      return await country.findAll({
        attributes: [
          'id',
          'name',
          'latitude',
          'longitude',
          'avatar',           
          'address',
          'locality',
          'phone',
          'perimeter_points',  
        ],
        raw: true,
      });
    } catch (error) {
      console.error('Error al obtener todos los countries:', error);
      return [];
    }
  }

  public async getOne(id: number) {
    try {
      const { country } = getModels();
      const row = await country.findByPk(id, {
        attributes: [
          'id',
          'name',
          'latitude',
          'longitude',
          'avatar',            
          'address',
          'locality',
          'phone',
          'perimeter_points',
        ],
        raw: true,
      });
      return row || null;
    } catch (error) {
      console.error('Error al obtener country:', error);
      return null;
    }
  }
}

export default Countries;
