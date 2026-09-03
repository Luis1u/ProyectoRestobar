import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import pool from "../config/db.js";
const router = Router();

router.get("/principal",async (req, res) => {
  

  console.log(req.session.usuario);
  res.render("MeseroPrincipal",{usuario : req.session.usuario});

});
router.get("/nuevoPedido",async (req, res) => {
  const mesas = new Amesloc();

  const ListaMesas = await mesas.lista();

  res.render("MeseroNuevoPedido",{mesas : ListaMesas});

});


export default router;
