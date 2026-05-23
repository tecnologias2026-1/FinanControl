function obtenerIniciales(nombre) {
  if (!nombre) return "US";
  const partes = nombre.trim().split(" ");
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

const usuarioGuardado = localStorage.getItem("usuarioLogueado");

if (!usuarioGuardado) {
  window.location.href = "Iniciar.html";
} else {
  const usuario = JSON.parse(usuarioGuardado);
  const iniciales = obtenerIniciales(usuario.nombre);

  document.querySelectorAll(".sidebar__avatar, .topbar__avatar, .topbar-avatar").forEach(el => {
    el.textContent = iniciales;
  });

  document.querySelectorAll(".sidebar__user-info strong, .sidebar__user-info .name").forEach(el => {
    el.textContent = usuario.nombre;
  });

  document.querySelectorAll(".sidebar__user-info span, .sidebar__user-info .email").forEach(el => {
    el.textContent = usuario.correo;
  });

  document.querySelectorAll(".topbar__right span, .topbar-right .greeting").forEach(el => {
    el.textContent = `Hola ${usuario.nombre}!`;
  });

  const inputNombre = document.getElementById("p-nombre");
  const inputEmail = document.getElementById("p-email");

  if (inputNombre) inputNombre.value = usuario.nombre;
  if (inputEmail) inputEmail.value = usuario.correo;
}

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
  window.location.href = "index.html";
}