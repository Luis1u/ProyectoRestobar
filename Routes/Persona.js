import { Router } from "express";
import path from "path";
const router = Router();

router.get('/lista', (req, res)=>{
    //CONSULTA LAS PERSONAS A A LAA BSE DE DATOS 
    const persona = [
        {
            capsnumcid:1234,
            capsnomper:"luis",
            capsapepat:"cali",
            capsapemat:"mollo",
            capsnumcel:1212,
            capsestper:true
        }
    ];


    res.render('PersonaLista',{personas : persona});




    //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS

});
router.get('/nuevo',(req, res) =>{
    //LE envio el formulario para que llene todos los datos de persona
     res.sendFile(path.join(process.cwd(), "public", "FRMNuevaPersona.html"));
});

router.post('/nuevo/persona',(req, res) =>{
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
        capsdirper
    } = req.body;

    

    

    
});




export default router;