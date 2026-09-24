import { Router } from "express";
import path from "path";

import Aususis from "../Models/aususis.js";
import bcrypt from "bcrypt";

const router = Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "Login.html"));
});
router.post("/inicio", async (req, res) => {
  const { usuario, clave } = req.body;

  const usuarioPersona = new Aususis();

  const datosUsuario = await usuarioPersona.obtenerDatosUsuPerPorlogin(usuario);

  if (datosUsuario.causnomlog == usuario) {
    if (datosUsuario.causactpas == false) {
      if (await bcrypt.compare(clave, datosUsuario.causpasswo)) {
        req.session.usuario = {
          codigo: datosUsuario.pauscodusu,
          nombre: datosUsuario.capsnomper,
          apellidoPaterno: datosUsuario.capsapepat,
          rol: datosUsuario.causrolusu
        };

        if (datosUsuario.causrolusu == "MESERO") {
          return req.session.save((err) => {
            if (err) {
              console.error("Error al guardar sesión:", err);
              return res
                .status(500)
                .json({ exito: false, mensaje: "Error de sesión" });
            }
            return res.json({
              exito: true,
              redireccion: "/mesero/principal"
            });
          });
        } else if (datosUsuario.causrolusu == "ADMINISTRADOR") {
          return req.session.save((err) => {
            if (err) {
              console.error("Error al guardar sesión:", err);
              return res
                .status(500)
                .json({ exito: false, mensaje: "Error de sesión" });
            }
            return res.json({
              exito: true,
              redireccion: "/administrador/principal"
            });
          });
        } else if (datosUsuario.causrolusu == "COCINERO") {
          return req.session.save((err) => {
            if (err) {
              console.error("Error al guardar sesión:", err);
              return res
                .status(500)
                .json({ exito: false, mensaje: "Error de sesión" });
            }
            return res.json({
              exito: true,
              redireccion: "/cocinero/principal"
            });
          });
        } else if (datosUsuario.causrolusu == "BARTENDER") {
          return req.session.save((err) => {
            if (err) {
              console.error("Error al guardar sesión:", err);
              return res
                .status(500)
                .json({ exito: false, mensaje: "Error de sesión" });
            }
            return res.json({
              exito: true,
              redireccion: "/bartender/principal"
            });
          });
        }
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
router.get("/actualizarPassword", (req, res) => {
  res.render("FRMActualizarPassword", { usuario: req.session.usuario });
});
router.post("/nuevaClave", async (req, res) => {
  const { causnomlog, causpasswo } = req.body;

  const usuario = new Aususis();

  const rondasSeguridad = 10;
  const claveHasheada = await bcrypt.hash(causpasswo, rondasSeguridad);

  if (await usuario.modificarContraseña(claveHasheada, causnomlog)) {
    console.log("clave modificada correctamente");
  }

  res.redirect("/login");
});


export default router;
