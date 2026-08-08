import { Router, text } from "express";
import path from "path"; // <-- 1. Importación necesaria para res.sendFile
import pool from "../config/db.js";
import Xnumcor from "../Models/xnumcor.js";
import Aperson from "../Models/aperson.js";
import Arepart from "../Models/arepart.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const sql =
      "select * from aperson per, arepart rep where per.papscodper = rep.faracodper";

    const resultado = await pool.query(sql);

    // res.render('nombre_vista', { objeto_con_datos })
    // Arreglo de objetos listo para la vista
    res.render("RepartidorLista", { personas: resultado.rows });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).send("Error al cargar la página");
  }
});

router.post("/agregar", async (req, res) => {
  let texto = "";
  let tipo = "";
  // Rescatar los datos enviados desde el formulario
  const {
    capsnumcid, // CI
    capsnomper, // Nombre
    capsapepat, // Apellido Paterno
    capsapemat, // Apellido Materno
    capsfecing, // Fecha de ingreso
    capssueper, // Sueldo
    capsnumcel, // Celular
    caraestrep, // Estado
  } = req.body;

  //mustro por consola los resultados
  console.log("Datos recibidos del repartidor:", req.body);

  const correlativo = new Xnumcor();
  const aperson = new Aperson();
  const arepart = new Arepart();

  if (await aperson.verificarExistenciaCi(capsnumcid)) {
    console.log("ci si existe");
    texto = "Este repartidor ya esta registrado";
    tipo = "fallo";
    const Mensaje = {
      texto: texto,
      tipo: tipo,
    };
    return res.render("Mensaje", { Mensaje: Mensaje });
  }

  correlativo.pxnctipcor = "aperson";

  if (await correlativo.obtenerSiguiente()) {
    aperson.papscodper = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(5, "0")}`;
    console.log(aperson.papscodper);
  }
  aperson.capsnumcid = capsnumcid;
  aperson.capsnomper = capsnomper;
  aperson.capsapepat = capsapepat;
  aperson.capsapemat = capsapemat;
  aperson.capsfecing = capsfecing;
  aperson.capsnumcel = capsnumcel;
  aperson.capssueper = capssueper;

  if (await aperson.grabar()) {
    console.log("Se inserto una persona en la tabla aperson");
  } else {
    console.log("Error al grabar una persona en la tabla aperson");
  }

  correlativo.pxnctipcor = "arepart";
  if (await correlativo.obtenerSiguiente()) {
    arepart.paracodrep = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(5, "0")}`;
  }

  arepart.faracodper = aperson.papscodper;
  arepart.caraestrep = caraestrep;

  if (await arepart.grabar()) {
    console.log("Se inserto una un nuevo repartidor");
  }

  texto = "Repartidor guardado exitosamente";
  tipo = "exito";
  let Mensaje = {
    texto: texto,
    tipo: tipo,
  };
  res.render("Mensaje", { Mensaje: Mensaje });
});

router.get("/nuevo", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "FRMNuevoRepartidor.html"));
});

router.get("/ver/:id", async (req, res) => {
  const idRepartidor = req.params.id;

  const aperson = new Aperson();
  aperson.papscodper = idRepartidor;
  await aperson.obtenerDatos();

  const arepart = new Arepart();
  arepart.faracodper = aperson.papscodper;
  await arepart.obtenerDatosForaneos();

  aperson.capsfecing = aperson.capsfecing.toLocaleDateString("es-BO");
  if (arepart.caraestrep == 1) {
    arepart.caraestrep = "Activo";
  } else {
    arepart.caraestrep = "Inactivo";
  }

  const Repartidor = {
    capsnumcid: aperson.capsnumcid,
    capsnomper: aperson.capsnomper,
    capsapemat: aperson.capsapemat,
    capsapepat: aperson.capsapepat,
    capsfecing: aperson.capsfecing,
    capssueper: aperson.capssueper,
    capsnumcel: aperson.capsnumcel,
    caraestrep: arepart.caraestrep,
  };

  res.render("RepartidorMostrar", { Repartidor: Repartidor });
});
router.get("/prepMod/:id", async (req, res) => {
  const idRepartidor = req.params.id;

  const aperson = new Aperson();
  aperson.papscodper = idRepartidor;
  await aperson.obtenerDatos();

  const arepart = new Arepart();
  arepart.faracodper = aperson.papscodper;
  await arepart.obtenerDatosForaneos();

  const fecha = new Date(aperson.capsfecing);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  aperson.capsfecing = `${anio}-${mes}-${dia}`; // Resultado: "2026-08-06"

  if (arepart.caraestrep == 1) {
    arepart.caraestrep = "Activo";
  } else {
    arepart.caraestrep = "Inactivo";
  }

  const Repartidor = {
    papscodper: aperson.papscodper,
    capsnumcid: aperson.capsnumcid,
    capsnomper: aperson.capsnomper,
    capsapemat: aperson.capsapemat,
    capsapepat: aperson.capsapepat,
    capsfecing: aperson.capsfecing,
    capssueper: aperson.capssueper,
    capsnumcel: aperson.capsnumcel,
    caraestrep: arepart.caraestrep,
  };

  res.render("FRMRepartidorMod", { Repartidor: Repartidor });
});

router.post("/Modificar/:id", async (req, res) => {
  const { id } = req.params;

  const {
    capsnumcid, // CI
    capsnomper, // Nombre
    capsapepat, // Apellido Paterno
    capsapemat, // Apellido Materno
    capsfecing, // Fecha de ingreso
    capssueper, // Sueldo
    capsnumcel, // Celular
    caraestrep, // Estado
  } = req.body;
  console.log(id);
  const aperson = new Aperson();
  aperson.papscodper = id;
  aperson.capsnumcid = capsnumcid;
  aperson.capsnomper = capsnomper;
  aperson.capsapemat = capsapemat;
  aperson.capsapepat = capsapepat;
  aperson.capssueper = capssueper;
  aperson.capsnumcel = capsnumcel;
  aperson.capsfecing = capsfecing;

  const arepart = new Arepart();

  arepart.faracodper = aperson.papscodper;
  arepart.caraestrep = caraestrep;

  if (await aperson.verificarExistenciaCi(capsnumcid)) {
    console.log("Este ci ya existe");

    const codigo = await aperson.obtenerCodigo();

    console.log("codgio de persona a modificar " + aperson.papscodper);
    console.log("codgio de la person dueña del ci " + codigo);

    if (codigo != aperson.papscodper) {
      //si no pertenece ala persona que se esta modificando lanzo error

      return res.status(400).send("El CI ya pertenece a otra persona.");

      console.log("y Pertenece a otra persona misma persona");
    } else {
      //modifico con los datos pasados

      if ((await aperson.modificar()) && (await arepart.modificar())) {
        let Mensaje = {
          texto: "Modificacion Exitosa",
          tipo: "exito",
        };

        res.render("Mensaje", { Mensaje });
      } else {
        let Mensaje = {
          texto: "Algo salio mal",
          tipo: "fallo",
        };

        res.render("Mensaje", { Mensaje });
      }
    }
  }
});


router.get("/eliminar/:id", async (req, res) =>{

  const {id} = req.params;

  const arepart = new Arepart();
  arepart.faracodper = id;

  if(await arepart.eliminar()){
    console.log("Repartidor eliminado correcatmene");
    res.redirect('/repartidor');
  }else{
    console.log('algo salio mal al eliminar repartidor repartidor')
  }



});
router.get("/darAlta/:id", async (req, res) =>{

  const {id} = req.params;

  const arepart = new Arepart();
  arepart.faracodper = id;

  if(await arepart.darAlta()){
    console.log("Repartidor dado de alta correcatmene");
    res.redirect('/repartidor');
  }else{
    console.log('algo salio mal al dar alta la repartidor repartidor')
  }



});
export default router;
// Si usas CommonJS: module.exports = router;
