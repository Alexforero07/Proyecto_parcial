"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("clientes");
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [loginForm, setLoginForm] = useState({});

  // Cargar datos al cambiar de pestaña
  useEffect(() => {
    if (!user) return;
    setError(null);
    fetch(`/api/${tab}`)
      .then(res => res.json())
      .then(resp => {
        if (Array.isArray(resp)) setData(resp);
        else {
          setData([]);
          if (resp.error) setError(resp.error);
        }
      })
      .catch(() => {
        setData([]);
        setError("Error al cargar los datos");
      });
  }, [tab, user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeLogin = e => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  // Login
  const handleLogin = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const result = await res.json();
      if (res.ok) {
        setUser(result);
        setLoginForm({});
      } else {
        setError(result.error || "Error en login");
      }
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  // Enviar formulario
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Validación de permisos
    if (user.rol === "empleado" && tab === "devoluciones") {
      setError("No tienes permisos para registrar devoluciones.");
      return;
    }

    // Validaciones por tab
    if (tab === "devoluciones") {
      if (!form.pedido_id || !form.producto_id || !form.cantidad || form.cantidad <= 0) {
        setError("Debes completar todos los campos y la cantidad debe ser mayor que 0");
        return;
      }
    }

    if (tab === "pedidos") {
      if (!form.cliente_id || !form.items || form.items.length === 0) {
        setError("Debes seleccionar al menos un producto y cantidad");
        return;
      }
      // Transformar items en arrays de productos y cantidades
      form.productos = form.items.map(i => Number(i.producto_id));
      form.cantidades = form.items.map(i => Number(i.cantidad));
      delete form.items;
    }

    try {
      const res = await fetch(`/api/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (res.ok) {
        setForm({});
        const updated = await fetch(`/api/${tab}`);
        const dataJson = await updated.json();
        setData(Array.isArray(dataJson) ? dataJson : []);
      } else {
        setError(result.error || "Error al guardar");
      }
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  // Eliminar registro (solo admin)
  const handleDelete = async id => {
    if (user.rol !== "admin") return alert("Solo admins pueden eliminar");
    if (!confirm(`¿Seguro que quieres eliminar el registro ${id}?`)) return;
    try {
      const res = await fetch(`/api/${tab}/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setData(data.filter(d => d.id !== id));
        alert(result.message);
      } else alert(result.error || "Error al eliminar");
    } catch {
      alert("Error al conectar con el servidor");
    }
  };

  const handleLogout = () => setUser(null);

  // Agregar producto en pedidos
  const addItem = () => setForm({ ...form, items: [...(form.items || []), { producto_id: "", cantidad: "" }] });
  const handleItemChange = (index, field, value) => {
    const newItems = [...(form.items || [])];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  // Render login
  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-2">
          <input name="email" placeholder="Correo" value={loginForm.email || ""} onChange={handleChangeLogin} className="border p-2 w-full" />
          <input name="password" type="password" placeholder="Contraseña" value={loginForm.password || ""} onChange={handleChangeLogin} className="border p-2 w-full" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Ingresar</button>
        </form>
      </div>
    );
  }

  // Render principal
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Negocio</h1>
        <div>
          <span className="mr-4 font-semibold">Usuario: {user.nombre} ({user.rol})</span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">SALIR</button>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="flex justify-center space-x-4 mb-6">
        {["clientes", "productos", "pedidos", "devoluciones"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}

      {/* Formulario dinámico */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        {tab === "clientes" && (
          <>
            <input name="nombre" placeholder="Nombre" value={form.nombre || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="email" placeholder="Correo" value={form.email || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="telefono" placeholder="Teléfono" value={form.telefono || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="direccion" placeholder="Dirección" value={form.direccion || ""} onChange={handleChange} className="border p-2 w-full" />
          </>
        )}

        {tab === "productos" && (
          <>
            <input name="nombre" placeholder="Nombre del producto" value={form.nombre || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="precio" type="number" placeholder="Precio" value={form.precio || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="stock" type="number" placeholder="Inventario" value={form.stock || ""} onChange={handleChange} className="border p-2 w-full" />
          </>
        )}

        {tab === "pedidos" && (
          <>
            <input name="cliente_id" type="number" placeholder="ID Cliente" value={form.cliente_id || ""} onChange={handleChange} className="border p-2 w-full" />
            {(form.items || []).map((item, i) => (
              <div key={i} className="flex space-x-2 mb-1">
                <input name="producto_id" type="number" placeholder="ID Producto" value={item.producto_id || ""} onChange={e => handleItemChange(i, "producto_id", e.target.value)} className="border p-2 w-1/2" />
                <input name="cantidad" type="number" placeholder="Cantidad" value={item.cantidad || ""} onChange={e => handleItemChange(i, "cantidad", e.target.value)} className="border p-2 w-1/2" />
              </div>
            ))}
            <button type="button" onClick={addItem} className="bg-gray-300 px-3 py-1 rounded">Agregar producto</button>
          </>
        )}

        {tab === "devoluciones" && (
          <>
            <input name="pedido_id" type="number" placeholder="ID Pedido" value={form.pedido_id || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="producto_id" type="number" placeholder="ID Producto" value={form.producto_id || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="cantidad" type="number" placeholder="Cantidad" value={form.cantidad || ""} onChange={handleChange} className="border p-2 w-full" />
            <input name="motivo" placeholder="Motivo" value={form.motivo || ""} onChange={handleChange} className="border p-2 w-full" />
          </>
        )}


        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${user.rol === "empleado" && tab === "devoluciones" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"}`}
          disabled={user.rol === "empleado" && tab === "devoluciones"}
        >
          Guardar
        </button>
      </form>

      {/* Tabla de datos */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-300">
              {Array.isArray(data) && data.length > 0 &&
                Object.keys(data[0]).map(key => <th key={key} className="border px-2 py-1">{key}</th>)
              }
              {user.rol === "admin" && <th className="border px-2 py-1">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.map((row, idx) => (
              <tr key={idx} className="odd:bg-gray-100">
                {Object.values(row).map((val, i) => <td key={i} className="border px-2 py-1">{val}</td>)}
                {user.rol === "admin" && (
                  <td className="border px-2 py-1">
                    <button onClick={() => handleDelete(row.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {Array.isArray(data) && data.length === 0 && <p className="mt-2 text-center text-gray-500">No hay datos</p>}
      </div>
    </div>
  );
}
