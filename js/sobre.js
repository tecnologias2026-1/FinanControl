// Animación al hacer scroll (aparece suave)
const elementos = document.querySelectorAll(
  ".card, .member, .stat"
);

function mostrarElementos() {

  elementos.forEach(el => {

    const rect = el.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }

  });
}

// Inicializar estilos ocultos
elementos.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.6s ease";
});

// Evento scroll
window.addEventListener("scroll", mostrarElementos);

// Ejecutar al cargar
mostrarElementos();


// Scroll suave para botones
const links = document.querySelectorAll("a");

links.forEach(link => {

  link.addEventListener("click", function(e) {

    const href = this.getAttribute("href");

    if (href.startsWith("#")) {

      e.preventDefault();

      const destino = document.querySelector(href);

      destino.scrollIntoView({
        behavior: "smooth"
      });
    }

  });

});


// Mensaje al hacer click en redes (opcional)
const redes = document.querySelectorAll(".social");

redes.forEach(red => {

  red.addEventListener("click", () => {

    alert("Próximamente nuestras redes 🚀");

  });

});