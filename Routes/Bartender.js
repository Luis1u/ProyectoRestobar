import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import Acatpro from "../Models/acatpro.js";
import pool from "../config/db.js";
const router = Router();

router.get("/principal",async (req, res) => {

    const datosBartender = {
      nombre : req.session.usuario.nombre,
      codigo : req.session.usuario.codigo,
      apellidoPaterno : req.session.usuario.apellidoPaterno

    }

  

 
  res.render("BarPrincipal",{ bartender : datosBartender});

});



export default router;
