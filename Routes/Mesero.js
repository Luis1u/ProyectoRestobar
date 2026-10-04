import { Router } from "express";

import Amesloc from "../Models/amesloc.js";
import Acatpro from "../Models/acatpro.js";
import Aproduc from "../Models/aproduc.js";
import Apedpro from "../Models/apedpro.js";
import Adetped from "../Models/adetped.js";
import { guardarPedidoTransaccional } from "../Services/guardarPedido.js";

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
  const mesa = new Amesloc();
  mesa.pamlcodmes = req.params.mesa;
  await mesa.obtenerDatos();
  res.render("FRMCantidadPersonas", { mesa: mesa });
});

router.post("/guardarNroPersonas", async (req, res) => {
  const { cantidadPersonas, pamlcodmes } = req.body;

  const datosMesa = {
    nroPersonas: cantidadPersonas,
    codMesa: pamlcodmes
  };

  const categoria = new Acatpro();
  const categorias = await categoria.listaActiva();

  res.render("MeseroSeleccionProductos", {
    categorias: categorias,
    datosMesa: datosMesa
  });
});

router.get("/obtenerProductos/:idCat", async (req, res) => {
  const producto = new Aproduc();
  const productos = await producto.listaProCat(req.params.idCat);
  res.render("ListaProductosPorCat", { productos: productos });
});

router.post("/guardar/pedido", async (req, res) => {
  const io = req.app.get("io");
  const { productos, datosMesa,total} = req.body;

  let datos;
  try {
    datos = typeof datosMesa === "string" ? JSON.parse(datosMesa) : datosMesa;
  } catch {
    return res.status(200).json({
      success: false,
      tipo: "DATOS_INVALIDOS",
      mensaje: "Datos de mesa inválidos"
    });
  }

  // Todo lo crítico (mesa, stock, pedido, detalle) ocurre en UNA transacción
  const resultado = await guardarPedidoTransaccional({
    productos,
    datosMesa: datos,
    total,
    codUsuario: req.session.usuario.codigo
  });

  if (!resultado.success) {
    return res.status(200).json(resultado);
  }

  // A partir de aquí el pedido ya está confirmado (COMMIT hecho).
  // Si algo falla al emitir sockets, el pedido NO se pierde.
  try {
    // Avisar a todos los meseros cuánto stock quedó de cada producto
    io.emit("stockActualizado", { productos: resultado.stockActualizado });

    io.emit("estadoMesaCambiado", {
      codMesa: datos.codMesa,
      nuevoEstado: "ESPERA"
    });

    const cab = await Apedpro.datosPedidosCocCabezera(resultado.codPedido);

    const fecha = new Date(cab.cappfecped).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"
    });

    const base = {
      codigo: resultado.codPedido,
      mesa: cab.camlnummes,
      pedido: cab.pappcodped,
      meseroNombre: cab.capsnomper,
      meseroApellido: cab.capsapepat,
      hora: cab.capphorped,
      fecha: fecha,
      nroPersonas: cab.cappcanper
    };

    if (resultado.hayComida) {
      const productosCocina = await Adetped.itemsDelPedido(resultado.codPedido);
      io.emit("nuevoPedidoCocina", {
        nuevoPedidoCocina: [{ ...base, productos: productosCocina }]
      });
    }

    if (resultado.hayBebida) {
      const productosBar = await Adetped.itemsDelPedidoBar(resultado.codPedido);
      io.emit("nuevoPedidoBar", {
        nuevoPedidoBar: [{ ...base, productos: productosBar }]
      });
    }
  } catch (error) {
    console.error("Pedido guardado, pero falló el envío por socket:", error);
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