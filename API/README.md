# API del Minimarket

API de proyecto educativo sobre Minimarket, utilizando Express.js y Mysql2 por el grupo Bitward.

## Estructura de Carpetas y explicación.

app.js                    # Archivo principal que inicia la aplicación y monta las rutas.
config/
 └── dbconfig.js          # Variables de configuración generales (puerto, entorno, etc.).
src/
 ├── controllers/         # Lógica de negocio para cada entidad (usuarios, productos, pedidos, etc.).
 ├── routes/              # Definición de las rutas de la API, cada una conecta a un controlador.
 ├── schemas/             # Validación de datos de entrada usando Zod.
 └── middlewares/         # Middlewares para autenticación, autorización y manejo de errores.