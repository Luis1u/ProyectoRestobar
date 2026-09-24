import { Router } from "express";
import path from "path";
import Aususis from "../Models/aususis.js";
import Xnumcor from "../Models/xnumcor.js";
import Validacion from "../Models/validacion.js";

import pool from "../config/db.js";
const router = Router();

router.get("/lista", async (req, res) => {
  //CONSULTA LAS usuarioS A A LAA BSE DE DATOS
  const usuario1 = new Aususis();
  const usuario = await usuario1.listaConPer();

  res.render("UsuarioLista", { usuarios: usuario });

 
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

  if (
    await Validacion.insertarExiste(
      "aususis",
      "causnomlog",
      usuario.causnomlog
    )
  ) {
    return res.send("EXISTE");
  }



  if (await correlativo.obtenerSiguiente()) {
    usuario.pauscodusu = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await usuario.grabar()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "usuario guardada correctamente"
      ,url : "/usuario/lista"
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
  if (
    await Validacion.insertarExiste("aususis", "causnomlog", usuario.causnomlog)
  ) {
    if (
      await Validacion.modificarExiste(
        "aususis",
        "causnomlog",
        usuario.causnomlog,
        "pauscodusu",
        usuario.pauscodusu
      )
    ) {
      if (await usuario.modificar()) {
        res.render("Mensaje", {
          tipo: "exito",
          texto: "Usuario modificado correctamente",
          url: "/usuario/lista"
        });
      }
    } else {
      return res.send("EXISTE");
    }
  } else {
    if (await usuario.modificar()) {
      res.render("Mensaje", {
        tipo: "exito",
        texto: "usuario guardada correctamente"
        ,url : "/usuario/lista"
      });
    }
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

  const ListaPerSinUsu = await usuario.PerSinUsu();

  usuario.pauscodusu = pauscodusu;

  const usuarioActual = await usuario.obtenerDatosUsuPer();


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

  res.render("MensajeConfirmacion", { usuario: usuario });
});
router.get("/siResetearClave/:id", async (req, res) => {
  const pauscodusu = req.params.id;
  const usuario = new Aususis();
  usuario.pauscodusu = pauscodusu;

  if (await usuario.restablecerClave()) {
    res.render("Mensaje", {
      tipo: "exito",
      texto: "Clave restablecida correctamente",
      url : "/usuario/lista"
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
