// Punto de entrada para Vercel: un Express app es en sí mismo invocable
// como (req, res), así que exportarlo tal cual alcanza para que el
// runtime de Node de Vercel lo use como handler serverless - no hace
// falta ningún wrapper extra. El resto de las rutas (login, usuarios,
// ventas, etc.) siguen viviendo en app.js, sin duplicar nada acá; ver
// vercel.json (misma carpeta que app.js) para el rewrite que manda TODAS
// las rutas entrantes a esta única función.
import app from "../app.js";

export default app;
