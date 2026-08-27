import { Router } from "express";
import path from "path";
import Aususis from "../Models/aususis.js";
import Xnumcor from "../Models/xnumcor.js";

import pool from "../config/db.js";
const router = Router();

router.get("/lista", async (req, res) => {
  //CONSULTA LAS usuarioS A A LAA BSE DE DATOS
  const usuario1 = new Aususis();
  const usuario = await usuario1.listaConPer();

  res.render("UsuarioLista", { usuarios: usuario });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS
});
router.get("/nuevo", async (req, res) => {
  const usuario = new Aususis();
  const ListaPerSinUsu = await usuario.PerSinUsu();

  res.render("FRMNuevoUsuario", { personas: ListaPerSinUsu });
});

router.post("/nuevo/usuario", async (req, res) => {
  const correlativo = new Xnumcor();
  const usuario = new Aususis();

  //recivol los datos que me enviaron atravez del formulario

  const { causrolusu, causestusu, papscodper, causnomlog } = req.body;

  if (causestusu == "true") {
    usuario.causestusu = true;
  } else {
    usuario.causestusu = false;
  }

  usuario.causnomlog = causnomlog;
  usuario.causrolusu = causrolusu;
  usuario.fauscodper = papscodper;

  //se probo que si llegan los resultados

  correlativo.pxnctipcor = "aususis";

  if (await correlativo.obtenerSiguiente()) {
    usuario.pauscodusu = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await usuario.grabar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "usuario guardada correctamente"
    });
  }
});
router.post("/modificar/:id", async (req, res) => {
  const id = req.params.id;
  const usuario = new Aususis();

  //recivol los datos que me enviaron atravez del formulario

  const { causrolusu, causestusu, papscodper, causnomlog } = req.body;

  if (causestusu == "true") {
    usuario.causestusu = true;
  } else {
    usuario.causestusu = false;
  }
  usuario.pauscodusu = id;
  usuario.causnomlog = causnomlog;
  usuario.causrolusu = causrolusu;
  usuario.fauscodper = papscodper;

  //se probo que si llegan los resultados
  console.log(usuario);

  if (await usuario.modificar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "usuario guardada correctamente"
    });
  }
});

router.get("/ver/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario = new Aususis();
  usuario.pauscodusu = pauscodusu;
  await usuario.obtenerDatos("");
  usuario.capsfecnac = new Date(usuario.capsfecnac).toISOString().split("T")[0];

  if (usuario.causestusu == true) {
    usuario.causestusu = "MASCULINO";
  } else {
    usuario.causestusu = "FEMENINO";
  }
  if (usuario.capsestper == true) {
    usuario.capsestper = "ACTIVO";
  } else {
    usuario.capsestper = "INACTIVO";
  }

  res.render("usuarioMostrar", { usuario: usuario });
});

router.get("/prepMod/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario = new Aususis();
  usuario.pauscodusu = pauscodusu;
  await usuario.obtenerDatos("");

  console.log(usuario);
  const ListaPerSinUsu = await usuario.PerSinUsu();

  usuario.pauscodusu = pauscodusu;

  const usuarioActual = await usuario.obtenerDatosUsuPer();

  console.log(usuarioActual);

  res.render("FRMUsuarioMod", {
    usuario: usuario,
    personas: ListaPerSinUsu,
    usuarioActual: usuarioActual
  });
});
router.get("/resetearClave/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario1 = new Aususis();
  usuario1.pauscodusu = pauscodusu;

  const usuario = await usuario1.obtenerDatosUsuPer();
  console.log("usuari de base de datos", usuario);

  res.render("MensajeConfirmacion", { usuario: usuario });
});
router.get("/siReseterClave/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario = new Aususis();
  usuario.pauscodusu = pauscodusu;

  if (await usuario.restablecerClave()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "Clave restablecida correctamente"
    });
  }
});
router.get("/eliminar/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario = new Aususis();

  usuario.pauscodusu = pauscodusu;

  if (await usuario.eliminar()) {
    res.redirect("/usuario/lista");
  }
});

router.get("/darAlta/:id", async (req, res) => {
  const pauscodusu = req.params.id;

  const usuario = new Aususis();

  usuario.pauscodusu = pauscodusu;

  if (await usuario.darAlta()) {
    res.redirect("/usuario/lista");
  }
});

export default router;
