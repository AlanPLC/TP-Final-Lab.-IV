import express from "express";
import cors from "cors";
import passport from "passport";
import { conectarDB } from "./config/db.js";
import { authConfig } from "./src/middlewares/authConfig.js";
import usuariosRouter from "./src/routes/usuariosRoutes.js";
import ventasRouter from "./src/routes/ventasRoutes.js";
import ventaDetalladaRouter from "./src/routes/ventaDetalladaRoutes.js";
import loginRouter from "./src/routes/authRoutes.js";

// Conectar a DB
conectarDB();
console.log("Conectado a base de datos");


const app = express();
const port = 3000;

// interpretar JSON en body
app.use(express.json());

// Habilito cors
app.use(cors());

// Configuración de Passport y middleware para autenticación
authConfig();
app.use(passport.initialize());

// Rutas
app.use(loginRouter);
app.use(usuariosRouter);
app.use(ventasRouter)
app.use(ventaDetalladaRouter)

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en: ${port}`);
});