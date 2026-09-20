// Base de la API. En desarrollo normal (navegador y API en la misma PC)
// alcanza con localhost. Al probar desde el teléfono a través de un túnel
// (VS Code port forwarding, devtunnels, ngrok, etc.) "localhost" en esta URL
// se resuelve del lado del TELÉFONO, no de la PC que corre la API - ahí hace
// falta tunelizar TAMBIÉN el puerto de la API y pisar este valor con
// VITE_API_URL en un .env.local (ver .env.example), apuntando a esa otra URL.
// Sin el replace, una VITE_API_URL con "/" al final (fácil de tipear sin
// querer, ej. la URL que copia un túnel) duplicaba la barra en cada fetch
// (`${API_BASE_URL}/login/` -> ".../login/" con doble barra), y Express no
// matchea esa ruta - se veía como si la API no respondiera nada.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
