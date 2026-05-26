function togglePassword() {
  const input = document.getElementById("loginPassword");
  const eye = document.querySelector(".icon-eye");

  if (input.type === "password") {
    input.type = "text";
    eye.style.opacity = "0.5";
  } else {
    input.type = "password";
    eye.style.opacity = "1";
  }
}

async function iniciarSesion() {
  const correo = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!correo || !password) {
    alert("Completa correo y contraseña.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: correo,
    password: password
  });

  if (error) {
    alert(error.message);
    return;
  }

const { data: usuarioTabla, error: errorUsuario } = await supabaseClient
  .from("USUARIOS")
  .select("*")
  .eq("correo", correo)
  .single();

if (errorUsuario || !usuarioTabla) {
  alert("No se encontró el usuario en la tabla USUARIOS.");
  return;
}

const usuario = {
  id: usuarioTabla.id,
  nombre: usuarioTabla.nombre,
  correo: usuarioTabla.correo
};

localStorage.setItem("usuarioActual", JSON.stringify(usuario));
localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));

  alert("Inicio de sesión exitoso");
  window.location.href = "Dashboard.html";
}
