import CountryModel from '../models/country.model';

class Countries {

    public async getAll(){
        try {
            
            return await CountryModel.findAll();

        } catch (error) {
            return false
        }
    }

    public async getOne(id: number){

        try {
            
            return await CountryModel.findByPk(id);

        } catch (error) {
            
        }

    }


}

export default Countries;