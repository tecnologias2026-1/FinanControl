function cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "index.html";
}

function eliminarCuenta() {
    localStorage.clear();
    sessionStorage.clear();

    alert("Cuenta eliminada");

    window.location.href = "index.html";
}
