import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import pool from "../config/db.js";
import amesloc from "../Models/amesloc.js";

const router = Router();

router.get("/lista", async (req, res) => {
  //CONSULTA LAS PERSONAS A A LAA BSE DE DATOS
  const mesa1 = new Amesloc();

  const mesas = await mesa1.lista();

  res.render("MesaLista", { mesas: mesas });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS
});
router.get("/nuevo", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "FRMNuevamesa.html"));
});
router.post("/nuevo/mesa", async (req, res) => {
  const correlativo = new Xnumcor();

  const mesa = new Amesloc();
  const { camlnummes, camlestmes, camlactmes, camlcapmes, camldesmes } =
    req.body;

  mesa.camlnummes = camlnummes;
  mesa.camlestmes = camlestmes;
  if (camlactmes == "true") {
    mesa.camlactmes = true;
  } else {
    mesa.camlactmes = false;
  }
  mesa.camlcapmes = camlcapmes;
  mesa.camldesmes = camldesmes;

  correlativo.pxnctipcor = "amesloc";

  if (await correlativo.obtenerSiguiente()) {
    mesa.pamlcodmes = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await mesa.grabar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "mesa guardada correctamente",
    });
  }
});
router.get("/ver/:id", async (req, res) => {
  const pamlcodmes = req.params.id;

  const mesa = new Amesloc();
  mesa.pamlcodmes = pamlcodmes;

  await mesa.obtenerDatos();

  if (mesa.pamlactmes == true) {
    mesa.pamlactmes = "ACTIVO";
  } else {
    mesa.pamlactmes = "INACTIVO";
  }

  res.render("MesaMostrar", { mesa: mesa });
});
router.get("/prepMod/:id", async (req, res) => {
  const pamlcodmes = req.params.id;

  const mesa = new Amesloc();
  mesa.pamlcodmes = pamlcodmes;
  await mesa.obtenerDatos();

  res.render("FRMMesaMod", { mesa: mesa });
});
router.post("/modificar/:id", async (req, res) => {
  const pamlcodmes = req.params.id;
  const mesa = new Amesloc();
  const { camlnummes, camlestmes, camlactmes, camlcapmes, camldesmes } =
    req.body;
 
  mesa.pamlcodmes = pamlcodmes;
  mesa.camlnummes = camlnummes;
  mesa.camlestmes = camlestmes;
  if (camlactmes == "true") {
    mesa.camlactmes = true;
  } else {
    mesa.camlactmes = false;
  }
  mesa.camlcapmes = camlcapmes;
  mesa.camldesmes = camldesmes;

  

  if (await mesa.modificar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "mesa guardada correctamente",
    });
  }
});
router.get('/eliminar/:id', async (req, res) =>{

 const pamlcodmes  = req.params.id;

    const mesa = new Amesloc();

  mesa.pamlcodmes = pamlcodmes;

  if (await mesa.eliminar()){

   res.redirect('/mesa/lista');
  }

 });
router.get('/darAlta/:id', async (req, res) =>{

  const pamlcodmes  = req.params.id;

    const mesa = new Amesloc();

 mesa.pamlcodmes = pamlcodmes;

  if (await mesa.darAlta()){

   res.redirect('/mesa/lista');
  }

});
export default router;
