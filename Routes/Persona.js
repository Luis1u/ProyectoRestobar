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
            capsnumcel:1212
        }
    ];


    res.render('PersonaLista',{personas : persona});




    //CARGO LOS RESULTADOS Y SE LOS ENVIO AL ARCHIVO PESONAS.EJS

});
router.get('/nuevo',(req, res) =>{
    //LE envio el formulario para que llene todos los datos de persona
     res.sendFile(path.join(process.cwd(), "public", "FRMNuevaPersona.html"));
});




export default router;