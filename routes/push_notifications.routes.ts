import { Request, Response, Router } from "express";
import { check } from "express-validator";
import AuthController from "../controller/auth.controller";
import noErrors from "../middlewares/noErrors.middleware";
import axios from 'axios';

const router = Router();

router.put('/send_to_segment/:role', async (req: Request, res: Response) => {

    const app_id = "df4ae4bb-9ade-4eba-9d09-06da4069a8c7";
    const { external_user_id } = req.body;


    try {
        const request = await axios.put(`https://onesignal.com/api/v1/apps/${app_id}/users/${external_user_id}`, {
        tags: {
            account_type: req.params.role
        }
            
    })
    console.log(request);
    return res.status(200).send({msg: "Segmento agregado", request})
 
    } catch (error) {
        console.log(error);
        return  res.send({error})
    }
    
    
    
})

export default router;