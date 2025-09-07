import { query } from "../../../lib/db";

// 🚀 PUT → actualizar producto
export async function PUT(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "El ID del producto es obligatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { nombre, precio, stock } = await req.json();

    const result = await query(
      `UPDATE tienda_app.productos
       SET nombre=$1, precio=$2, stock=$3
       WHERE id=$4
       RETURNING *`,
      [nombre, precio, stock, id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Producto no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 🚀 DELETE → eliminar producto
export async function DELETE(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "El ID del producto es obligatorio" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = await query(
      "DELETE FROM tienda_app.productos WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Producto no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Producto eliminado correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
