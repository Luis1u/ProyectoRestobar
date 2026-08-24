import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Amesloc from "../Models/amesloc.js";
import pool from "../config/db.js";
import amesloc from "../Models/amesloc.js";
import { cwd } from "process";
import Aususis from "../Models/aususis.js";

const router = Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "Login.html"));
});
router.post("/inicio", async (req, res) => {
  const { usuario, clave } = req.body;

  const usuarioPersona = new Aususis();

  const datosUsuario = await usuarioPersona.obtenerDatosUsuPer(usuario);

  if (datosUsuario.causnomlog == usuario) {
    if (datosUsuario.causactpas == false) {
      if (datosUsuario.causpasswo == clave) {
        req.session.usuario = {
          nombre:datosUsuario.causnomper,
          apellidoPaterno: datosUsuario.causapepat,
          rol: datosUsuario.causrolusu

        };
        return res.json({
          exito: true,
          redireccion: "/login/actualizarPassword"
        });
       
      } else {
        return res.status(401).json({
          exito: false,
          mensaje: "Usuario o contraseña incorrectos."
        });
      }
    } else {
       
      if (datosUsuario.capsnumcid == clave) {
        req.session.usuario = {
          causnomlog: datosUsuario.causnomlog
        };
        return res.json({
          exito: true,
          redireccion: "/login/actualizarPassword"
        });
      } else {
        return res.status(401).json({
          exito: false,
          mensaje: "Usuario o contraseña incorrectos."
        });
      }
    }
  } else {
    return res.status(401).json({
      exito: false,
      mensaje: "Usuario o contraseña incorrectos."
    });
  }

});
router.get('/actualizarPassword', (req, res) =>{
    res.render('FRMActualizarPassword',{ usuario: req.session.usuario });
});
router.post('/nuevaClave',async (req, res)=> {
  const {causnomlog, causpasswo} = req.body;

  const usuario = new Aususis();

  if(usuario.modificarContraseña(causpasswo,causnomlog)){
    console.log("clave modificada correctamente");
  }




});
export default router;
