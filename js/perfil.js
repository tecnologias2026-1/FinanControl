// ============================================
// PERFIL.JS — Conectado a Supabase
// ============================================

const supabaseClient = window.supabaseClient;

// ============================================
// FECHA ACTUAL
// ============================================

const todayDateEl = document.getElementById("today-date");

if (todayDateEl) {

    todayDateEl.textContent =
    new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// ============================================
// TOAST — notificación breve
// ============================================

function mostrarToast(mensaje, tipo = "ok") {

    const toast =
    document.getElementById("perfilToast");

    if (!toast) return;

    toast.textContent = mensaje;

    toast.className =
    `perfil-toast perfil-toast--${tipo} perfil-toast--visible`;

    setTimeout(() => {
        toast.classList.remove("perfil-toast--visible");
    }, 3000);
}

// ============================================
// CARGAR PERFIL DESDE SUPABASE
// ============================================

async function cargarPerfil() {

    const usuarioLocal =
    JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    if (!usuarioLocal) {
        window.location.href = "index.html";
        return;
    }

    const correo =
    usuarioLocal.correo ||
    usuarioLocal.email;

    // ------------------------------------------
    // Buscar usuario en Supabase
    // ------------------------------------------

    const { data: usuario, error } =
    await supabaseClient
        .from("USUARIOS")
        .select("*")
        .ilike("correo", correo)
        .single();

    if (error || !usuario) {

        // Si falla la BD, usar datos del localStorage
        rellenarUI(usuarioLocal, null);
        cargarResumenActividad(usuarioLocal);
        return;
    }

    // ------------------------------------------
    // Enriquecer localStorage con datos de BD
    // ------------------------------------------

    const datosCompletos = {
        ...usuarioLocal,
        id:        usuario.id,
        nombre:    usuario.nombre    || usuarioLocal.nombre    || "Usuario",
        correo:    usuario.correo    || correo,
        telefono:  usuario.telefono  || "",
        documento: usuario.documento || "",
        created_at: usuario.created_at || ""
    };

    localStorage.setItem(
        "usuarioLogueado",
        JSON.stringify(datosCompletos)
    );

    rellenarUI(datosCompletos, usuario);
    cargarResumenActividad(datosCompletos);
}

// ============================================
// RELLENAR INTERFAZ CON DATOS
// ============================================

function rellenarUI(datos, usuarioDB) {

    const nombre    = datos.nombre    || datos.fullName || "Usuario";
    const correo    = datos.correo    || datos.email    || "";
    const telefono  = usuarioDB?.telefono  || datos.telefono  || "";
    const documento = usuarioDB?.documento || datos.documento || "";

    const fechaRegistro = usuarioDB?.created_at
        ? new Date(usuarioDB.created_at).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric"
          })
        : "";

    // ------------------------------------------
    // .info-value — en el orden del HTML:
    // [0] Nombre  [1] Correo  [2] Teléfono
    // [3] Fecha de Registro  [4] Documento
    // ------------------------------------------

    const valores =
    document.querySelectorAll(".info-value");

    if (valores[0]) valores[0].textContent = nombre;
    if (valores[1]) valores[1].textContent = correo;
    if (valores[2]) valores[2].textContent = telefono  || "—";
    if (valores[3]) valores[3].textContent = fechaRegistro || "—";
    if (valores[4]) valores[4].textContent = documento || "—";

    // ------------------------------------------
    // Topbar y sidebar
    // ------------------------------------------

    const greeting =
    document.querySelector(".greeting");

    if (greeting) {
        greeting.textContent = `Hola ${nombre}!`;
    }

    document
    .querySelectorAll(".topbar__avatar, .sidebar__avatar, .topbar-avatar, .user-avatar")
    .forEach(av => {
        av.textContent =
        nombre.charAt(0).toUpperCase();
    });

    const sidebarNombre =
    document.querySelector(
        ".user-info .name, .sidebar__user-info .name"
    );

    if (sidebarNombre) {
        sidebarNombre.textContent = nombre;
    }

    const sidebarCorreo =
    document.querySelector(
        ".user-info .email, .sidebar__user-info .email"
    );

    if (sidebarCorreo) {
        sidebarCorreo.textContent = correo;
    }

    // ------------------------------------------
    // Pre-llenar modal de edición
    // ------------------------------------------

    const pNombre =
    document.getElementById("p-nombre");

    const pEmail =
    document.getElementById("p-email");

    const pTel =
    document.getElementById("p-tel");

    const pDoc =
    document.getElementById("p-doc");

    if (pNombre) pNombre.value = nombre;
    if (pEmail)  pEmail.value  = correo;
    if (pTel)    pTel.value    = telefono;
    if (pDoc)    pDoc.value    = documento;
}

// ============================================
// CARGAR RESUMEN DE ACTIVIDAD
// ============================================

async function cargarResumenActividad(datos) {

    const usuarioId = datos.id;

    if (!usuarioId) return;

    const acValues =
    document.querySelectorAll(".ac-value");

    // ------------------------------------------
    // [0] Total de transacciones
    // ------------------------------------------

    const { count: totalTx } =
    await supabaseClient
        .from("TRANSACCIONES")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", usuarioId);

    if (acValues[0]) {
        acValues[0].textContent = totalTx ?? 0;
    }

    // ------------------------------------------
    // [1] Metas activas
    // ------------------------------------------

    const { count: totalMetas } =
    await supabaseClient
        .from("METAS")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", usuarioId);

    if (acValues[1]) {
        acValues[1].textContent = totalMetas ?? 0;
    }

    // ------------------------------------------
    // [2] Nombre del grupo familiar
    // ------------------------------------------

    const { data: grupoData } =
    await supabaseClient
        .from("GRUPOS")
        .select("Nombre")
        .eq("usuario_id", usuarioId)
        .limit(1)
        .maybeSingle();

    if (acValues[2]) {

        acValues[2].textContent =
        grupoData?.Nombre || "Sin grupo";

        acValues[2].style.fontSize   = "15px";
        acValues[2].style.fontWeight = "600";
    }

    // ------------------------------------------
    // [3] Último acceso (fecha de hoy)
    // ------------------------------------------

    const ultimoAcceso =
    new Date().toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    if (acValues[3]) {

        acValues[3].textContent = ultimoAcceso;

        acValues[3].style.fontSize   = "13px";
        acValues[3].style.fontWeight = "600";
    }
}

// ============================================
// GUARDAR CAMBIOS DEL PERFIL
// ============================================

async function guardarInfoPerfil() {

    const nombre =
    document.getElementById("p-nombre")?.value.trim();

    const correo =
    document.getElementById("p-email")?.value.trim();

    const telefono =
    document.getElementById("p-tel")?.value.trim();

    const documento =
    document.getElementById("p-doc")?.value.trim();

    if (!nombre || !correo) {
        mostrarToast(
            "Nombre y correo son obligatorios",
            "error"
        );
        return;
    }

    const usuarioLocal =
    JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    if (!usuarioLocal) return;

    const correoOriginal =
    usuarioLocal.correo ||
    usuarioLocal.email;

    // ------------------------------------------
    // Actualizar en Supabase
    // ------------------------------------------

    const { error } =
    await supabaseClient
        .from("USUARIOS")
        .update({ nombre, correo, telefono, documento })
        .ilike("correo", correoOriginal);

    if (error) {
        mostrarToast(
            "Error al guardar: " + error.message,
            "error"
        );
        return;
    }

    // ------------------------------------------
    // Actualizar localStorage
    // ------------------------------------------

    const datosActualizados = {
        ...usuarioLocal,
        nombre,
        correo,
        telefono,
        documento
    };

    localStorage.setItem(
        "usuarioLogueado",
        JSON.stringify(datosActualizados)
    );

    closeModal("modalEditarInfo");

    rellenarUI(datosActualizados, {
        telefono,
        documento,
        created_at: usuarioLocal.created_at
    });

    mostrarToast("✅ Perfil actualizado correctamente");
}

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================

async function guardarPassword() {

    const actual =
    document.getElementById("pass-actual")?.value;

    const nueva =
    document.getElementById("pass-nueva")?.value;

    const confirmar =
    document.getElementById("pass-confirmar")?.value;

    if (!actual || !nueva || !confirmar) {
        mostrarToast("Completa todos los campos", "error");
        return;
    }

    if (nueva !== confirmar) {
        mostrarToast("Las contraseñas no coinciden", "error");
        return;
    }

    const usuarioLocal =
    JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    const correo =
    usuarioLocal?.correo ||
    usuarioLocal?.email;

    // ------------------------------------------
    // Verificar contraseña actual
    // ------------------------------------------

    const { data: usuario, error: errVerif } =
    await supabaseClient
        .from("USUARIOS")
        .select("id")
        .ilike("correo", correo)
        .eq("contrasena", actual)
        .single();

    if (errVerif || !usuario) {
        mostrarToast(
            "La contraseña actual no es correcta",
            "error"
        );
        return;
    }

    // ------------------------------------------
    // Guardar nueva contraseña
    // ------------------------------------------

    const { error } =
    await supabaseClient
        .from("USUARIOS")
        .update({ contrasena: nueva })
        .eq("id", usuario.id);

    if (error) {
        mostrarToast(
            "Error al cambiar contraseña: " + error.message,
            "error"
        );
        return;
    }

    closeModal("modalCambiarPassword");

    mostrarToast("✅ Contraseña actualizada");

    document.getElementById("pass-actual").value    = "";
    document.getElementById("pass-nueva").value     = "";
    document.getElementById("pass-confirmar").value = "";
}

// ============================================
// CERRAR SESIÓN
// ============================================

function cerrarSesion() {

    localStorage.removeItem("usuarioLogueado");
    window.location.href = "index.html";
}

function cerrarSesiones() {

    cerrarSesion();
}

// ============================================
// ELIMINAR CUENTA
// ============================================

async function eliminarCuenta() {

    const usuarioLocal =
    JSON.parse(
        localStorage.getItem("usuarioLogueado")
    );

    if (!usuarioLocal?.id) {
        cerrarSesion();
        return;
    }

    const { error } =
    await supabaseClient
        .from("USUARIOS")
        .delete()
        .eq("id", usuarioLocal.id);

    if (error) {
        mostrarToast(
            "Error al eliminar: " + error.message,
            "error"
        );
        return;
    }

    localStorage.removeItem("usuarioLogueado");
    window.location.href = "index.html";
}

// ============================================
// INICIAR AL CARGAR LA PÁGINA
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    cargarPerfil
);
