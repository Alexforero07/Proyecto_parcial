import pool from "../../lib/db"; 

export async function POST(req, res) {
  try {
    const { email, password } = await req.json();

    // Verificar que los datos existan
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email y password son requeridos" }), { status: 400 });
    }

    // Buscar usuario en la tabla tienda_app.usuarios
    const result = await pool.query(
      "SELECT id, nombre, email, rol, password FROM tienda_app.usuarios WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Credenciales incorrectas" }), { status: 401 });
    }

    const user = result.rows[0];

    // Crear un "token" simple (solo para demo, no JWT)
    const token = Math.random().toString(36).substr(2);

    // Retornar info del usuario al frontend
    return new Response(
      JSON.stringify({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        token
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error en el servidor" }), { status: 500 });
  }
}
