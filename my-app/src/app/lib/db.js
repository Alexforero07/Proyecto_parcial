import { Pool } from "pg"; // Importa el cliente de PostgreSQL

// Configuracion de la conexión a la base de datos

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de tu DB en .env.local
});

export default pool; // Exporta el pool para usarlo en tus APIs

export async function query(text, params) {
  return pool.query(text, params); 
}
