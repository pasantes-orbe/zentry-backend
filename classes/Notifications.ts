// classes/Notifications.ts
import axios from "axios";
import { getModels } from "../models/getModels";
import { Op } from "sequelize";

class Notifications {
    private _app_id: string = "df4ae4bb-9ade-4eba-9d09-06da4069a8c7";
    private _Authorization: string = "Basic ZDU0YTlhYTAtZTE4ZC00OTVkLWJhZjEtOGNiM2NkZDAxMDRm";
    private _BaseUrl: string = "https://app-countries-f8d5b.web.app/";

    async notifyAExternal_User_By_ID(id: string, msg: string, heading: string, name: string) {
        try {
            const send = await axios.post(
                `https://onesignal.com/api/v1/notifications`,
                {
                    app_id: this._app_id,
                    contents: { es: msg, en: msg },
                    headings: { es: heading, en: heading },
                    name: name,
                    url: this._BaseUrl,
                    include_external_user_ids: [id],
                },
                {
                    headers: {
                        Authorization: this._Authorization,
                        "content-type": "application/json",
                    },
                }
            );

            if (send.status === 200) {
                const { notification } = getModels();
                await notification.create({
                    title: heading,
                    content: msg,
                    id_user: id,
                });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            return false;
        }
    }

    async notifyAllGuards(id_country: any, msg: string, heading: string, name: string) {
        try {
            const { guard_country, user, role, notification } = getModels();
            const guards = await guard_country.findAll({
                where: { id_country },
                include: [
                    {
                        model: user,
                        as: "user",
                        include: [role]
                    }
                ]
            });

            const guardsIDS: string[] = [];
            for (const guard of guards as any) {
                const id_user = guard.user ? String(guard.user.id) : null;
                if (id_user) {
                    guardsIDS.push(id_user);
                    await notification.create({
                        title: heading,
                        content: msg,
                        id_user,
                    });
                }
            }

            console.log("ESTE ES EL ARRAY AL CUAL SE ENVIA", guardsIDS);
            const send = await axios.post(
                `https://onesignal.com/api/v1/notifications`,
                {
                    app_id: this._app_id,
                    contents: { es: msg, en: msg },
                    headings: { es: heading, en: heading },
                    channel_for_external_user_ids: "push",
                    name: name,
                    url: this._BaseUrl,
                    include_external_user_ids: guardsIDS,
                },
                {
                    headers: {
                        Authorization: this._Authorization,
                        "content-type": "application/json",
                    },
                }
            );

            return send.status === 200;
        } catch (error) {
            console.error("Error sending notifications to all guards:", error);
            return false;
        }
    }
}

export default Notifications;
