import express from "express";
import cors from "cors";
import { conectarDB } from "./config/db.js";
import usuariosRouter from "./src/routes/usuariosRoutes.js";
import productosRouter from "./src/routes/productosRoutes.js";

// Conectar a DB
conectarDB();
console.log("Conectado a base de datos");

const app = express();
const port = 3000;

// interpretar JSON en body
app.use(express.json());

// Habilito cors
app.use(cors());

app.use(usuariosRouter);

app.use(productosRouter);

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en: ${port}`);
});