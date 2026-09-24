import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Acatpro from "../Models/acatpro.js";

import Validacion from '../Models/validacion.js';
const router = Router();

router.get("/lista",async (req, res) => {
  //CONSULTA LAS PERSONAS A A LAA BSE DE DATOS
  const categoria1 =  new Acatpro();

  const categorias = await categoria1.lista();



  res.render("CategoriaLista", { categorias: categorias });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS
});
router.get('/nuevo', (req, res)=>{
    res.sendFile(path.join(process.cwd(), "public", "FRMNuevaCategoria.html"));
});
router.post('/nuevo/categoria', async (req, res)=>{
    const correlativo = new Xnumcor();
     const categoria = new Acatpro();
    const {
        cacpnomcat,
        cacpdescat,
        cacpestcat,
        cacptipcat
    } = req.body;

    categoria.cacpnomcat = cacpnomcat;
    categoria.cacpdescat = cacpdescat;
    categoria.cacptipcat = cacptipcat;
    

    if (cacpestcat == "true") {
    categoria.cacpestcat = true;
  } else {
    categoria.cacpestcat = false;
  }

   correlativo.pxnctipcor = "acatpro";


    if (
    await Validacion.insertarExiste("acatpro", "cacpnomcat", categoria.cacpnomcat)
  ) {
    return res.send("EXISTE");
  }

  if (await correlativo.obtenerSiguiente()) {
    categoria.pacpcodcat = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
  }

  if (await categoria.grabar()) {
    res.render('Mensaje',{tipo : "exito", texto:"Categoria guardada correctamente",url : "/categoria/lista"})
  }
});
router.get('/ver/:id', async (req, res) =>{
    const pacpcodcat  = req.params.id;

    const categoria = new Acatpro();
    categoria.pacpcodcat = pacpcodcat;

    await categoria.obtenerDatos();
    
    if(categoria.cacpestcat == true){
      categoria.cacpestcat = "ACTIVO"
    }else{
      categoria.cacpestcat = "INACTIVO"

    }
    
    
    
  res.render('CategoriaMostrar',{categoria : categoria})    


    

});
router.get('/prepMod/:id', async (req, res) =>{
    const pacpcodcat  = req.params.id;

    const categoria = new Acatpro();
    categoria.pacpcodcat = pacpcodcat;
    await categoria.obtenerDatos();
    
  
  
    
  res.render('FRMCategoriaMod',{categoria : categoria})    


    

});
router.post('/modificar/:id', async (req, res)=>{
    const pacpcodcat = req.params.id;
     const categoria = new Acatpro();
    const {
        cacpnomcat,
        cacpdescat,
        cacpestcat,
        cacptipcat
    } = req.body;

    categoria.cacpnomcat = cacpnomcat;
    categoria.cacpdescat = cacpdescat;
    categoria.pacpcodcat = pacpcodcat;
    categoria.cacptipcat = cacptipcat;   


    if (cacpestcat == "true") {
    categoria.cacpestcat = true;
  } else {
    categoria.cacpestcat = false;
  }

  if (
    await Validacion.insertarExiste("acatpro", "cacpnomcat", categoria.cacpnomcat)
  ) {
    if (
      await Validacion.modificarExiste(
        "acatpro",
        "cacpnomcat",
        categoria.cacpnomcat,
        "pacpcodcat",
        categoria.pacpcodcat
      )
    ) {
      if (await categoria.modificar()) {
        res.render("Mensaje", {
          tipo: "exito",
          texto: "Categoria modificada correctamente",
          url: "/categoria/lista"
        });
      }
    } else {
      return res.send("EXISTE");
    }
  } else {
    if (await categoria.modificar()) {
      res.render('Mensaje',{tipo : "exito", texto:"Categoria modificada correctamente",url : "/categoria/lista"})
    }
  }






});
router.get('/eliminar/:id', async (req, res) =>{


 const pacpcodcat  = req.params.id;

    const categoria = new Acatpro();
  
  categoria.pacpcodcat = pacpcodcat;

  if (await categoria.eliminar()){

   res.redirect('/categoria/lista');
  }
    


    

});

router.get('/darAlta/:id', async (req, res) =>{


  const pacpcodcat  = req.params.id;

    const categoria = new Acatpro();
  
 categoria.pacpcodcat = pacpcodcat;

  if (await categoria.darAlta()){

   res.redirect('/categoria/lista');
  }
    


    

});
export default router;