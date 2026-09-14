import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import pool from "../config/db.js";
const router = Router();

router.post('/guardar', async (req, res) => {
    
   const {productos,datosMesa} = req.body;
   console.log(productos)
   console.log(datosMesa);
   
   
});
export default router;