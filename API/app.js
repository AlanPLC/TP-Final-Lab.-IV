import express from "express";
import cors from "cors";
import passport from "passport";
import { conectarDB } from "./config/db.js";
import { authConfig } from "./src/middlewares/authConfig.js";
import usuariosRouter from "./src/routes/usuariosRoutes.js";
import loginRouter from "./src/routes/authRoutes.js";
import ventasRouter from "./src/routes/ventasRoutes.js"
import proveedoresRouter from "./src/routes/proveedoresRoutes.js";
import productosConDetalles from "./src/routes/productosConDetallesRoutes.js";
import lotesRouter from "./src/routes/lotesRoutes.js";
import estadisticasRouter from "./src/routes/estadisticasRoutes.js";

// Conectar a DB
conectarDB();
console.log("Conectado a base de datos");

const app = express();
const port = 3000;

// interpretar JSON en body
app.use(express.json());

// Habilito cors - expuesto X-Renewed-Token para que el front (ver
// requireAuth.js) pueda leer el token renovado de cada respuesta; sin
// exponerlo explícitamente el navegador se lo esconde a la página.
app.use(cors({ exposedHeaders: ["X-Renewed-Token"] }));

// Configuración de Passport y middleware para autenticación
authConfig();
app.use(passport.initialize());

// Rutas
app.use(loginRouter);
app.use(usuariosRouter);
app.use(ventasRouter);
app.use(proveedoresRouter);
app.use(productosConDetalles)
app.use(lotesRouter)
app.use(estadisticasRouter)
app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en: ${port}`);
});