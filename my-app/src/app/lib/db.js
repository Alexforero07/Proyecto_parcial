import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
export async function query(text, params) {
  return pool
    .query(text, params)
    .then((res) => res)
    .catch((err) => err);
}           