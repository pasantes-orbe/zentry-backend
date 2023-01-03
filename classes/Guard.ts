import CountryModel from "../models/country.model";
import GuardCountry from "../models/guard_country.model";
import Role from "../models/roles.model";
import User from "../models/user.model";

class Guard {

    public async getAll(){
        const guards = await User.findAll({
            where: {'$role.name$': 'vigilador'},
            include: Role
        });

        return guards;
    }

    public async exists(id_user: number){
        const exists = await User.findByPk(id_user, {
            include: [Role]
        });

        if(!exists || exists.role.name != "vigilador") return false

        return true;

    }

    public async getByCountry(id_country: number){
        
        const guards = await GuardCountry.findAll({
            where: {id_country}
        });

        return guards;
    }

    public async getCountry(id_user: number){

        const country = await GuardCountry.findOne({
            where: {
                id_user
            },
            include: [CountryModel]
        })

        return country;

    }


    public async assignCountry(guard){

        try {

            if(await this.alreadyAssigned(guard)){
                return "Este vigilador ya fue asignado a este country"
            }

            const guard_to_country = new GuardCountry(guard);
            guard_to_country.save();
    
            return "Vigilador asignado con éxito al country";
            
        } catch (error) {
            return error;
        }

    }
    
    private async alreadyAssigned(guard){
        const alreadyAssigned = await GuardCountry.findOne({
            where: {
                id_user: guard.id_user,
                id_country: guard.id_country
            }
        });

        return (alreadyAssigned) ? true : false;
    }

}

export default Guard;