import { Router } from "express";
import path from "path";
import Aperson from "../Models/aperson.js";
import Xnumcor from "../Models/xnumcor.js";
import pool from "../config/db.js";
const router = Router();

router.get("/lista",async (req, res) => {
  //CONSULTA LAS PERSONAS A A LAA BSE DE DATOS
  const persona1 = new Aperson();
  const persona = await persona1.lista();


  res.render("PersonaLista", { personas: persona });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS
});
router.get("/nuevo", (req, res) => {
  //LE envio el formulario para que llene todos los datos de persona
  res.sendFile(path.join(process.cwd(), "public", "FRMNuevaPersona.html"));
});

router.post("/nuevo/persona", async (req, res) => {
  const correlativo = new Xnumcor();
  const persona = new Aperson();

  //recivol los datos que me enviaron atravez del formulario

  const {
    papscodper,
    capsnumcid,
    capsnomper,
    capsapepat,
    capsapemat,
    capsnumcel,
    capscorele,
    capsestper,
    capsfecnac,
    capssexper,
    capsdirper,
  } = req.body;

  if (capssexper == "true") {
    persona.capssexper = true;
  } else {
    persona.capssexper = false;
  }

  if (capsestper == "false") {
    persona.capsestper = false;
  } else {
    persona.capsestper = true;
  }

  persona.capsnumcid = capsnumcid;
  persona.capsnomper = capsnomper;
  persona.capsapepat = capsapepat;
  persona.capsapemat = capsapemat;
  persona.capsnumcel = capsnumcel;
  persona.capscorele = capscorele;
  persona.capsfecnac = capsfecnac;
  persona.capsdirper = capsdirper;

  //se probo que si llegan los resultados

  correlativo.pxnctipcor = "aperson";

  if (await correlativo.obtenerSiguiente()) {
    persona.papscodper = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await persona.grabar()) {
    res.render('Mensaje',{tipo : "exito", texto:"Persona guardada correctamente"})
  }
});
router.post("/modificar/:id", async (req, res) => {
  
  const id = req.params.id;
  const persona = new Aperson();


  //recivol los datos que me enviaron atravez del formulario

  const {
    capsnumcid,
    capsnomper,
    capsapepat,
    capsapemat,
    capsnumcel,
    capscorele,
    capsestper,
    capsfecnac,
    capssexper,
    capsdirper,
  } = req.body;

  if (capssexper == "true") {
    persona.capssexper = true;
  } else {
    persona.capssexper = false;
  }

  if (capsestper == "false") {
    persona.capsestper = false;
  } else {
    persona.capsestper = true;
  }
  persona.papscodper = id;
  persona.capsnumcid = capsnumcid;
  persona.capsnomper = capsnomper;
  persona.capsapepat = capsapepat;
  persona.capsapemat = capsapemat;
  persona.capsnumcel = capsnumcel;
  persona.capscorele = capscorele;
  persona.capsfecnac = capsfecnac;
  persona.capsdirper = capsdirper;

  //se probo que si llegan los resultados

  if (await persona.modificar()) {
    res.render('Mensaje',{tipo : "exito", texto:"Persona modificada correctamente"})
  }
});

router.get('/ver/:id', async (req, res) =>{
    const papscodper  = req.params.id;

    const persona = new Aperson();
    persona.papscodper = papscodper
    await persona.obtenerDatos("");
    persona.capsfecnac = new Date(persona.capsfecnac).toISOString().split('T')[0];
    
    if(persona.capssexper == true){
      persona.capssexper = "MASCULINO"
    }else{
      persona.capssexper = "FEMENINO"

    }
    if(persona.capsestper == true){
      persona.capsestper = "ACTIVO"
    }else{
      persona.capsestper = "INACTIVO"

    }
    
    
  res.render('PersonaMostrar',{persona : persona})    


    

});

router.get('/prepMod/:id', async (req, res) =>{
    const papscodper  = req.params.id;

    const persona = new Aperson();
    persona.papscodper = papscodper
    await persona.obtenerDatos("");
    
    persona.capsfecnac = new Date(persona.capsfecnac).toISOString().split('T')[0];
    
   console.log(persona)
    
  res.render('FRMPersonaMod',{persona : persona})    


    

});

router.get('/eliminar/:id', async (req, res) =>{


  const papscodper  = req.params.id;

  const persona = new Aperson();
  
  persona.papscodper = papscodper;

  if (await persona.eliminar()){

   res.redirect('/persona/lista');
  }
    


    

});
router.get('/darAlta/:id', async (req, res) =>{


  const papscodper  = req.params.id;

  const persona = new Aperson();
  
  persona.papscodper = papscodper;

  if (await persona.darAlta()){

   res.redirect('/persona/lista');
  }
    


    

});

export default router;
