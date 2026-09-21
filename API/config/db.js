import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Pool de conexiones a Postgres (Supabase). Reemplaza la única conexión
// mysql2 que había antes: con un pool, cada request toma una conexión libre
// y la devuelve al terminar, en vez de compartir una sola conexión global.
//
// max/idleTimeoutMillis chicos a propósito: en Vercel cada invocación
// serverless puede terminar creando su propio Pool (no hay un único proceso
// de larga vida como en un server tradicional), y encima getEstadisticas
// dispara varias queries en paralelo con Promise.all - sin un techo bajo acá,
// entre varias instancias sueltas se llega rápido al límite del pooler de
// Supabase (ver DB_PORT: con el session pooler ese límite es un tope duro de
// conexiones simultáneas). Un pool chico por instancia, que además libera
// las conexiones idle casi al toque, dejan mucho más margen.
export const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 5000,
});

// El pool emite "error" cuando una conexión inactiva se corta del lado del
// servidor (por ejemplo, el pooler de Supabase cerrando clientes idle).
// Sin este listener, ese evento queda sin manejar y tira abajo todo el proceso.
db.on("error", (error) => {
  console.error("Error inesperado en una conexión inactiva del pool:", error);
});

export async function conectarDB() {
  try {
    // Verifica que se pueda establecer conexión contra la DB.
    const client = await db.connect();
    client.release();
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
}
