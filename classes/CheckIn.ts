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
    
}


export default CheckIn