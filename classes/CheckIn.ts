import CheckInModel from "../models/checkin.model";

class CheckIn {
    
    public async approve(id_checkin: number){

        const checkin = await CheckInModel.findByPk(id_checkin);

        if(checkin && checkin.confirmed_by_owner){
            checkin.update({
                check_in: true
            }, {
                where: {
                    id: checkin.id
                }
            })
            return checkin
        } 

        return false;


    }

    public async ownerConfirm(id_checkin: number){

        const checkin = await CheckInModel.findByPk(id_checkin);

        if(checkin){
            checkin.update({
                confirmed_by_owner: true
            }, {
                where: {
                    id: checkin.id
                }
            })
            return checkin
        } 

        return false;

    }
    
    public async changeStatus(id_checkin: number, newStatus: boolean){

        const checkin = await CheckInModel.findByPk(id_checkin);

        if(checkin){
            checkin.update({
                confirmed_by_owner: newStatus
            }, {
                where: {
                    id: checkin.id
                }
            })
            return checkin
        } 

        return false;

    }

    public async checkOutConfirm(id_checkin: number){

        const checkin = await CheckInModel.findByPk(id_checkin);

        if(checkin){
            checkin.update({
                check_out: true
            }, {
                where: {
                    id: checkin.id
                }
            })
            return checkin
        } 

        return false;

    }

    public async exists(id_checkin: number){

        const exists = await CheckInModel.findByPk(id_checkin);
        return exists;

    }

    public async isApproved(id_checkin: number){

        const checkin = await this.exists(id_checkin);

        if(!checkin) return false;

        if(checkin.check_in && checkin.confirmed_by_owner) return true;

        return false;

    }
    
}


export default CheckIn