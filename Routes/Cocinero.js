import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import Acatpro from "../Models/acatpro.js";
import pool from "../config/db.js";
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
    console.log(productos)

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
        fecha : fecha
    });

    
  }
  
  res.render('PedidosEspera',{TodosPedidos : TodosPedidos})
  
  //http://localhost:3000/pedido/espera
});


export default router;
