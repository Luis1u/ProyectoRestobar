import { Router } from "express";

import Aproduc from "../Models/aproduc.js";
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
  const pedidos = await Aproduc.pedidosBarEnEspera();

  let TodosPedidos = [];

  for (const pedido of pedidos) {
    const resCabezera = await Aproduc.datosPedidosCocCabezera(
      pedido.pappcodped
    );

    const productos = await Aproduc.itemsDelPedidoBar(pedido.pappcodped);
    

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
      bartenderNombre: resCabezera.capsnomper,
      bartenderApellido: resCabezera.capsapepat,
      hora: resCabezera.capphorped,
      productos: productos,
      fecha: fecha,
      nroPersonas : resCabezera.cappcanper
    });
  }

  res.render("PedidosEsperaBar", { TodosPedidos: TodosPedidos });
});

export default router;
