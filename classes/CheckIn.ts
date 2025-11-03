// classes/checkin.classes.ts
import { getModels } from "../models/getModels"; // Importamos getModels on-demand
import { Model } from "sequelize";

// Desestructuración dentro de cada método usando getModels()
class CheckIn {
    
    public async approve(id_checkin: number){
        const { checkin } = getModels();
        const checkinInstance = await checkin.findByPk(id_checkin);

        if(checkinInstance && checkinInstance.get('confirmed_by_owner')){
            await checkinInstance.update({
                check_in: true
            })
            return checkinInstance;
        } 

        return false;
    }

    public async ownerConfirm(id_checkin: number){
        const { checkin } = getModels();
        const checkinInstance = await checkin.findByPk(id_checkin);

        if(checkinInstance){
            await checkinInstance.update({
                confirmed_by_owner: true
            })
            return checkinInstance;
        } 

        return false;
    }
    
    public async changeStatus(id_checkin: number, newStatus: boolean){
        const { checkin } = getModels();
        const checkinInstance = await checkin.findByPk(id_checkin);

        if(checkinInstance){
            await checkinInstance.update({
                confirmed_by_owner: newStatus
            })
            return checkinInstance;
        } 

        return false;
    }

    public async checkOutConfirm(id_checkin: number){
        const { checkin } = getModels();
        const checkinInstance = await checkin.findByPk(id_checkin);

        if(checkinInstance){
            await checkinInstance.update({
                check_out: true
            })
            return checkinInstance;
        } 

        return false;
    }

    public async exists(id_checkin: number){
        const { checkin } = getModels();
        const exists = await checkin.findByPk(id_checkin);
        return exists;
    }

    public async isApproved(id_checkin: number){
        const { checkin } = getModels();
        const checkinInstance = await checkin.findByPk(id_checkin);

        if(!checkinInstance) return false;

        if(checkinInstance.get('check_in') && checkinInstance.get('confirmed_by_owner')) return true;

        return false;
    }
}

export default CheckIn;