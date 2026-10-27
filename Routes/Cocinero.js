import { Router } from "express";
import Aproduc from "../Models/aproduc.js";
import Apedpro from "../Models/apedpro.js";
import Adetped from "../Models/adetped.js";
import apedpro from "../Models/apedpro.js";
const router = Router();

router.get("/principal",async (req, res) => {

    const datosCocinero = {
      nombre :req.session.usuario.nombre,
      codigo : req.session.usuario.codigo,
      apellidoPaterno : req.session.usuario.apellidoPaterno

    }
  res.render("CocineroPrincipal",{ cocinero : datosCocinero});

});
router.get("/productos/espera", async (req, res) => {
  const pedidos = await Apedpro.pedidosCocinaEnEspera();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosCocCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedido(pedido.pappcodped);
   

    const fecha = new Date(resCabezera.cappfecped).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });
  
    TodosPedidos.push({
        codigo : pedido.pappcodped,
        mesa : resCabezera.camlnummes,
        pedido : resCabezera.pappcodped,
        meseroNombre : resCabezera.capsnomper,
        meseroApellido : resCabezera.capsapepat,
        hora : resCabezera.capphorped,
        productos : productos,
        fecha : fecha,
        nroPersonas : resCabezera.cappcanper
    });

  }
  res.render('PedidosEspera',{TodosPedidos : TodosPedidos})
  
});
router.get("/estadoAPreparacion/:idPedido", async (req, res) => {
  const idCocinero = req.session.usuario.codigo;
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.actualizarAPreparacionCocina(idPedido,idCocinero);
  if (resultado) {
      // Respondemos que salió bien
      return res.json({ success: true,tipo : 'EN_PREPARACION' });
    } else {
      return res.json({ success: false, message: "No se pudo actualizar" });
    }

});
router.get("/volverAEspera/:idPedido", async (req, res) => {
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.volverAEsperaCocina(idPedido);
  if (resultado) {
      return res.json({ success: true,tipo : 'R_ESPERA' });
    } else {
      return res.json({ success: false, message: "No se pudo volver a espera el pedido en la parte de cocina" });
    }

});

router.get("/estadoPrepAListo/:idPedido", async (req, res) => {
  const idPedido = req.params.idPedido;
  const resultado = await apedpro.actualizarAListoCocina(idPedido);
  if (resultado) {
      // Respondemos que salió bien
      return res.json({ success: true,tipo : 'LISTO' });
    } else {
      return res.json({ success: false, message: "No se pudo actualizar" });
    }
  



  
  
});
router.get("/en_preparacion/cocina", async (req, res) => {
  
  const pedidos = await Apedpro.pedidosCocinaEnPreparacion();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosCocCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedido(pedido.pappcodped);
    

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

  res.render("PedidosEnPreparacionCoc", { PedidosPreparacion: TodosPedidos });
});
router.get("/listo/cocina", async (req, res) => {

  
  const pedidos = await Apedpro.pedidosCocinaListo();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Apedpro.datosPedidosCocCabezera(pedido.pappcodped);

    const productos = await Adetped.itemsDelPedido(pedido.pappcodped);
    

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

  res.render("PedidosListosCocina", { PedidosListos: TodosPedidos });
});


export default router;
