import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Arepart from './Models/arepart.js';
import Xnumcor from './Models/xnumcor.js';



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
        paraestrep  // Estado
    } = req.body;

    console.log('Datos recibidos del repartidor:', req.body);
    const correlativo = new Xnumcor();  
    const arepart = new Arepart();

    correlativo.pxnctipcor = "aperson";

    if (await correlativo.obtenerSiguiente()) {
        arepart.papscodper = `${correlativo.pxnctipcor}-${String(correlativo.cxncnumcor).padStart(5, '0')}`;
        console.log(arepart.papscodper)
    }
    arepart.capsnumcid = capsnumcid;
    arepart.capsnomper = capsnomper;
    arepart.capsapepat = capsapepat;
    arepart.capsapemat = capsapemat;
    arepart.capsfecing = capsfecing;
    arepart.capsnumcel = capsnumcel;
    arepart.capssueper = capssueper;

    if(await arepart.grabar()){
      console.log("Se inserto una persona en la tabla aperson");
    }




    



     
    let textoExito = "Persona guardada corectamente";
    res.render('Mensaje', { mensaje:textoExito });
    
});

app.get('/repartidor/nuevo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'FRMNuevoRepartidor.html'));
});
app.get('/repartidores', (req, res) => {
  // Simulación de respuesta de Base de Datos
  const listaPersonas = [
    { id: 1, ci: '1234567', nombre: 'Juan', apellido_paterno: 'Pérez', celular: '71234567' },
    { id: 2, ci: '7654321', nombre: 'Maria', apellido_paterno: 'Gómez', celular: '78901234' },
    { id: 3, ci: '4567890', nombre: 'Carlos', apellido_paterno: 'López', celular: '65432109' }
  ];

  res.render('Repartidor', { personas: listaPersonas });
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
  res.render('RepartidorDetalle', { persona: repartidor });
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