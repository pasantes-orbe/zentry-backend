import { Router } from "express";
const router = Router();



router.get('/', (req, res) => {
    return res.json("role Router")
});



export default router;