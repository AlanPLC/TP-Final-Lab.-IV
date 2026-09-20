import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Pool de conexiones a Postgres (Supabase). Reemplaza la única conexión
// mysql2 que había antes: con un pool, cada request toma una conexión libre
// y la devuelve al terminar, en vez de compartir una sola conexión global.
export const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
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
