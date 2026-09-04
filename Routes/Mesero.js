import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import Acatpro from "../Models/acatpro.js";
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
router.get("/nroPersonas/:mesa",async (req, res) => {
  const pamlcodmes = req.params.mesa;

  const mesa = new Amesloc();
  mesa.pamlcodmes = pamlcodmes;

  await mesa.obtenerDatos();
  

  res.render('FRMCantidadPersonas',{mesa : mesa})


});
router.post("/guardarNroPersonas",async (req, res) => {
  //necesito numeros de personas
  //numeor de mesa 
  //codigo del usuario

  const {cantidadPersonas,pamlcodmes} = req.body;

  const categoria = new Acatpro();
  const categorias = await categoria.lista("");

  



  //lugo consultos categorias con sus productos
  //y luego paso en un eje todos los datos necesarios

  res.render('MeseroSeleccionProductos',{categorias : categorias});
  


});


export default router;
