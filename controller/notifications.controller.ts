import { Request, Response } from "express";
import Notifcation from "../models/notification.model";
import Role from "../models/roles.model";

class NotificationsController {

    public async getAllByIdUser(req: Request, res: Response) {
        
        const {id_user} = req.params
        console.log(id_user);
        const noti = await Notifcation.findAll({
            where: {
                id_user
            }
        })
        

        res.json(noti)
    }   


}

export default NotificationsController;