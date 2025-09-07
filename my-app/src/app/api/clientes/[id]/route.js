import { query } from "../../../lib/db"; // Ajusta la ruta según tu proyecto

export async function DELETE(req, { params }) {
  const { id } = params; // Recibe id de la URL

  if (!id) {
    return new Response(
      JSON.stringify({ error: "El ID del cliente es obligatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await query(
      "DELETE FROM tienda_app.clientes WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cliente no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: `Cliente ${id} eliminado correctamente` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
