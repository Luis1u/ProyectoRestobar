import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import session from "express-session";

import RutaPersona from "./Routes/Persona.js";
import RutaCategoria from "./Routes/Categoria.js";
import RutaMesa from "./Routes/Mesa.js";
import RutaProducto from "./Routes/Producto.js";
import RutaUsuario from "./Routes/Usuario.js";
import RutaLogin from "./Routes/Login.js";
import RutaMesero from "./Routes/Mesero.js"

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

// Definición de Rutas
app.use("/login", RutaLogin);
app.use("/persona", RutaPersona);
app.use("/categoria", RutaCategoria);
app.use("/mesa", RutaMesa);
app.use("/producto", RutaProducto);
app.use("/usuario", RutaUsuario);
app.use("/usuario", RutaUsuario);
app.use("/mesero", RutaMesero);

//#region Sockets
io.on("connection", (socket) => {
  console.log(`⚡ Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});
//#endregion

const PUERTO = 3000;
server.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});

const cerrarConexiones = async () => {
  console.log("Cerrando pool de conexiones PostgreSQL...");
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", cerrarConexiones);
process.on("SIGTERM", cerrarConexiones);
