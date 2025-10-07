//classes/Guard.ts
import { Model } from "sequelize";
import db from "../models";
import { GuardInterface } from '../interfaces/guard.interface';

// Desestructuramos los modelos desde el objeto 'db'
const { user, role, guard_country, country } = db;

class Guard {

    public async getAll(){
        // CORRECCIÓN: Usar la sintaxis completa de include con el alias 'userRole'
        const guards = await user.findAll({
            // CORRECCIÓN: Referenciar el rol con el alias '$userRole.name$'
            where: {'$userRole.name$': 'vigilador'}, 
            include: [{
                model: role,
                as: 'userRole' // Se debe incluir con el alias correcto 'userRole'
            }]
        });

        return guards;
    }

    public async exists(id_user: number){
        // CORRECCIÓN: Usar la sintaxis completa de include con el alias 'userRole'
        const exists = await user.findByPk(id_user, {
            include: [{ model: role, as: 'userRole' }] 
        });

        // CORRECCIÓN: Acceder al rol usando el alias 'userRole'
        // Esto asume que el alias 'userRole' está definido en el modelo User
        if(!exists || (exists as any).userRole.name != "vigilador") return false

        return true;
    }

    public async getByCountry(id_country: number){
        // Esta función está bien, ya que solo consulta guard_country sin inclusiones complejas
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
            // CORRECCIÓN CRÍTICA: Se debe especificar el alias 'country' para la asociación
            // entre guard_country y country.
            include: [{ model: country, as: 'country' }] 
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