// Mostrar / ocultar contraseña
function togglePassword(id, icon) {

  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    icon.style.opacity = "0.5";
  } else {
    input.type = "password";
    icon.style.opacity = "1";
  }
}


// Crear cuenta
function crearCuenta() {

  const nombre = document.getElementById('regNombre').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass1 = document.getElementById('regPassword').value.trim();
  const pass2 = document.getElementById('regPassword2').value.trim();
  const check = document.getElementById('checkTerms').checked;

  // Validaciones
  if (!nombre || !email || !pass1 || !pass2) {
    alert('Por favor completa todos los campos.');
    return;
  }

  if (pass1.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  if (pass1 !== pass2) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  if (!check) {
    alert('Debes aceptar los términos y condiciones.');
    return;
  }

  // Crear objeto usuario
  const usuario = {
    nombre: nombre,
    email: email,
    password: pass1
  };

  // Guardar usuario (simulación de base de datos)
  localStorage.setItem("usuarioRegistrado", JSON.stringify(usuario));

  alert("Cuenta creada correctamente");

  // Redirigir a login
  window.location.href = "Iniciar.html";
}