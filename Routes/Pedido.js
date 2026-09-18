import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import Apedpro from "../Models/apedpro.js";
import Adetped from "../Models/adetped.js";
import pool from "../config/db.js";
const router = Router();

router.post("/guardar", async (req, res) => {
  const { productos, datosMesa, total } = req.body;

  const producto2 = new Aproduc();

  //lo que llega en productos

  /* codigo: codigo,
      nombre: nombre,
      stock: stockNum,
      precio: precioNum,
      cantidadCompra: 1,
      subtotal: precioNum,
      nota: "" */

  let hayComida = false; /*  */
  let hayBebida = false;

  for (let i = 0; i < productos.length; i++) {
    if (await producto2.esBebida(productos[i].codigo)) {
      hayBebida = true;
      console.log("hay bebida");
      break;
    }
  }
  for (let i = 0; i < productos.length; i++) {
    if (await producto2.esComida(productos[i].codigo)) {
      hayComida = true;
      console.log("hay comida");
      break;
    }
  }

  const datosDeMesa = JSON.parse(datosMesa);

  const correlativo = new Xnumcor();
  const pedido = new Apedpro();
  const codigo = req.session.usuario.codigo;
  pedido.cappcanper = datosDeMesa.nroPersonas;
  pedido.fappcodmes = datosDeMesa.codMesa;
  pedido.capptipped = "LOCAL";
  pedido.capptotpag = total;
  pedido.fappcodusu = codigo;

  if (!hayComida) {
    pedido.cappestcoc = "";
  }
  if (!hayBebida) {
    pedido.cappestbar = "";
  }

  //recivol los datos que me enviaron atravez del formulario
  correlativo.pxnctipcor = "apedpro";

  if (await correlativo.obtenerSiguiente()) {
    pedido.pappcodped = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  const detalle = new Adetped();

  if (await pedido.grabar()) {
    for (const item of productos) {
      correlativo.pxnctipcor = "adetped";

      if (await correlativo.obtenerSiguiente()) {
        detalle.padpcoddet = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
      }

      detalle.cadpnotdet = item.nota;
      detalle.cadpcandet = item.cantidadCompra;
      detalle.fadpcodpro = item.codigo;
      detalle.fadpcodped = pedido.pappcodped;

      if (await detalle.grabar()) {
        console.log("detalle guardado exitosamente");
        await producto2.disminuirStock(item.codigo, item.cantidadCompra);
      } else {
        console.log("algo sali mal en detalle grabar");
      }
    }
  }

  console.log(pedido);
});

router.get("/espera", (req, res) => {
  //CONSULTA
  /* select producto.capdnompro, detalle.cadpcandet , detalle.cadpnotdet from apedpro pedido, adetped detalle,aproduc producto, 
acatpro categoria where pedido.pappcodped = detalle.fadpcodped and detalle.fadpcodpro = 
producto.papdcodpro and producto.fapdcodcat = categoria.pacpcodcat and categoria.cacptipcat  = 'COMIDA'
 */
});
export default router;
