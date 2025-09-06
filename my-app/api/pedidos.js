import { query } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { cliente_id, total } = req.body;

      // Llamar al PROCEDURE registrar_pedido definido en schema.sql
      await query("CALL registrar_pedido($1, $2)", [cliente_id, total]);

      res.status(201).json({ message: "Pedido registrado exitosamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await query("SELECT * FROM pedidos ORDER BY id DESC", []);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
