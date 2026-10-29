import { Router } from "express";

import Aproduc from "../Models/aproduc.js";
import Apedpro from "../Models/apedpro.js";
import Adetped from "../Models/adetped.js";
import apedpro from "../Models/apedpro.js";
const router = Router();

router.get("/principal", async (req, res) => {
  const datosBartender = {
    nombre: req.session.usuario.nombre,
    codigo: req.session.usuario.codigo,
    apellidoPaterno: req.session.usuario.apellidoPaterno
  };
  res.render("BarPrincipal", { bartender: datosBartender });
});
router.get("/espera/bar", async (req, res) => {
  
  const pedidos = await Apedpro.pedidosBarEnEspera();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosBarCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedidoBar(pedido.pappcodped);
    

    const fecha = new Date(resCabezera.cappfecped).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });

    TodosPedidos.push({
      codigo: pedido.pappcodped,
      mesa: resCabezera.camlnummes,
      pedido: resCabezera.pappcodped,
      meseroNombre: resCabezera.capsnomper,
      meseroApellido: resCabezera.capsapepat,
      hora: resCabezera.capphorped,
      productos: productos,
      fecha: fecha,
      nroPersonas : resCabezera.cappcanper
    });
  }

  res.render("PedidosEsperaBar", { TodosPedidos: TodosPedidos });
});
router.get("/estadoAPreparacion/:idPedido", async (req, res) => {
  const idBartender = req.session.usuario.codigo;
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.actualizarAPreparacionBar(idPedido,idBartender);
  if (resultado) {
      // Respondemos que salió bien
      return res.json({ success: true,tipo : 'EN_PREPARACION' });
    } else {
      return res.json({ success: false, message: "No se pudo actualizar" });
    }
  



  
  
});
router.get("/volverAEspera/:idPedido", async (req, res) => {
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.volverAEsperaBar(idPedido);
  if (resultado) {
      return res.json({ success: true,tipo : 'R_ESPERA' });
    } else {
      return res.json({ success: false, message: "No se pudo actualizar" });
    }
  



  
  
});
router.get("/estadoPrepAListo/:idPedido", async (req, res) => {
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.actualizarAListoBar(idPedido);
  if (resultado) {
      // Respondemos que salió bien
      return res.json({ success: true,tipo : 'LISTO' });
    } else {
      return res.json({ success: false, message: "No se pudo actualizar" });
    }
  



  
  
});
router.get("/en_preparacion/bar", async (req, res) => {
  
  const pedidos = await Apedpro.pedidosBarEnPreparacion();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosBarCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedidoBar(pedido.pappcodped);
    

    const fecha = new Date(resCabezera.cappfecped).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });

    TodosPedidos.push({
      codigo: pedido.pappcodped,
      mesa: resCabezera.camlnummes,
      pedido: resCabezera.pappcodped,
      meseroNombre: resCabezera.capsnomper,
      meseroApellido: resCabezera.capsapepat,
      hora: resCabezera.capphorped,
      productos: productos,
      fecha: fecha,
      nroPersonas : resCabezera.cappcanper
    });
  }

  res.render("PedidosEnPreparacionBar", { PedidosPreparacion: TodosPedidos });
});
router.get("/listo/bar", async (req, res) => {

  
  const pedidos = await Apedpro.pedidosBarListo();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosBarCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedidoBar(pedido.pappcodped);
    

    const fecha = new Date(resCabezera.cappfecped).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });

    TodosPedidos.push({
      codigo: pedido.pappcodped,
      mesa: resCabezera.camlnummes,
      pedido: resCabezera.pappcodped,
      meseroNombre: resCabezera.capsnomper,
      meseroApellido: resCabezera.capsapepat,
      hora: resCabezera.capphorped,
      productos: productos,
      fecha: fecha,
      nroPersonas : resCabezera.cappcanper
    });
  }

  res.render("PedidosListosBar", { PedidosListos: TodosPedidos });
});
  
  


export default router;
