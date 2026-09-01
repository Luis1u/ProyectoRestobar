import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import pool from "../config/db.js";
const router = Router();

router.get("/principal",async (req, res) => {
  


  res.render("MeseroPrincipal");

});
router.get("/nuevoPedido",async (req, res) => {
  


  res.render("MeseroNuevoPedido");

});


export default router;
