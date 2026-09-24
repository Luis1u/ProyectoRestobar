import { Router } from "express";

import Aproduc from "../Models/aproduc.js";
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
  const pedidos = await Aproduc.pedidosCocinaEnEspera();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Aproduc.datosPedidosCocCabezera(pedido.pappcodped);

    const productos = await Aproduc.itemsDelPedido(pedido.pappcodped);
   

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


export default router;
