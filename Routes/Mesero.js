import { Router } from "express";

import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import Acatpro from "../Models/acatpro.js";

import Aproduc from "../Models/aproduc.js";
import Apedpro from "../Models/apedpro.js";
import Adetped from "../Models/adetped.js";
import amesloc from "../Models/amesloc.js";
const router = Router();

router.get("/principal", async (req, res) => {
  res.render("MeseroPrincipal", { usuario: req.session.usuario });
});
router.get("/nuevoPedido", async (req, res) => {
  const mesas = new Amesloc();

  const ListaMesas = await mesas.listaActiva();

  res.render("MeseroNuevoPedido", { mesas: ListaMesas });
});
router.get("/nroPersonas/:mesa", async (req, res) => {
  const pamlcodmes = req.params.mesa;

  const mesa = new Amesloc();
  mesa.pamlcodmes = pamlcodmes;

  await mesa.obtenerDatos();

  res.render("FRMCantidadPersonas", { mesa: mesa });
});
router.post("/guardarNroPersonas", async (req, res) => {
  //necesito numeros de personas
  //numeor de mesa
  //codigo del usuario

  const { cantidadPersonas, pamlcodmes } = req.body;

  const datosMesa = {
    nroPersonas: cantidadPersonas,
    codMesa: pamlcodmes
  };

  console.log(datosMesa);

  const categoria = new Acatpro();
  const categorias = await categoria.listaActiva();

  //lugo consultos categorias con sus productos
  //y luego paso en un eje todos los datos necesarios

  res.render("MeseroSeleccionProductos", {
    categorias: categorias,
    datosMesa: datosMesa
  });
});
router.get("/obtenerProductos/:idCat", async (req, res) => {
  const { idCat } = req.params;

  const producto = new Aproduc();

  const productos = await producto.listaProCat(idCat);

  res.render("ListaProductosPorCat", { productos: productos });
});
router.post("/guardar/pedido", async (req, res) => {
   const io = req.app.get("io");

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
      //cargo las bebidas para mandarselas por socket al bar
      break;
    }
  }
  for (let i = 0; i < productos.length; i++) {
    if (await producto2.esComida(productos[i].codigo)) {
      hayComida = true;
      console.log("hay comida");
      //cargo las comidas para mandaselas a cocina
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

  //armar el pedido para enviarselo a cocina mediante socket

  let nuevoPeidoCocina = [];

  const resCabezera = await Aproduc.datosPedidosCocCabezera(pedido.pappcodped);

  const productosCocina = await Aproduc.itemsDelPedido(pedido.pappcodped);

  const fecha = new Date(resCabezera.cappfecped).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  });

  nuevoPeidoCocina.push({
    codigo: pedido.pappcodped,
    mesa: resCabezera.camlnummes,
    pedido: resCabezera.pappcodped,
    meseroNombre: resCabezera.capsnomper,
    meseroApellido: resCabezera.capsapepat,
    hora: resCabezera.capphorped,
    productos: productosCocina,
    fecha: fecha,
    nroPersonas: resCabezera.cappcanper
  });

  io.emit('nuevoPedidoCocina',{nuevoPedidoCocina : nuevoPeidoCocina})






  if (await amesloc.cambiarEstado(datosDeMesa.codMesa, "ESPERA")) {
    console.log("Se cambio de estado la mesa");

   

    // 2. Emitir el evento de cambio de estado de mesa
    io.emit("estadoMesaCambiado", {
      codMesa: datosDeMesa.codMesa,
      nuevoEstado: "ESPERA"
    });
  }

  return res.status(200).json({
    success: true,
    mensaje: "Pedido guardado con éxito",
    url: "/mesero/mensaje/pedidoExito"
  });
});
router.get("/mensaje/pedidoExito", (req, res) => {
  res.render("MensajePedidoExitoso");
});

export default router;
