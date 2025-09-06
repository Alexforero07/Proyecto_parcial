import { query } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { pedido_id, motivo } = req.body;
      await query("INSERT INTO devoluciones (pedido_id, motivo) VALUES ($1, $2)", [pedido_id, motivo]);
      res.status(201).json({ message: "Devolución registrada exitosamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await query("SELECT * FROM devoluciones ORDER BY id DESC", []);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
