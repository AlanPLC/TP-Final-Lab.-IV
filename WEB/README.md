# Frontend del Minimarket (WEB)

Frontend del proyecto educativo sobre Minimarket, desarrollado con React y Vite por el grupo Bitward.

## Estructura de Carpetas y explicación.

public/                   # Archivos estáticos accesibles en toda la aplicación.
src/
 ├── components/          # Componentes reutilizables en toda la aplicación.
 ├── features/            # Cada funcionalidad de la aplicación, como login, carrito, etc.
 │    └── Login-Register/ # Ejemplo de una funcionalidad específica (Login y Registro).
 │         ├── styles/    # Estilos específicos para el componente Login-Register.
 │         └── hooks/     # Hooks específicos de un componente React para encapsular lógica y solicitudes a 
 │                          la API.
 ├── hooks/               # Hooks generales de React para encapsular lógica y solicitudes a la API.
 ├── styles/              # Estilos globales de la aplicación.
 ├── App.jsx              # Componente principal de la aplicación.
 └── main.jsx             # Punto de entrada principal de la aplicación.