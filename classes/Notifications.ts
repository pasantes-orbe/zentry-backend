import axios from "axios"
import GuardCountry from "../models/guard_country.model"
import Notifcation from "../models/notification.model"

class Notifications {
    private _app_id: string = "df4ae4bb-9ade-4eba-9d09-06da4069a8c7"
    private _Authorization : string = "Basic ZDU0YTlhYTAtZTE4ZC00OTVkLWJhZjEtOGNiM2NkZDAxMDRm"
    private _BaseUrl: string =  "https://app-countries-f8d5b.web.app/"

    async notifyAExternal_User_By_ID(id:string, msg: string, heading: string, name:string){

        const send = await axios.post(`https://onesignal.com/api/v1/notifications`, {
            app_id: this._app_id,
            contents: {"es": msg, "en": msg},
            headings: {"es": heading, "en": heading},
            name: name,
            url: this._BaseUrl,
            include_external_user_ids: [id]
        },
        {
            headers: {
            'Authorization': this._Authorization,
            'content-type': 'application/json'
            }
          }
        )

        if(send){
                const notification = new Notifcation({
                    title : heading,
                    content: msg,
                    id_user: id
                })
                await notification.save();

                return true

        } else {
            return false
        }

    }


    async notifyAllGuards(id_country: any, msg: string, heading: string, name:string){

        const guards = await GuardCountry.findAll({
            where: {id_country}
        });

        const guardsIDS: string[] = []

        for (let index = 0; index < guards.length; index++){
            const guard= guards[index];
            const id_user = String(guard.user.id)

            if(id_user){
                guardsIDS.push(id_user)
                const notification = new Notifcation({
                    title : heading,
                    content: msg,
                    id_user,
                })
                
                await notification.save();
            }

         }

        console.log("ESTE ES EL ARRAY AL CUAL SE ENVIA", guardsIDS);

         const send = await axios.post(`https://onesignal.com/api/v1/notifications`, {
            app_id: this._app_id,
            contents: {"es": msg, "en": msg},
            headings: {"es": heading, "en": heading},
            channel_for_external_user_ids: "push",
            name: name,
            url: this._BaseUrl,
            include_external_user_ids: guardsIDS
        },
        {
            headers: {
            'Authorization': this._Authorization,
            'content-type': 'application/json'
            }
          }
        )
        
        if(send){
            return true
        } else {
            return false
        }

      
    }

}

export default Notifications
