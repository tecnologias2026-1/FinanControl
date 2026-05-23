// ============================================
// FINAN CONTROL — GRUPOS
// ============================================

const supabaseClient = window.supabaseClient;

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const tablaBody      = document.getElementById("tablaBody");
const groupTag       = document.getElementById("groupTag");
const listaMiembros  = document.getElementById("listaMiembros");
const selectGrupo    = document.getElementById("gasto-grupo");

let grupoSeleccionadoId = null;
let gruposDelUsuario    = [];   // cache de grupos cargados

// ============================================
// ✅ FIX 1 — FECHA DINÁMICA
// ============================================

(function actualizarFecha() {
    const el = document.getElementById("today-date");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        year:    "numeric",
        month:   "long",
        day:     "numeric"
    });
})();

// ============================================
// MOSTRAR DATOS DEL USUARIO
// ============================================

(function mostrarUsuario() {
    const usuario = JSON.parse(
        localStorage.getItem("usuarioActual") ||
        localStorage.getItem("usuarioLogueado") ||
        "null"
    );

    if (!usuario) return;

    const nombre = usuario.nombre || usuario.fullName || "Usuario";
    const correo = usuario.correo || usuario.email  || "usuario@email.com";
    const inicial = nombre.charAt(0).toUpperCase();

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setTxt("nombreUsuario",  nombre);
    setTxt("correoUsuario",  correo);
    setTxt("saludoUsuario",  `Hola ${nombre}!`);
    setTxt("sidebarAvatar",  inicial);
    setTxt("topbarAvatar",   inicial);
})();

// ============================================
// CERRAR SESIÓN
// ============================================

function cerrarSesion() {
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("usuarioLogueado");
    window.location.href = "index.html";
}

// ============================================
// CREAR GRUPO
// ============================================

async function crearGrupo() {
    const nombre      = document.getElementById("g-nombre").value.trim();
    const descripcion = document.getElementById("g-desc").value.trim();
    const invitados   = document.getElementById("g-email").value.trim();
    const rolSeleccionado = document.querySelector('input[name="rol-crear"]:checked').value;

    const usuarioActual = JSON.parse(
        localStorage.getItem("usuarioActual") ||
        localStorage.getItem("usuarioLogueado") ||
        "null"
    );

    if (!usuarioActual) { alert("No hay usuario en sesión"); return; }
    if (!nombre)        { alert("Ingresa el nombre del grupo"); return; }

    const { error } = await supabaseClient
        .from("GRUPOS")
        .insert([{
            Nombre:      nombre,
            Rol:         rolSeleccionado,
            usuario_id:  usuarioActual.id,
            Descripcion: descripcion,
            Invitados:   invitados
        }]);

    if (error) { console.error(error); alert(error.message); return; }

    document.getElementById("g-nombre").value = "";
    document.getElementById("g-desc").value   = "";
    document.getElementById("g-email").value  = "";

    closeModal("modalCrear");
    await cargarGrupos();
}

// ============================================
// CARGAR GRUPOS
// ============================================

async function cargarGrupos() {
    const usuarioActual = JSON.parse(
        localStorage.getItem("usuarioActual") ||
        localStorage.getItem("usuarioLogueado") ||
        "null"
    );

    if (!usuarioActual) return;

    const { data, error } = await supabaseClient
        .from("GRUPOS")
        .select("*")
        .eq("usuario_id", usuarioActual.id)
        .order("created_at", { ascending: false });

    if (error) { console.error(error); return; }

    gruposDelUsuario = data || [];

    mostrarGrupos(gruposDelUsuario);
    poblarSelectorGrupos(gruposDelUsuario);
    poblarDatalistMiembros(gruposDelUsuario);
    await cargarFinanzasGrupo(gruposDelUsuario);
}

// ============================================
// MOSTRAR GRUPOS EN TABLA
// ============================================

function mostrarGrupos(grupos) {
    tablaBody.innerHTML = "";

    if (!grupos || grupos.length === 0) {
        if (groupTag) groupTag.textContent = "";
        tablaBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px">
                    No tienes grupos creados aún
                </td>
            </tr>`;
        return;
    }

    if (groupTag) groupTag.textContent = grupos[0].Nombre;

    grupos.forEach((grupo) => {
        const iniciales  = grupo.Nombre.substring(0, 2).toUpperCase();
        const rolTexto   = grupo.Rol === "admin" ? "Administrador" : "Miembro";
        const badgeClase = grupo.Rol === "admin"  ? "badge-admin"   : "badge-member";

        tablaBody.innerHTML += `
            <tr>
                <td>
                    <div class="member-name-cell">
                        <div class="member-avatar av-blue">${iniciales}</div>
                        <span class="member-name">${grupo.Nombre}</span>
                    </div>
                </td>
                <td><span class="${badgeClase}">● ${rolTexto}</span></td>
                <td>${grupo.Invitados || "Sin invitados"}</td>
                <td>
                    <div class="actions-cell">
                        <button class="icon-btn edit"
                                onclick="abrirEditarRol(${grupo.id}, '${grupo.Rol}')"
                                aria-label="Cambiar rol">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="icon-btn del"
                                onclick="abrirEliminarGrupo(${grupo.id})"
                                aria-label="Eliminar grupo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>`;
    });
}

// ============================================
// ✅ NUEVO — POBLAR SELECTOR DE GRUPOS EN MODAL
// ============================================

function poblarSelectorGrupos(grupos) {
    if (!selectGrupo) return;
    selectGrupo.innerHTML = "";

    if (!grupos || grupos.length === 0) {
        selectGrupo.innerHTML = '<option value="">Sin grupos disponibles</option>';
        return;
    }

    grupos.forEach(g => {
        const opt = document.createElement("option");
        opt.value       = g.id;
        opt.textContent = g.Nombre;
        selectGrupo.appendChild(opt);
    });

    // Ocultar el selector si solo hay un grupo
    const wrap = document.getElementById("selectorGrupoWrap");
    if (wrap) wrap.style.display = grupos.length <= 1 ? "none" : "block";
}

// ============================================
// ✅ NUEVO — POBLAR DATALIST DE MIEMBROS
// (sugerencias = nombres de los grupos del usuario)
// ============================================

function poblarDatalistMiembros(grupos) {
    if (!listaMiembros) return;
    listaMiembros.innerHTML = "";

    const vistos = new Set();
    grupos.forEach(g => {
        if (g.Nombre && !vistos.has(g.Nombre)) {
            vistos.add(g.Nombre);
            const opt = document.createElement("option");
            opt.value = g.Nombre;
            listaMiembros.appendChild(opt);
        }
    });
}

// ============================================
// MODAL — EDITAR ROL
// ============================================

function abrirEditarRol(id, rolActual) {
    grupoSeleccionadoId = id;
    document.querySelectorAll('input[name="rol-cambiar"]').forEach(input => {
        input.checked = input.value === rolActual;
        input.closest(".role-option").classList.toggle("selected", input.value === rolActual);
    });
    openModal("modalRol");
}

async function guardarCambioRol() {
    const nuevoRol = document.querySelector('input[name="rol-cambiar"]:checked').value;
    if (!grupoSeleccionadoId) { alert("No se seleccionó ningún grupo"); return; }

    const { error } = await supabaseClient
        .from("GRUPOS")
        .update({ Rol: nuevoRol })
        .eq("id", grupoSeleccionadoId);

    if (error) { console.error(error); alert(error.message); return; }

    closeModal("modalRol");
    grupoSeleccionadoId = null;
    await cargarGrupos();
}

// ============================================
// MODAL — ELIMINAR GRUPO
// ============================================

function abrirEliminarGrupo(id) {
    grupoSeleccionadoId = id;
    openModal("modalEliminar");
}

async function confirmarEliminarGrupo() {
    if (!grupoSeleccionadoId) { alert("No se seleccionó ningún grupo"); return; }

    // Eliminar también los gastos asociados
    await supabaseClient
        .from("GASTOS_GRUPO")
        .delete()
        .eq("grupo_id", grupoSeleccionadoId);

    const { error } = await supabaseClient
        .from("GRUPOS")
        .delete()
        .eq("id", grupoSeleccionadoId);

    if (error) { console.error(error); alert(error.message); return; }

    closeModal("modalEliminar");
    grupoSeleccionadoId = null;
    await cargarGrupos();
}

// ============================================
// ✅ NUEVO — REGISTRAR GASTO FAMILIAR
// ============================================

async function registrarGastoFamiliar() {
    const descripcion = document.getElementById("gasto-desc").value.trim();
    const montoRaw    = document.getElementById("gasto-monto").value.trim();
    const miembro     = document.getElementById("gasto-miembro").value.trim();
    const tipo        = document.querySelector('input[name="gasto-tipo"]:checked').value;
    const grupoId     = selectGrupo ? Number(selectGrupo.value) : (gruposDelUsuario[0]?.id || null);

    const usuarioActual = JSON.parse(
        localStorage.getItem("usuarioActual") ||
        localStorage.getItem("usuarioLogueado") ||
        "null"
    );

    if (!usuarioActual)   { alert("No hay usuario en sesión"); return; }
    if (!descripcion)     { alert("Ingresa una descripción");  return; }
    if (!montoRaw || isNaN(Number(montoRaw)) || Number(montoRaw) <= 0) {
        alert("Ingresa un monto válido"); return;
    }
    if (!miembro)         { alert("Indica quién realizó este movimiento"); return; }
    if (!grupoId)         { alert("No hay ningún grupo disponible"); return; }

    const { error } = await supabaseClient
        .from("GASTOS_GRUPO")
        .insert([{
            grupo_id:       grupoId,
            usuario_id:     usuarioActual.id,
            miembro_nombre: miembro,
            tipo:           tipo,
            monto:          Number(montoRaw),
            descripcion:    descripcion
        }]);

    if (error) { console.error(error); alert(error.message); return; }

    // Limpiar campos
    document.getElementById("gasto-desc").value    = "";
    document.getElementById("gasto-monto").value   = "";
    document.getElementById("gasto-miembro").value = "";

    closeModal("modalGasto");
    await cargarFinanzasGrupo(gruposDelUsuario);
}

// ============================================
// ✅ NUEVO — CARGAR Y MOSTRAR FINANZAS DEL GRUPO
// ============================================

async function cargarFinanzasGrupo(grupos) {
    if (!grupos || grupos.length === 0) {
        actualizarResumenFinanciero(0, 0, {});
        return;
    }

    const grupoIds = grupos.map(g => g.id);

    const { data: gastos, error } = await supabaseClient
        .from("GASTOS_GRUPO")
        .select("*")
        .in("grupo_id", grupoIds);

    if (error) { console.error(error); return; }

    let totalIngresos = 0;
    let totalGastos   = 0;
    const statsPorMiembro = {};   // { "Nombre": { ingresos, gastos } }

    (gastos || []).forEach(g => {
        const monto = Number(g.monto);
        const clave = g.miembro_nombre || "Sin nombre";

        if (!statsPorMiembro[clave]) {
            statsPorMiembro[clave] = { ingresos: 0, gastos: 0 };
        }

        if (g.tipo === "ingreso") {
            totalIngresos += monto;
            statsPorMiembro[clave].ingresos += monto;
        } else {
            totalGastos  += monto;
            statsPorMiembro[clave].gastos  += monto;
        }
    });

    actualizarResumenFinanciero(totalIngresos, totalGastos, statsPorMiembro);
}

// ============================================
// ACTUALIZAR EL RESUMEN FINANCIERO EN LA UI
// ============================================

function actualizarResumenFinanciero(ingresos, gastos, statsPorMiembro) {
    const balance = ingresos - gastos;
    const maxVal  = Math.max(ingresos, gastos, 1);

    const fmt = (n) => `$ ${Math.abs(n).toLocaleString("es-CO")}`;

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setW   = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = pct + "%"; };

    setTxt("fs-ingresos", fmt(ingresos));
    setTxt("fs-gastos",   fmt(gastos));
    setTxt("fs-balance",  (balance >= 0 ? "$ " : "-$ ") + Math.abs(balance).toLocaleString("es-CO"));

    setW("bar-ingresos", (ingresos / maxVal) * 100);
    setW("bar-gastos",   (gastos   / maxVal) * 100);

    // Color del balance
    const elBal = document.getElementById("fs-balance");
    if (elBal) elBal.style.color = balance >= 0 ? "#fff" : "#fca5a5";

    // ✅ Renderizar tarjetas por miembro (sin <ul>/<li>, usando <div>)
    renderMemberCards(statsPorMiembro);
}

// ============================================
// ✅ RENDERIZAR TARJETAS POR MIEMBRO
//    (sin <ul>/<li> → sin viñetas)
// ============================================

const AVATAR_COLORS = ["av-blue", "av-green", "av-purple", "av-orange"];

function renderMemberCards(statsPorMiembro) {
    const grid = document.getElementById("memberFinanceGrid");
    if (!grid) return;

    const miembros = Object.keys(statsPorMiembro);

    if (miembros.length === 0) {
        grid.innerHTML = `
            <div style="padding:20px;color:var(--text-muted);font-size:.84rem;grid-column:1/-1">
                Sin movimientos registrados aún.
            </div>`;
        return;
    }

    grid.innerHTML = miembros.map((nombre, i) => {
        const stats   = statsPorMiembro[nombre];
        const neto    = stats.ingresos - stats.gastos;
        const iniciales = nombre.substring(0, 2).toUpperCase();
        const avClass   = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const fmt = (n) => `$ ${Math.abs(n).toLocaleString("es-CO")}`;
        const netoColor = neto >= 0 ? "#22c55e" : "#ef4444";

        return `
        <div class="mf-card">
            <div class="mf-header">
                <div class="member-avatar ${avClass}" style="width:28px;height:28px;font-size:10px">${iniciales}</div>
                <div>
                    <p class="mf-name">${nombre}</p>
                    <p class="mf-role">Integrante</p>
                </div>
            </div>
            <div class="mf-row">
                <span class="mf-row-label">Ingresos</span>
                <span class="mf-row-val pos">${fmt(stats.ingresos)}</span>
            </div>
            <div class="mf-row">
                <span class="mf-row-label">Gastos</span>
                <span class="mf-row-val neg">${fmt(stats.gastos)}</span>
            </div>
            <hr class="mf-divider"/>
            <div class="mf-row">
                <span class="mf-balance">Neto</span>
                <span class="mf-balance-val" style="color:${netoColor}">${fmt(neto)}</span>
            </div>
        </div>`;
    }).join("");
}

// ============================================
// INIT — DOMContentLoaded
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    // Botón crear grupo
    const btnCrear = document.getElementById("btnCrearGrupo");
    if (btnCrear) btnCrear.onclick = crearGrupo;

    // Botón guardar rol
    const btnRol = document.getElementById("btnGuardarRol");
    if (btnRol) btnRol.onclick = guardarCambioRol;

    // Botón confirmar eliminar
    const btnEliminar = document.getElementById("btnEliminarGrupo");
    if (btnEliminar) btnEliminar.onclick = confirmarEliminarGrupo;

    // ✅ Botón registrar gasto
    const btnGasto = document.getElementById("btnRegistrarGasto");
    if (btnGasto) btnGasto.onclick = registrarGastoFamiliar;

    // Cargar todo
    cargarGrupos();
});
