// Mostrar/ocultar contraseña
function togglePassword() {
  const input = document.getElementById('loginPassword');
  const eye = document.querySelector('.icon-eye');

  if (input.type === "password") {
    input.type = "text";
    eye.style.opacity = "0.5";
  } else {
    input.type = "password";
    eye.style.opacity = "1";
  }
}


// Iniciar sesión
function iniciarSesion() {

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  // Validaciones
  if (!email || !password) {
    alert('Por favor completa correo y contraseña.');
    return;
  }

  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  // Simulación de usuario (luego lo conectamos a Supabase 👀)
  const usuario = {
    email: email
  };

  // Guardar sesión
  localStorage.setItem("usuario", JSON.stringify(usuario));

  alert("Inicio de sesión exitoso");

  // Redirigir
  window.location.href = 'Dashboard.html';
}