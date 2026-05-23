// =========================
// METAS.JS
// =========================

const supabaseClient = window.supabaseClient;

const kpiAmounts = document.querySelectorAll(".kpi-card__amount");
const kpiChanges = document.querySelectorAll(".kpi-card__change");

const inputMeta = document.getElementById("nombreMeta");
const inputObjetivo = document.getElementById("valorMeta");
const inputInicial = document.getElementById("montoInicial");
const inputFecha = document.getElementById("fechaMeta");

const botonMeta = document.getElementById("agregarMetaBtn");

const featuredGrid = document.querySelector(".featured-grid");
const allGrid = document.querySelector(".all-grid");

let metaEditando = null;

// =========================
// FECHA SUPERIOR
// =========================

const fechaHoy = new Date();

document.getElementById("today-date").textContent =
    fechaHoy.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

// =========================
// MODAL
// =========================

function openModal(id) {
    const modal = document.getElementById(id);

    modal.classList.add("open");
    modal.style.display = "flex";
}

function closeModal(id) {
    const modal = document.getElementById(id);

    modal.classList.remove("open");
    modal.style.display = "none";

    limpiarFormulario();
}

function limpiarFormulario() {
    inputMeta.value = "";
    inputObjetivo.value = "";
    inputInicial.value = "";
    inputFecha.value = "";

    metaEditando = null;

    botonMeta.textContent = "Guardar Meta";
}

// =========================
// GUARDAR / EDITAR META
// =========================

if (botonMeta) {
    botonMeta.addEventListener("click", guardarMeta);
}

async function guardarMeta() {

    const nombre = inputMeta.value.trim();
    const objetivo = parseFloat(inputObjetivo.value);
    const inicial = parseFloat(inputInicial.value) || 0;
    const fecha = inputFecha.value || null;

    const usuarioLogueado = JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    if (!usuarioLogueado) {
        alert("No hay usuario en sesión");
        return;
    }

    if (nombre === "" || isNaN(objetivo)) {
        alert("Completa todos los campos");
        return;
    }

    const correoUsuario =
        usuarioLogueado.correo || usuarioLogueado.email;

    const { data: usuarioData, error: usuarioError } =
        await supabaseClient
            .from("USUARIOS")
            .select("id")
            .ilike("correo", correoUsuario)
            .limit(1)
            .single();

    if (usuarioError) {
        console.error(usuarioError);
        alert("No se encontró el usuario");
        return;
    }

    // =========================
    // EDITAR
    // =========================

    if (metaEditando) {

        const { error } = await supabaseClient
            .from("METAS")
            .update({
                Nombre: nombre,
                Monto_Objetivo: objetivo,
                Monto_Actual: inicial,
                Fecha_Limite: fecha
            })
            .eq("id", metaEditando);

        if (error) {
            console.error(error);
            alert("Error editando meta");
            return;
        }

        alert("Meta actualizada");

    } else {

        // =========================
        // CREAR
        // =========================

        const { error } = await supabaseClient
            .from("METAS")
            .insert([
                {
                    Nombre: nombre,
                    Monto_Objetivo: objetivo,
                    Monto_Actual: inicial,
                    Fecha_Limite: fecha,
                    usuario_id: usuarioData.id
                }
            ]);

        if (error) {
            console.error(error);
            alert("Error guardando meta");
            return;
        }

        alert("Meta creada");
    }

    closeModal("modalCrear");

    cargarMetas();
}

// =========================
// CARGAR METAS
// =========================

async function cargarMetas() {

    const usuarioLogueado = JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    if (!usuarioLogueado) {
        console.warn("No hay usuario");
        return;
    }

    const correoUsuario =
        usuarioLogueado.correo || usuarioLogueado.email;

    const { data: usuarioData } =
        await supabaseClient
            .from("USUARIOS")
            .select("id")
            .ilike("correo", correoUsuario)
            .limit(1)
            .single();

    if (!usuarioData) return;

    const { data, error } = await supabaseClient
        .from("METAS")
        .select("*")
        .eq("usuario_id", usuarioData.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    mostrarMetas(data);
}

// =========================
// MOSTRAR METAS
// =========================

function mostrarMetas(metas) {

    featuredGrid.innerHTML = "";
    allGrid.innerHTML = "";

    actualizarKPIs(metas);

    if (!metas || metas.length === 0) {

        featuredGrid.innerHTML = `
            <article class="goal-card">
                <p class="goal-name">Sin metas activas</p>
                <p class="goal-date">
                    Crea tu primera meta financiera
                </p>
            </article>
        `;

        allGrid.innerHTML = `
            <article class="mini-card">
                <p class="mini-name">
                    No hay metas registradas
                </p>
            </article>
        `;

        return;
    }

    metas.forEach((meta) => {

        const objetivo = Number(meta.Monto_Objetivo);
        const actual = Number(meta.Monto_Actual);

        const porcentaje =
            objetivo > 0
                ? (actual / objetivo) * 100
                : 0;

        const restante = objetivo - actual;

        let fechaBonita = "Sin fecha";

        if (meta.Fecha_Limite) {

            const p = meta.Fecha_Limite.split("-");

            fechaBonita =
                `${p[2]}/${p[1]}/${p[0]}`;
        }

        featuredGrid.innerHTML += `
            <article class="goal-card">

                <div class="goal-card-header">

                    <div class="goal-card__left">

                        <div class="goal-icon-wrap goal-icon-wrap--blue">
                            🎯
                        </div>

                        <div class="goal-meta">

                            <p class="goal-name">
                                ${meta.Nombre}
                            </p>

                            <p class="goal-date">
                                Fecha límite: ${fechaBonita}
                            </p>

                        </div>

                    </div>

                </div>

                <p class="goal-amount">
                    $${objetivo.toLocaleString("es-CO")}
                </p>

                <div class="goal-labels">
                    <span>Meta total</span>
                    <span class="pct">
                        ${porcentaje.toFixed(0)}%
                    </span>
                </div>

                <div class="progress-bar-bg">

                    <div
                        class="progress-bar-fill"
                        style="width:${Math.min(porcentaje, 100)}%">
                    </div>

                </div>

                <div class="goal-footer">

                    <div class="goal-footer-item">
                        <span class="label">
                            Monto ahorrado
                        </span>

                        <strong>
                            $${actual.toLocaleString("es-CO")}
                        </strong>
                    </div>

                    <div class="goal-footer-item">

                        <span class="label">
                            Falta
                        </span>

                        <strong>
                            $${restante.toLocaleString("es-CO")}
                        </strong>

                    </div>

                </div>

                <div class="goal-actions">

                    <button
                        onclick="editarMeta(
                            ${meta.id},
                            '${meta.Nombre}',
                            ${meta.Monto_Objetivo},
                            ${meta.Monto_Actual},
                            '${meta.Fecha_Limite || ""}'
                        )"
                        class="btn-secondary">

                        Editar

                    </button>

                    <button
                        onclick="abrirModalEliminarMeta(${meta.id}, '${meta.Nombre}')"
                        class="btn-delete-meta">
                        Eliminar
                    </button>

                </div>

            </article>
        `;

        allGrid.innerHTML += `
            <article class="mini-card">

                <div class="mini-card-header">

                    <span class="mini-icon">
                        🎯
                    </span>

                    <p class="mini-name">
                        ${meta.Nombre}
                    </p>

                </div>

                <p class="mini-amount">
                    $${objetivo.toLocaleString("es-CO")}
                </p>

                <p class="mini-pct">

                    <span class="pct-val">
                        ${porcentaje.toFixed(0)}% del progreso
                    </span>

                </p>

            </article>
        `;
    });
}

// =========================
// EDITAR META
// =========================

function editarMeta(id, nombre, objetivo, actual, fecha) {

    metaEditando = id;

    inputMeta.value = nombre;
    inputObjetivo.value = objetivo;
    inputInicial.value = actual;
    inputFecha.value = fecha;

    botonMeta.textContent = "Actualizar Meta";

    openModal("modalCrear");
}

// =========================
// ELIMINAR META
// =========================
let metaParaEliminar = null;

function abrirModalEliminarMeta(id, nombre) {
    metaParaEliminar = id;

    document.getElementById("nombreMetaEliminar").textContent = nombre;

    openModal("modalEliminarMeta");
}

async function confirmarEliminarMeta() {
    if (!metaParaEliminar) return;

    const { error } = await supabaseClient
        .from("METAS")
        .delete()
        .eq("id", metaParaEliminar);

    if (error) {
        console.error(error);
        alert("Error eliminando meta");
        return;
    }

    metaParaEliminar = null;

    closeModal("modalEliminarMeta");

    cargarMetas();
}
// =========================
// KPIS
// =========================

function actualizarKPIs(metas) {

    if (!metas || metas.length === 0) {

        kpiAmounts[0].textContent = "0";
        kpiAmounts[1].textContent = "$0";
        kpiAmounts[2].textContent = "Sin metas";
        kpiAmounts[3].textContent = "$0";

        return;
    }

    const totalMetas = metas.length;

    const ahorroAcumulado =
        metas.reduce((total, meta) => {

            return total +
                Number(meta.Monto_Actual || 0);

        }, 0);

    const totalObjetivo =
        metas.reduce((total, meta) => {

            return total +
                Number(meta.Monto_Objetivo || 0);

        }, 0);

    const pendiente =
        totalObjetivo - ahorroAcumulado;

    const metaMasCercana = [...metas]
        .sort((a, b) => {

            const fechaA =
                new Date(a.Fecha_Limite || "9999-12-31");

            const fechaB =
                new Date(b.Fecha_Limite || "9999-12-31");

            return fechaA - fechaB;
        })[0];

    kpiAmounts[0].textContent = totalMetas;

    kpiAmounts[1].textContent =
        `$${ahorroAcumulado.toLocaleString("es-CO")}`;

    kpiAmounts[2].textContent =
        metaMasCercana.Nombre;

    kpiAmounts[3].textContent =
        `$${pendiente.toLocaleString("es-CO")}`;

    kpiChanges[0].textContent =
        "Metas registradas";

    kpiChanges[1].textContent =
        "Total ahorrado";

    kpiChanges[2].textContent =
        metaMasCercana.Fecha_Limite || "Sin fecha";

    kpiChanges[3].textContent =
        "Total pendiente";
}

// =========================
// INICIO
// =========================

closeModal("modalCrear");

cargarMetas();
