import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import RutaRepartidor from "./Routes/Repartidor.js";
import RutaPersona from "./Routes/Persona.js";
import RutaCategoria from "./Routes/Categoria.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// 2. OBLIGATORIO: Middleware para peticiones de formularios HTML tradicionales
app.use(express.urlencoded({ extended: true }));
app.use("/persona",RutaPersona);
app.use("/categoria",RutaCategoria);



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
