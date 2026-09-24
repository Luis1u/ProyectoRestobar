import { Router } from "express";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import validacion from "../Models/validacion.js";
const router = Router();

router.get("/lista", async (req, res) => {
  const producto1 = new Aproduc();

  const productos = await producto1.listaConCategoria();

  res.render("ProductoLista", { productos: productos });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJSf
});
router.get("/nuevo", async (req, res) => {
  const categoria = new Acatpro();

  const categorias = await categoria.lista("where cacpestcat = true");

  res.render("FRMNuevoProducto", { categorias: categorias });
});
router.post("/nuevo/producto", async (req, res) => {
  const {
    capdestpro,
    capdstodia,
    pacpcodcat,
    capdnompro,
    capddespro,
    capdingpro,
    capdpreven,
    capdfotpro
  } = req.body;

  const producto = new Aproduc();
  const correlativo = new Xnumcor();
  correlativo.pxnctipcor = "aproduc";

 

  if (capdestpro == "true") {
    producto.capdestpro = true;
  } else {
    producto.capdestpro = false;
  }

  producto.fapdcodcat = pacpcodcat;
  producto.capdnompro = capdnompro;
  producto.capddespro = capddespro;
  producto.capdingpro = capdingpro;
  producto.capdpreven = capdpreven;
  producto.capdfotpro = capdfotpro;
  producto.capdstodia = capdstodia;

  if (
    await validacion.insertarExiste(
      "aproduc",
      "capdnompro",
      producto.capdnompro
    )
  ) {
    return res.send("EXISTE");
  }

  if (await correlativo.obtenerSiguiente()) {
    producto.papdcodpro = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await producto.grabar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "producto guardada correctamente",
      url: "/producto/lista"
    });
  }
});
router.get("/ver/:id", async (req, res) => {
  const papdcodpro = req.params.id;

  const producto1 = new Aproduc();
  producto1.papdcodpro = papdcodpro;

  const producto = await producto1.ProConCat();

  res.render("ProductoMostrar", { producto: producto });
});

router.get("/prepMod/:id", async (req, res) => {
  const papdcodpro = req.params.id;

  const producto1 = new Aproduc();
  producto1.papdcodpro = papdcodpro;
  const categoria1 = new Acatpro();

  const categorias = await categoria1.lista("");

  const producto = await producto1.ProConCat();

  res.render("FRMProductoMod", { producto: producto, categorias: categorias });
});
router.post("/modificar/:id", async (req, res) => {
  const {
    capdestpro,
    capdstodia,
    pacpcodcat,
    capdnompro,
    capddespro,
    capdingpro,
    capdpreven,
    capdfotpro
  } = req.body;

  const producto = new Aproduc();
  producto.papdcodpro = req.params.id;

  if (capdestpro == "true") {
    producto.capdestpro = true;
  } else {
    producto.capdestpro = false;
  }

  producto.capdstodia = capdstodia;
  producto.fapdcodcat = pacpcodcat;
  producto.capdnompro = capdnompro;
  producto.capddespro = capddespro;
  producto.capdingpro = capdingpro;
  producto.capdpreven = capdpreven;
  producto.capdfotpro = capdfotpro;
  producto.capdfecmod = new Date();

  if (
    await validacion.insertarExiste(
      "aproduc",
      "capdnompro",
      producto.capdnompro
    )
  ) {
    if (
      await validacion.modificarExiste(
        "aproduc",
        "capdnompro",
        producto.capdnompro,
        "papdcodpro",
        producto.papdcodpro
      )
    ) {
      if (await producto.modificar()) {
        res.render("Mensaje", {
          tipo: "exito",
          texto: "Producto modificado correctamente",
          url: "/producto/lista"
        });
      }
    } else {
      return res.send("EXISTE");
    }
  } else {
    if (await producto.modificar()) {
      res.render("Mensaje", {
        tipo: "exito",
        texto: "Producto modificado correctamente",
        url: "/producto/lista"
      });
    }
  }

  
});
router.get("/eliminar/:id", async (req, res) => {
  const papdcodpro = req.params.id;

  const producto = new Aproduc();

  producto.papdcodpro = papdcodpro;

  if (await producto.eliminar()) {
    res.redirect("/producto/lista");
  }
});
router.get("/darAlta/:id", async (req, res) => {
  const papdcodpro = req.params.id;

  const producto = new Aproduc();

  producto.papdcodpro = papdcodpro;

  if (await producto.darAlta()) {
    res.redirect("/producto/lista");
  }
});
router.get("/iniciarStockPregunta", async (req, res) => {
  res.render("MensajeConfirmacionStock");
});
router.get("/siCargarStockDiario", async (req, res) => {
  const producto = new Aproduc();

  const listaProductos = await producto.lista();

  for (const pro of listaProductos) {
    const producto2 = new Aproduc();
    producto2.papdcodpro = pro.papdcodpro;
    producto2.capdstodia = pro.capdstodia;
    await producto2.iniciarStockDiario();
  }

  res.redirect("/producto/lista");
});

export default router;
