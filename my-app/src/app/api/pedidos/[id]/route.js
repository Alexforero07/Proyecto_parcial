import pool from "../../../lib/db"; // asegúrate de que esta ruta funcione según tu proyecto

export async function DELETE(req, { params }) {
  const { id } = params; // tomamos el id desde la URL

  try {
    const result = await pool.query(
      "DELETE FROM tienda_app.pedidos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Pedido no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Pedido eliminado correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
