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
  const resultado = await apedpro.actulizarAPreparacionBar(idPedido,idBartender);
  if(resultado){
    console.log('Se cambio es esta a preparacion del pedido')
  }
  



  
  
});
  
  
  


export default router;
