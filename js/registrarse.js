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

// Crear cuenta conectada a Supabase
async function crearCuenta() {
  const nombre = document.getElementById("regNombre").value.trim();
  const correo = document.getElementById("regEmail").value.trim();
  const pass1 = document.getElementById("regPassword").value.trim();
  const pass2 = document.getElementById("regPassword2").value.trim();
  const check = document.getElementById("checkTerms").checked;

  if (!nombre || !correo || !pass1 || !pass2) {
    alert("Por favor completa todos los campos.");
    return;
  }

  if (pass1.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (pass1 !== pass2) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (!check) {
    alert("Debes aceptar los términos y condiciones.");
    return;
  }

  // 1. Crear usuario en Authentication
  const { data, error } = await supabaseClient.auth.signUp({
    email: correo,
    password: pass1,
    options: {
      data: {
        nombre: nombre
      }
    }
  });

  if (error) {
    console.error("ERROR AUTH:", error);
    alert("Error creando cuenta: " + error.message);
    return;
  }

  // 2. Guardar usuario en tabla USUARIOS
  const { data: insertData, error: insertError } = await supabaseClient
    .from("USUARIOS")
    .insert([
      {
        nombre: nombre,
        correo: correo,
        password: pass1
      }
    ])
    .select();

  if (insertError) {
    console.error("ERROR INSERT:", insertError);
    alert("Error guardando usuario en la tabla: " + insertError.message);
    return;
  }

  console.log("Usuario guardado en USUARIOS:", insertData);

  alert("Cuenta creada correctamente.");
  window.location.href = "Iniciar.html";
}
