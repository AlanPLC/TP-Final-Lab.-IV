import express from "express";
import cors from "cors";
import { conectarDB } from "./config/db.js";
import usuariosRouter from "./src/routes/usuariosRoutes.js";

// Conectar a DB
conectarDB();
console.log("Conectado a base de datos");

const app = express();
const port = 3000;

// interpretar JSON en body
app.use(express.json());

// Habilito cors
app.use(cors());

// Rutas
app.use(usuariosRouter);

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en: ${port}`);
});