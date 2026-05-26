// =========================
// REPORTES.JS
// =========================

const supabaseClient = window.supabaseClient;

// =========================
// ELEMENTOS HTML
// =========================

const ingresosTotales =
document.getElementById("ingresosTotales");

const gastosTotales =
document.getElementById("gastosTotales");

const balanceTotal =
document.getElementById("balanceTotal");

const todayDate =
document.getElementById("today-date");

// =========================
// FECHA SUPERIOR
// =========================

const hoy = new Date();

if (todayDate) {

    todayDate.textContent =
    hoy.toLocaleDateString(
        "es-CO",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}

// =========================
// MOSTRAR USUARIO
// =========================

const usuario =
JSON.parse(
    localStorage.getItem(
        "usuarioLogueado"
    )
);

if (usuario) {

    const nombre =
    usuario.nombre ||
    usuario.fullName ||
    "Usuario";

    const correo =
    usuario.correo ||
    usuario.email ||
    "usuario@email.com";

    const nombreHTML =
    document.getElementById(
        "nombreUsuario"
    );

    if (nombreHTML) {

        nombreHTML.textContent =
        nombre;
    }

    const correoHTML =
    document.getElementById(
        "correoUsuario"
    );

    if (correoHTML) {

        correoHTML.textContent =
        correo;
    }

    const saludo =
    document.getElementById(
        "saludoUsuario"
    );

    if (saludo) {

        saludo.textContent =
        `Hola ${nombre}!`;
    }

    const avatar =
    document.querySelectorAll(
        ".topbar__avatar, .sidebar__avatar"
    );

    avatar.forEach((a) => {

        a.textContent =
        nombre.charAt(0).toUpperCase();
    });
}

// =========================
// CERRAR SESIÓN
// =========================

function cerrarSesion() {

    localStorage.removeItem(
        "usuarioLogueado"
    );

    window.location.href =
    "index.html";
}

// =========================
// CHART GLOBAL
// =========================

let chart;

// =========================
// TOGGLE ACORDEÓN
// =========================

function toggleDetail(header) {

    const item =
    header.parentElement;

    item.classList.toggle("open");
}

// =========================
// CARGAR REPORTES
// =========================

async function cargarReportes() {

    const usuarioGuardado =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogueado"
        )
    );

    if (!usuarioGuardado) {

        console.log(
            "No hay sesión iniciada"
        );

        return;
    }

    const correoUsuario =
    usuarioGuardado.correo ||
    usuarioGuardado.email;

    // =========================
    // BUSCAR USUARIO
    // =========================

    const {

        data: usuarioData,
        error: usuarioError

    } = await supabaseClient

    .from("USUARIOS")

    .select("id")

    .ilike(
        "correo",
        correoUsuario
    )

    .single();

    if (usuarioError) {

        console.error(usuarioError);

        return;
    }

    // =========================
    // BUSCAR TRANSACCIONES
    // =========================

    const {

        data: transacciones,
        error

    } = await supabaseClient

    .from("TRANSACCIONES")

    .select("*")

    .eq(
        "usuario_id",
        usuarioData.id
    )

    .order(
        "Fecha",
        { ascending: true }
    );

    if (error) {

        console.error(error);

        return;
    }

    // =========================
    // VARIABLES
    // =========================

    let ingresos = 0;
    let gastos = 0;

    const mesesData = {

        3: {
            ingresos: 0,
            gastos: 0
        },

        4: {
            ingresos: 0,
            gastos: 0
        },

        5: {
            ingresos: 0,
            gastos: 0
        }
    };

    // =========================
    // RECORRER DATOS
    // =========================

    transacciones.forEach((t) => {

        const monto =
        Number(t.Monto);

        const raw = t.Fecha;
        let fecha;
        if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            const [y, m, d] = raw.split("-").map(Number); 
            fecha = new Date(y, m - 1, d);
        } else {
            fecha = new Date(raw);
        }
        const mes = fecha.getMonth() + 1;

        if (
            t.Tipo.toLowerCase()
            ===
            "ingreso"
        ) {

            ingresos += monto;
        }

        else {

            gastos += monto;
        }

        if (mesesData[mes]) {

            if (
                t.Tipo.toLowerCase()
                ===
                "ingreso"
            ) {

                mesesData[mes].ingresos += monto;
            }

            else {

                mesesData[mes].gastos += monto;
            }
        }

    });

    // =========================
    // BALANCE TOTAL
    // =========================

    const balance =
    ingresos - gastos;

    // =========================
    // KPI
    // =========================

    ingresosTotales.textContent =
    `$ ${ingresos.toLocaleString("es-CO")}`;

    gastosTotales.textContent =
    `$ ${gastos.toLocaleString("es-CO")}`;

    balanceTotal.textContent =
    `$ ${balance.toLocaleString("es-CO")}`;

    // =========================
    // ACTUALIZAR TARJETAS
    // =========================

    actualizarMes(
        0,
        mesesData[5].ingresos,
        mesesData[5].gastos
    );

    actualizarMes(
        1,
        mesesData[4].ingresos,
        mesesData[4].gastos
    );

    actualizarMes(
        2,
        mesesData[3].ingresos,
        mesesData[3].gastos
    );

    // =========================
    // ACTUALIZAR GRÁFICA
    // =========================

    actualizarGrafica(

        [
            mesesData[3].ingresos,
            mesesData[4].ingresos,
            mesesData[5].ingresos
        ],

        [
            mesesData[3].gastos,
            mesesData[4].gastos,
            mesesData[5].gastos
        ]
    );
}

// =========================
// ACTUALIZAR MES
// =========================

function actualizarMes(
    index,
    ingresos,
    gastos
) {

    const cards =
    document.querySelectorAll(
        ".reportes-acc-item"
    )[index];

    if (!cards) return;

    const amounts =
    cards.querySelectorAll(
        ".reportes-mini-card__amount"
    );

    const balance =
    ingresos - gastos;

    amounts[0].textContent =
    `$${ingresos.toLocaleString("es-CO")}`;

    amounts[1].textContent =
    `$${gastos.toLocaleString("es-CO")}`;

    amounts[2].textContent =
    `$${balance.toLocaleString("es-CO")}`;

    const balanceText =
    cards.querySelector(
        ".reportes-acc-item__balance"
    );

    if (balanceText) {

        balanceText.textContent =
        `Balance: $${balance.toLocaleString("es-CO")}`;
    }
}

// =========================
// ACTUALIZAR GRÁFICA
// =========================

function actualizarGrafica(
    ingresos,
    gastos
) {

    const ctx =
    document.getElementById(
        "barChart"
    );

    if (!ctx) return;

    if (chart) {

        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                "Marzo",
                "Abril",
                "Mayo"
            ],

            datasets: [

                {
                    label: "Ingresos",

                    data: ingresos,

                    backgroundColor:
                    "#22c55e",

                    borderRadius: 10,

                    borderSkipped: false
                },

                {
                    label: "Gastos",

                    data: gastos,

                    backgroundColor:
                    "#ef4444",

                    borderRadius: 10,

                    borderSkipped: false
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        usePointStyle: true,

                        pointStyle: "circle",

                        color: "#64748b",

                        padding: 20
                    }
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString("es-CO")}`;
                        }
                    }
                }
            },

            scales: {

                x: {

                    grid: {
                        display: false
                    }
                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback: function (value) {

                            return "$" + value.toLocaleString("es-CO");
                        }
                    }
                }
            }
        }
    });
}

// =========================
// INICIAR
// =========================

document.addEventListener(
    "DOMContentLoaded",
    cargarReportes
);
