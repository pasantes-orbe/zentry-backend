// Importamos los tipos necesarios desde Sequelize
import { Model } from "sequelize";
import db from "../models";
import { GuardInterface } from '../interfaces/guard.interface';

// Desestructuramos los modelos desde el objeto 'db'
const { user, role, guard_country, country } = db;

class Guard {

    public async getAll(){
        const guards = await user.findAll({
            where: {'$role.name$': 'vigilador'},
            include: role
        });

        return guards;
    }

    public async exists(id_user: number){
        const exists = await user.findByPk(id_user, {
            include: [role]
        });

        if(!exists || (exists as any).role.name != "vigilador") return false

        return true;
    }

    public async getByCountry(id_country: number){
        const guards = await guard_country.findAll({
            where: {id_country}
        });

        return guards;
    }

    public async getCountry(id_user: number){
        // Renombramos la variable local a 'foundCountry' para evitar colisiones
        const foundCountry = await guard_country.findOne({
            where: {
                id_user
            },
            include: [country] // Ahora TypeScript sabe que nos referimos al modelo 'country'
        })

        return foundCountry;
    }

    public async assignCountry(guard: GuardInterface) {
        try {
            if (await this.alreadyAssigned(guard)) {
                return "Este vigilador ya fue asignado a este country";
            }
            
            await guard_country.create({
                id_user: guard.id_user,
                id_country: guard.id_country
            });
            
            return "Vigilador asignado con éxito al country";
        } catch (error) {
            console.error(error);
            return "Error al asignar el vigilador.";
        }
    }

    private async alreadyAssigned(guard: GuardInterface){
        const alreadyAssigned = await guard_country.findOne({
            where: {
                id_user: guard.id_user,
                id_country: guard.id_country
            }
        });

        return (alreadyAssigned) ? true : false;
    }
}

export default Guard;