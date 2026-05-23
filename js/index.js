// =========================
// INDEX.JS
// LOGIN Y REGISTRO
// =========================


// ===== LOGIN =====

const loginForm =
document.getElementById("loginForm");


// =========================
// INICIAR SESIÓN
// =========================

if(loginForm){

    loginForm.addEventListener(
        "submit",
        iniciarSesion
    );
}


function iniciarSesion(event){

    event.preventDefault();


    const correo =
    document.getElementById(
        "correoLogin"
    ).value;

    const password =
    document.getElementById(
        "passwordLogin"
    ).value;


    // ===== VALIDACIÓN =====

    if(
        correo === "" ||
        password === ""
    ){

        alert(
            "Completa todos los campos"
        );

        return;
    }


    // ===== USUARIO TEMPORAL =====

    const usuario = {

        correo,
        password
    };


    // ===== GUARDAR SESIÓN =====

    localStorage.setItem(

        "usuarioActivo",

        JSON.stringify(usuario)
    );


    // ===== MENSAJE =====

    alert(
        "Inicio de sesión exitoso"
    );


    // ===== REDIRECCIÓN =====

    window.location.href =
    "Dashboard.html";
}


// =========================
// REGISTRO
// =========================

const registroForm =
document.getElementById(
    "registroForm"
);


if(registroForm){

    registroForm.addEventListener(
        "submit",
        registrarUsuario
    );
}


function registrarUsuario(event){

    event.preventDefault();


    const nombre =
    document.getElementById(
        "nombreRegistro"
    ).value;

    const correo =
    document.getElementById(
        "correoRegistro"
    ).value;

    const password =
    document.getElementById(
        "passwordRegistro"
    ).value;


    // ===== VALIDACIÓN =====

    if(
        nombre === "" ||
        correo === "" ||
        password === ""
    ){

        alert(
            "Completa todos los campos"
        );

        return;
    }


    // ===== NUEVO USUARIO =====

    const nuevoUsuario = {

        nombre,
        correo,
        password
    };


    // ===== GUARDAR =====

    localStorage.setItem(

        "usuarioRegistrado",

        JSON.stringify(
            nuevoUsuario
        )
    );


    alert(
        "Usuario registrado correctamente"
    );


    // ===== LIMPIAR FORM =====

    registroForm.reset();
}
