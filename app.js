import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import session from "express-session";
import os from "os";

import RutaPersona from "./Routes/Persona.js";
import RutaCategoria from "./Routes/Categoria.js";
import RutaMesa from "./Routes/Mesa.js";
import RutaProducto from "./Routes/Producto.js";
import RutaUsuario from "./Routes/Usuario.js";
import RutaLogin from "./Routes/Login.js";
import RutaMesero from "./Routes/Mesero.js"
import RutaPedido from "./Routes/Pedido.js"
import RutaCocinero from "./Routes/Cocinero.js"
import RutaBartender from "./Routes/Bartender.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configuración de plantillas y estáticos
app.set("view engine", "ejs");
app.use(express.static("public"));

// Configuración de parsing con límites de tamaño de 50MB (Para imágenes Base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  session({
    secret: "secreto_clave_segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // En 'false' para que funcione en localhost (sin HTTPS)
      maxAge: 1000 * 60 * 60 * 4 // Duración de la cookie (ej: 4 horas)
    }
  })
);
app.get('/',(req, res)=>{
 res.sendFile(path.join(process.cwd(), "public", "Login.html"));
})
// Definición de Rutas
app.use("/login", RutaLogin);
app.use("/persona", RutaPersona);
app.use("/categoria", RutaCategoria);
app.use("/mesa", RutaMesa);
app.use("/producto", RutaProducto);
app.use("/usuario", RutaUsuario);
app.use("/usuario", RutaUsuario);
app.use("/mesero", RutaMesero);
app.use("/pedido", RutaPedido);
app.use("/cocinero",RutaCocinero);
app.use("/bartender",RutaBartender);

//#region Sockets
io.on("connection", (socket) => {
  console.log(`⚡ Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});
//#endregion

const PUERTO = 3000;

// <--- 2. AUMENTAR '0.0.0.0' COMO SEGUNDO PARÁMETRO --->
server.listen(PUERTO, "0.0.0.0", () => {
  const ipLocal = '192.168.1.17';
  console.log(`\n🚀 Servidor activo:`);
  console.log(`   - En tu PC:     http://localhost:${PUERTO}`);
  console.log(`   - En Celulares: http://${ipLocal}:${PUERTO}\n`);
});

const cerrarConexiones = async () => {
  console.log("Cerrando pool de conexiones PostgreSQL...");
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", cerrarConexiones);
process.on("SIGTERM", cerrarConexiones);