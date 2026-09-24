import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import pool from "../config/db.js";
import amesloc from "../Models/amesloc.js";
import { cwd } from "process";
import Aususis from "../Models/aususis.js";
import bcrypt from "bcrypt";

const router = Router();

router.get("/principal", async (req, res) => {
  res.render("Principal_Administracion", { usuario: req.session.usuario });
});
export default router;
