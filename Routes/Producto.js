import { Router } from "express";
import path from "path";
import Xnumcor from "../Models/xnumcor.js";
import Aproduc from "../Models/aproduc.js";
import Acatpro from "../Models/acatpro.js";
import pool from "../config/db.js";
const router = Router();

router.get("/lista",async (req, res) => {
  //CONSULTA LAS PERSONAS A A LAA BSE DE DATOS
  const producto1 =  new Aproduc();

  const productos = await producto1.listaConCategoria("");



  res.render("ProductoLista", { productos: productos });

  //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS
});
router.get('/nuevo',async (req, res)=>{
    const categoria = new Acatpro();

    const categorias = await categoria.lista("where cacpestcat = true");
    


   

    res.render('FRMNuevoProducto', {categorias : categorias});
});
router.post('/nuevo/producto', async (req, res)=>{
    const {
    capdestpro, 
    pacpcodcat, 
    capdnompro,
    capddespro,
    capdingpro, 
    capdpreven, 
    capdfotpro 
    } = req.body;
    console.log(req.body)

    const producto = new Aproduc();
    const correlativo = new Xnumcor();
     correlativo.pxnctipcor = "aproduc";
    
    if (await correlativo.obtenerSiguiente()) {
      producto.papdcodpro = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(11, "0")}`;
    }

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
    


console.log(producto)

     
    if (await producto.grabar()) {
      res.render('Mensaje',{tipo : "exito", texto:"producto guardada correctamente"})
    }

  

 

   



});
router.get('/ver/:id', async (req, res) =>{
    const papdcodpro  = req.params.id;

    const producto1 = new Aproduc();

    const productos = await producto1.listaConCategoria(` and pro.papdcodpro = '${papdcodpro}'`);
    const producto = productos[0];

    

    

    
    
    
  res.render('ProductoMostrar',{producto : producto})    


    

});
router.get('/mostrarProductos/:idCat', async (req, res) =>{

  const {idCat} = req.params;
const producto = new Aproduc();
console.log('id cat: ',idCat)
const productos = await producto.listaConCategoria(idCat)

console.log(productos)



   return res.status(200).json(productos);

    

});
router.get('/prepMod/:id', async (req, res) =>{
    const papdcodpro  = req.params.id;

    const producto1 = new Aproduc();
    const categoria1 = new Acatpro();

    const categorias = await categoria1.lista("");

    const productos = await producto1.listaConCategoria(` and pro.papdcodpro = '${papdcodpro}'`);
    const producto = productos[0];
    
  
  
    
  res.render('FRMProductoMod',{producto : producto, categorias : categorias})    


    

});
router.post('/modificar/:id', async (req, res)=>{
    const {
    capdestpro, 
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

   
    producto.fapdcodcat = pacpcodcat; 
    producto.capdnompro = capdnompro;
    producto.capddespro = capddespro;
    producto.capdingpro = capdingpro;
    producto.capdpreven = capdpreven;
    producto.capdfotpro = capdfotpro;
    producto.capdfecmod = new Date();
    
console.log(producto);



     
    if (await producto.modificar()) {
      res.render('Mensaje',{tipo : "exito", texto:"Producto modificado correctamente"})
    }



  
});
router.get('/eliminar/:id', async (req, res) =>{


 const papdcodpro  = req.params.id;

    const producto = new Aproduc();
  
  producto.papdcodpro = papdcodpro;

  if (await producto.eliminar()){

   res.redirect('/producto/lista');
  }
    


    

});
router.get('/darAlta/:id', async (req, res) =>{


  const papdcodpro  = req.params.id;

    const producto = new Aproduc();
  
 producto.papdcodpro = papdcodpro;

  if (await producto.darAlta()){

   res.redirect('/producto/lista');
  }
    


    

});
export default router;