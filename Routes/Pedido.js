import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import Apedpro from "../Models/apedpro.js";
import pool from "../config/db.js";
const router = Router();

router.post("/guardar", async (req, res) => {
  const { productos, datosMesa, total } = req.body;
  const datosDeMesa = JSON.parse(datosMesa);

  const correlativo = new Xnumcor();
  const pedido = new Apedpro();
const codigo = req.session.usuario.codigo;
  pedido.cappcanper = datosDeMesa.nroPersonas;
  pedido.fappcodmes = datosDeMesa.codMesa;
  pedido.capptipped = "LOCAL";
  pedido.capptotpag = total;
  pedido.fappcodusu = codigo;

  //recivol los datos que me enviaron atravez del formulario
  correlativo.pxnctipcor = "apedpro";

  if (await correlativo.obtenerSiguiente()) {
    pedido.pappcodped = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }
  await pedido.grabar();

  console.log(pedido);
});
export default router;
