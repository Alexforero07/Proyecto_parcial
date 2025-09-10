import { query } from "../../lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM tienda_app.clientes ORDER BY id DESC"
    );

    return new Response(JSON.stringify(result.rows), {
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


export async function POST(req) {
  try {
    const { nombre, email, telefono, direccion } = await req.json();

    // Validación básica
    if (!nombre || !email) {
      return new Response(
        JSON.stringify({ error: "Nombre y correo son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await query(
      "INSERT INTO tienda_app.clientes (nombre, email, telefono, direccion) VALUES ($1,$2,$3,$4) RETURNING *",
      [nombre, email, telefono || null, direccion || null]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 🚀 PUT → actualizar cliente
export async function PUT(req) {
  try {
    const { id, nombre, email, telefono, direccion } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "El ID del cliente es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await query(
      `UPDATE tienda_app.clientes
       SET nombre=$1, email=$2, telefono=$3, direccion=$4
       WHERE id=$5
       RETURNING *`,
      [nombre, email, telefono || null, direccion || null, id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cliente no encontrado" }),
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

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "El ID del cliente es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
      JSON.stringify({ message: "Cliente eliminado correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
