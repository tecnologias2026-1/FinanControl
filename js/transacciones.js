async function saveTransaction() {
  const fecha = document.getElementById("newFecha").value;
  const tipo = document.getElementById("newTipo").value;
  const cat = document.getElementById("newCat").value;
  const monto = document.getElementById("newMonto").value;
  const desc = document.getElementById("newDesc").value.trim();

  if (!fecha || !tipo || !cat || !monto || !desc) {
    alert("Completa todos los campos.");
    return;
  }

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioLogueado"));

  if (!usuarioGuardado) {
    alert("No hay usuario logueado.");
    window.location.href = "Iniciar.html";
    return;
  }

  const correoUsuario = usuarioGuardado.correo || usuarioGuardado.email;

  const { data: usuarioData, error: usuarioError } = await supabaseClient
    .from("USUARIOS")
    .select("id")
    .ilike("correo", correoUsuario)
    .limit(1)
    .single();

  if (usuarioError) {
    console.error("ERROR USUARIO:", usuarioError);
    alert("No se encontró el usuario en la tabla USUARIOS.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("TRANSACCIONES")
    .insert([
      {
        Tipo: tipo,
        "Categoría": cat,
        Monto: Number(monto),
        Descripcion: desc,
        Fecha: fecha,
        usuario_id: usuarioData.id
      }
    ])
    .select();

  if (error) {
    console.error("ERROR INSERT TRANSACCION:", error);
    alert("Error guardando transacción: " + error.message);
    return;
  }

  const p = fecha.split("-");
  const fechaFmt = `${p[2]}/${p[1]}/${p[0].slice(2)}`;
  const montoFmt = `$${Number(monto).toLocaleString("es-CO")}`;

  const mesesData = {
    "03": "marzo",
    "04": "abril",
    "05": "mayo"
  };

  const mesDestino = mesesData[p[1]];

  if (!mesDestino) {
    alert("Ese mes no existe en la tabla.");
    return;
  }

  document
    .querySelector(`.month-block[data-mes='${mesDestino}'] tbody`)
    .insertAdjacentHTML(
      "afterbegin",
      buildRow(tipo, cat, fechaFmt, montoFmt, desc, data[0].id)
    );

  document
    .querySelector(`.month-block[data-mes='${mesDestino}']`)
    .classList.add("open");

  document.getElementById("newFecha").value = "";
  document.getElementById("newMonto").value = "";
  document.getElementById("newDesc").value = "";

  closeModal();

  alert("Transacción guardada correctamente.");
}

async function cargarTransaccionesDesdeSupabase() {
  const { data, error } = await supabaseClient
    .from("TRANSACCIONES")
    .select("*")
    .order("Fecha", { ascending: false });

  if (error) {
    console.error("Error cargando transacciones:", error);
    return;
  }

  data.forEach((t) => {
    const fecha = t.Fecha;
    const p = fecha.split("-");
    const fechaFmt = `${p[2]}/${p[1]}/${p[0].slice(2)}`;
    const montoFmt = `$${Number(t.Monto).toLocaleString("es-CO")}`;

    const mesesData = {
      "03": "marzo",
      "04": "abril",
      "05": "mayo"
    };

    const mesDestino = mesesData[p[1]];

    if (!mesDestino) return;

    document
      .querySelector(`.month-block[data-mes='${mesDestino}'] tbody`)
      .insertAdjacentHTML(
        "beforeend",
        buildRow(
          t.Tipo,
          t["Categoría"],
          fechaFmt,
          montoFmt,
          t.Descripcion,
          t.id
        )
      );
  });
}

document.addEventListener("DOMContentLoaded", cargarTransaccionesDesdeSupabase);
