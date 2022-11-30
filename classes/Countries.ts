import CountryModel from '../models/country.model';
import Country from './Country';

class Countries {

    public async getAll(){
        try {
            
            return await CountryModel.findAll();

        } catch (error) {
            return false
        }
    }

    public async getOne(id: number): Promise<Country>{

        try {
            const c = await CountryModel.findByPk(id);

            const { name, latitude, longitude, avatar, id: countryId } = c.dataValues;

            const country = new Country(name, latitude, longitude, avatar, countryId);

            return country;

        } catch (error) {
            console.log(error);
            return new Promise((resolve, reject) => {
                reject(false)
            })
        }

    }


}

export default Countries;