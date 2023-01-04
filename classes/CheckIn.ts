import CheckInModel from "../models/checkin.model";

class CheckIn {
    
    public async approve(id_checkin: number){

        const checkin = await CheckInModel.findByPk(id_checkin);

        if(checkin){
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