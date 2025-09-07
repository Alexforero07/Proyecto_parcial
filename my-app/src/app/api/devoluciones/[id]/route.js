import { query } from "../../../lib/db";

// 🚀 DELETE → eliminar devolución
export async function DELETE(req, context) {
  const { id } = context.params; // ✅ obtener id de la URL

  if (!id) {
    return new Response(
      JSON.stringify({ error: "El ID de la devolución es obligatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await query(
      "DELETE FROM tienda_app.devoluciones WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Devolución no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Devolución eliminada correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
