// =========================
// DASHBOARD.JS FINAL
// =========================

let cashflowChart = null;
let donutChart = null;

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const mesesCortos = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const mesesLargos = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

document.addEventListener("DOMContentLoaded", cargarDashboard);

// =========================
// CARGAR DASHBOARD
// =========================

async function cargarDashboard() {

  const usuario = JSON.parse(
    localStorage.getItem("usuarioLogueado")
  );

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  const supabaseClient = window.supabaseClient;

  if (!supabaseClient) {
    alert("No se encontró conexión con Supabase.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("TRANSACCIONES")
    .select("*")
    .order("Fecha", { ascending: true });

  console.log("TRANSACCIONES:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error(error);
    alert("Error dashboard: " + error.message);
    return;
  }

  const transacciones = data || [];

  actualizarKPIs(transacciones);
  crearGraficaFlujo(transacciones);
  crearGraficaCategorias(transacciones);
  crearResumenMensual(transacciones);
}

// =========================
// HELPERS
// =========================

function esIngreso(t) {
  return String(
    t.Tipo ||
    t.tipo ||
    ""
  ).toLowerCase() === "ingreso";
}

function esGasto(t) {
  return String(
    t.Tipo ||
    t.tipo ||
    ""
  ).toLowerCase() === "gasto";
}

function obtenerMonto(t) {

  return Number(
    t.Monto ||
    t.monto ||
    t.MONTO ||
    0
  );
}

function obtenerFecha(t) {

  return new Date(
    t.Fecha ||
    t.fecha ||
    t.created_at
  );
}

function obtenerCategoria(t) {

  return (
    t.Categoria ||
    t.categoria ||
    t.CATEGORIA ||
    t["Categoría"] ||
    t["categoria"] ||
    "Sin categoría"
  );
}

// =========================
// KPIS
// =========================

function actualizarKPIs(transacciones) {

  const hoy = new Date();

  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  const transaccionesMes =
    transacciones.filter(t => {

      const fecha = obtenerFecha(t);

      return (
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === anioActual
      );
    });

  const ingresosMes =
    transaccionesMes
      .filter(esIngreso)
      .reduce((total, t) =>
        total + obtenerMonto(t), 0);

  const gastosMes =
    transaccionesMes
      .filter(esGasto)
      .reduce((total, t) =>
        total + obtenerMonto(t), 0);

  const ingresosTotales =
    transacciones
      .filter(esIngreso)
      .reduce((total, t) =>
        total + obtenerMonto(t), 0);

  const gastosTotales =
    transacciones
      .filter(esGasto)
      .reduce((total, t) =>
        total + obtenerMonto(t), 0);

  const balanceTotal =
    ingresosTotales - gastosTotales;

  const ahorroNeto =
    ingresosMes - gastosMes;

  document.getElementById(
    "balanceTotal"
  ).textContent =
    formatoCOP.format(balanceTotal);

  document.getElementById(
    "totalIngresos"
  ).textContent =
    formatoCOP.format(ingresosMes);

  document.getElementById(
    "totalGastos"
  ).textContent =
    formatoCOP.format(gastosMes);

  document.getElementById(
    "ahorroNeto"
  ).textContent =
    formatoCOP.format(ahorroNeto);
}

// =========================
// AGRUPAR POR MES
// =========================

function agruparPorMes(transacciones) {

  const hoy = new Date();

  const meses = [];

  for (let i = 5; i >= 0; i--) {

    const fecha = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - i,
      1
    );

    meses.push({
      mes: fecha.getMonth(),
      anio: fecha.getFullYear(),
      label: mesesCortos[fecha.getMonth()],
      ingresos: 0,
      gastos: 0
    });
  }

  transacciones.forEach(t => {

    const fecha = obtenerFecha(t);

    const grupo = meses.find(m =>
      m.mes === fecha.getMonth() &&
      m.anio === fecha.getFullYear()
    );

    if (!grupo) return;

    if (esIngreso(t)) {
      grupo.ingresos += obtenerMonto(t);
    }

    if (esGasto(t)) {
      grupo.gastos += obtenerMonto(t);
    }
  });

  return meses;
}

// =========================
// GRÁFICA FLUJO
// =========================

function crearGraficaFlujo(transacciones) {

  const canvas =
    document.getElementById("cashflowChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const datos =
    agruparPorMes(transacciones);

  if (cashflowChart) {
    cashflowChart.destroy();
  }

  cashflowChart = new Chart(ctx, {

    type: "line",

    data: {

      labels:
        datos.map(d => d.label),

      datasets: [

        {
          label: "Ingresos",

          data:
            datos.map(d => d.ingresos),

          borderColor: "#22c55e",

          backgroundColor:
            "rgba(34,197,94,.08)",

          borderWidth: 2.5,

          pointRadius: 4,

          pointBackgroundColor:
            "#22c55e",

          pointBorderColor: "#fff",

          pointBorderWidth: 2,

          fill: true,

          tension: 0.45
        },

        {
          label: "Gastos",

          data:
            datos.map(d => d.gastos),

          borderColor: "#ef4444",

          backgroundColor:
            "rgba(239,68,68,.08)",

          borderWidth: 2.5,

          pointRadius: 4,

          pointBackgroundColor:
            "#ef4444",

          pointBorderColor: "#fff",

          pointBorderWidth: 2,

          fill: true,

          tension: 0.45
        }
      ]
    },

    options: {

      responsive: true,

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

            font: {
              family: "Plus Jakarta Sans",
              size: 12,
              weight: "600"
            },

            color: "#64748b",

            padding: 20
          }
        }
      },

      scales: {

        x: {

          grid: {
            display: false
          },

          border: {
            display: false
          },

          ticks: {

            font: {
              family: "Plus Jakarta Sans",
              size: 12
            },

            color: "#94a3b8"
          }
        },

        y: {

          beginAtZero: true,

          grid: {
            color: "#f1f5f9"
          },

          border: {
            display: false
          },

          ticks: {

            font: {
              family: "Plus Jakarta Sans",
              size: 11
            },

            color: "#94a3b8",

            callback: value =>
              formatoCOP.format(value)
          }
        }
      }
    }
  });
}

// =========================
// DONUT CATEGORÍAS
// =========================

function crearGraficaCategorias(transacciones) {

  const canvas = document.getElementById("donutChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const gastos = transacciones.filter(esGasto);

  const categorias = {};

  gastos.forEach(t => {

    const categoria = obtenerCategoria(t).trim();
    const monto = obtenerMonto(t);

    if (!categorias[categoria]) {
      categorias[categoria] = 0;
    }

    categorias[categoria] += monto;
  });

  const labels = Object.keys(categorias);
  const valores = Object.values(categorias);

  const colores = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#14b8a6",
    "#f97316"
  ];

  if (donutChart) {
    donutChart.destroy();
  }

  donutChart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels:
        labels.length
          ? labels
          : ["Sin datos"],

      datasets: [

        {

          data:
            valores.length
              ? valores
              : [1],

          backgroundColor:
            labels.length
              ? labels.map((_, i) =>
                  colores[i % colores.length]
                )
              : ["#e5e7eb"],

          borderWidth: 3,

          borderColor: "#fff",

          hoverOffset: 4
        }
      ]
    },

    options: {

      responsive: true,

      cutout: "68%",

      plugins: {

        legend: {
          display: false
        },

        tooltip: {

          callbacks: {

            label: context => {

              if (!labels.length) {
                return "Sin datos";
              }

              return `${context.label}: ${formatoCOP.format(context.raw)}`;
            }
          }
        }
      }
    }
  });

  actualizarLeyendaCategorias(
    labels,
    valores,
    colores
  );
}

// =========================
// LEYENDA DONUT
// =========================

function actualizarLeyendaCategorias(
  labels,
  valores,
  colores
) {

  const legend =
    document.querySelector(".donut-legend");

  if (!legend) return;

  if (!labels.length) {

    legend.innerHTML = `
      <li>
        <div class="legend-left">
          <span class="legend-dot legend-dot--gray"></span>
          Sin datos
        </div>
        <span class="legend-amount">$0</span>
      </li>
    `;

    return;
  }

  legend.innerHTML =
    labels.map((label, index) => `

      <li>

        <div class="legend-left">

          <span
            class="legend-dot"
            style="background:${colores[index % colores.length]}"
          ></span>

          ${label}

        </div>

        <span class="legend-amount">
          ${formatoCOP.format(valores[index])}
        </span>

      </li>

    `).join("");
}

// =========================
// RESUMEN MENSUAL
// =========================

function crearResumenMensual(
  transacciones
) {

  const resumen =
    document.querySelector(".resumen");

  if (!resumen) return;

  const grupos = {};

  transacciones.forEach(t => {

    const fecha =
      obtenerFecha(t);

    const clave =
      `${fecha.getFullYear()}-${fecha.getMonth()}`;

    const nombreMes =
      `${mesesLargos[fecha.getMonth()]} ${fecha.getFullYear()}`;

    if (!grupos[clave]) {

      grupos[clave] = {

        nombreMes,

        ingresos: 0,

        gastos: 0
      };
    }

    if (esIngreso(t)) {
      grupos[clave].ingresos += obtenerMonto(t);
    }

    if (esGasto(t)) {
      grupos[clave].gastos += obtenerMonto(t);
    }
  });

  const datos =
    Object.values(grupos).reverse();

  if (!datos.length) {

    resumen.innerHTML = `
      <h3 class="resumen__title">
        Resumen Mensual
      </h3>

      <p class="resumen__sub">
        Aún no tienes movimientos registrados
      </p>
    `;

    return;
  }

  resumen.innerHTML = `

    <h3 class="resumen__title">
      Resumen Mensual
    </h3>

    <p class="resumen__sub">
      Resumen generado automáticamente
    </p>

    ${datos.map((m, index) => {

      const balance =
        m.ingresos - m.gastos;

      return `

        <div class="acc-item ${index === 0 ? "open" : ""}">

          <div class="acc-item__header"
               onclick="toggleAcc(this)">

            <div class="acc-item__header-left">

              <div class="acc-item__icon">

                <svg fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     stroke-width="2">

                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>

              </div>

              <div>

                <span class="acc-item__month">
                  ${m.nombreMes}
                </span>

                <span class="acc-item__balance">
                  Balance:
                  ${formatoCOP.format(balance)}
                </span>

              </div>

            </div>

          </div>

          <div class="acc-item__body">

            <div class="acc-item__cards">

              <div class="mini-card mini-card--income">

                <span class="mini-card__label">
                  Ingresos
                </span>

                <p class="mini-card__amount">
                  ${formatoCOP.format(m.ingresos)}
                </p>

              </div>

              <div class="mini-card mini-card--expense">

                <span class="mini-card__label">
                  Gastos
                </span>

                <p class="mini-card__amount">
                  ${formatoCOP.format(m.gastos)}
                </p>

              </div>

              <div class="mini-card mini-card--balance">

                <span class="mini-card__label">
                  Balance
                </span>

                <p class="mini-card__amount">
                  ${formatoCOP.format(balance)}
                </p>

              </div>

            </div>

          </div>

        </div>
      `;
    }).join("")}
  `;
}

// =========================
// ACORDEÓN
// =========================

function toggleAcc(header) {

  const item =
    header.closest(".acc-item");

  item.classList.toggle("open");
}
