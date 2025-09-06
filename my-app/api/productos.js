import { query } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { nombre, precio, stock } = req.body;
      await query("INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3)", [nombre, precio, stock]);
      res.status(201).json({ message: "Producto agregado exitosamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await query("SELECT * FROM productos ORDER BY id DESC", []);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
