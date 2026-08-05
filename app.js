import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Aperson from './Models/aperson.js'
import Xnumcor from './Models/xnumcor.js';
import Arepart from './Models/arepart.js';
import arepart from './Models/arepart.js';
import pool from './config/db.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

// 2. OBLIGATORIO: Middleware para peticiones de formularios HTML tradicionales
app.use(express.urlencoded({ extended: true }));


//#region Ruta Repartidores
app.post('/repartidores/agregar',async (req, res) => {
    // Rescatar los datos enviados desde el formulario
    const {
        capsnumcid, // CI
        capsnomper, // Nombre
        capsapepat, // Apellido Paterno
        capsapemat, // Apellido Materno
        capsfecing, // Fecha de ingreso
        capssueper, // Sueldo
        capsnumcel, // Celular
        caraestrep  // Estado
    } = req.body;

    //mustro por consola los resultados
    console.log('Datos recibidos del repartidor:', req.body);

    
    const correlativo = new Xnumcor();  
    const aperson = new Aperson();
    const arepart = new Arepart();

    correlativo.pxnctipcor = "aperson";

    if (await correlativo.obtenerSiguiente()) {
        aperson.papscodper = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(5, '0')}`;
        console.log(aperson.papscodper)
    }
    aperson.capsnumcid = capsnumcid;
    aperson.capsnomper = capsnomper;
    aperson.capsapepat = capsapepat;
    aperson.capsapemat = capsapemat;
    aperson.capsfecing = capsfecing;
    aperson.capsnumcel = capsnumcel;
    aperson.capssueper = capssueper;

    if(await aperson.grabar()){
      console.log("Se inserto una persona en la tabla aperson");
    }

    correlativo.pxnctipcor = "arepart";
    if(await correlativo.obtenerSiguiente()){
      arepart.paracodrep =  `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(5, '0')}`
    }

    arepart.faracodper = aperson.papscodper;
    arepart.caraestrep = caraestrep;
    
    if(await arepart.grabar()){
      console.log("Se inserto una un nuevo repartidor");

    }

    




    



     
    let textoExito = "Persona guardada corectamente";
    res.render('Mensaje', { mensaje:textoExito });
    
});

app.get('/repartidor/nuevo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FRMNuevoRepartidor.html'));
});
app.get('/repartidores', async (req, res) => {

 try {
    const sql = 'select * from aperson per, arepart rep where per.papscodper = rep.faracodper';
   

    const resultado = await pool.query(sql);

    // res.render('nombre_vista', { objeto_con_datos })
     // Arreglo de objetos listo para la vista
    res.render('Repartidor', { personas: resultado.rows });
   
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).send('Error al cargar la página');
  }

});
app.get('/repartidor/ver/:id', (req, res) => {
  const idRepartidor = req.params.id;

  // 1. Simulación o consulta a Base de Datos
  const repartidor = {
    id: idRepartidor,
    ci: '1234567',
    nombre: 'Juan',
    apellido_paterno: 'Pérez',
    celular: '71234567',
    direccion: 'Av. Principal #123'
  };

  // 2. Renderizas la plantilla EJS pasando el objeto encontrado
  // (views/RepartidorDetalle.ejs sólo debe contener el HTML del formulario o ficha)
  
});
//#endregion


//#region Sockets
io.on('connection', (socket) => {
  console.log(`⚡ Cliente conectado: ${socket.id}`);

 
  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});
//#endregion

const PUERTO = 3000;
server.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});