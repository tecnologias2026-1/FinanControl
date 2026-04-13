🌐 FinanControl

FinanControl es una aplicación web para la gestión de finanzas personales y grupales que permite registrar ingresos y gastos, establecer presupuestos, crear metas de ahorro y visualizar reportes. Su objetivo es facilitar la organización del dinero y apoyar la toma de decisiones financieras responsables desde cualquier dispositivo.

👥 Integrantes

Nicolás David García Nieto-1202736
Paula Valentina Pirajón Flórez-1202745
Laura Sofia Vargas Morales-1202815

🎯 1. Objetivo General

Desarrollar una aplicación web que permita a los usuarios gestionar de manera eficiente sus finanzas personales y grupales, facilitando el registro de ingresos y gastos, la creación de presupuestos y metas de ahorro, así como la visualización de reportes financieros claros. Con ello se busca solucionar la falta de organización y control económico que enfrentan muchas personas al no contar con una herramienta centralizada, accesible y fácil de usar para administrar su dinero.

🌍 2. Contexto de Uso

El sistema será utilizado por personas que deseen administrar sus finanzas personales o compartidas, como estudiantes, trabajadores o familias que buscan un mayor control de sus gastos e ingresos. Se utilizará a través de una aplicación web accesible desde computadoras, tabletas o teléfonos móviles, permitiendo registrar movimientos financieros, consultar reportes, establecer metas y supervisar el estado económico en cualquier momento y lugar.

📋 3. Requerimientos del Sistema
3.1 Requerimientos Funcionales
      RF01: El sistema debe permitir el registro de usuarios mediante formulario (nombre, correo
      y contraseña) y validación básica de datos.
      RF02: El sistema debe permitir la autenticación de usuarios mediante inicio de sesión con
      correo y contraseña cifrada.
      RF03: El sistema debe permitir que el usuario registre transacciones indicando fecha,
      categoría, monto y tipo (ingreso o gasto).
      RF04: El sistema debe calcular y mostrar automáticamente el balance mensual del usuario,
      así como ingresos y gastos totales en el panel principal (Dashboard).
      RF05: El sistema debe mostrar reportes visuales en el Dashboard, incluyendo gráficas de
      ingresos vs gastos y distribución por categorías, filtradas por mes.
      RF06: El sistema debe permitir al usuario crear, editar y eliminar metas de ahorro indicando
      nombre, monto objetivo y fecha límite, mostrando el progreso en porcentaje y barra visual.
      RF07: El sistema debe permitir la creación y gestión de grupos familiares, incluyendo la
      asignación de roles (administrador o miembro) y la invitación de miembros mediante enlace
      compartido (ej. WhatsApp).
      RF08: El sistema debe permitir la visualización consolidada de ingresos, gastos y balance del
      grupo familiar en un panel resumen.
      RF09: El sistema debe permitir al usuario visualizar las transacciones organizadas por mes y
      filtrarlas por categoría.
      RF10: El sistema debe mostrar mensajes de confirmación antes de eliminar metas o
      registros, y permitir la edición de nombres de metas y grupos desde un panel de edición.

3.2 Requerimientos No Funcionales
    RNF01: El sistema debe tener un tiempo de respuesta menor a 3 segundos en operaciones
    comunes como carga de dashboard y registro de transacciones.
    RNF02: El sistema debe implementar cifrado seguro de contraseñas (bcrypt o equivalente).
    RNF03: La interfaz debe estar optimizada para dispositivos móviles (diseño mobile-first) y
    adaptarse correctamente a diferentes tamaños de pantalla.
    RNF04: El sistema debe garantizar la integridad y consistencia de los datos mediante integridad
    referencial en la base de datos.
    RNF05: El sistema debe garantizar una disponibilidad mínima del 95%.
    RNF06: El sistema debe ser escalable para soportar crecimiento en número de usuarios, grupos
    y transacciones.
    RNF07: La interfaz debe mantener consistencia visual (colores, tipografía, iconografía y
    componentes reutilizables) para facilitar la usabilidad.
    RNF08: El sistema debe permitir mantenimiento y extensibilidad futura siguiendo principios de
    desarrollo modular y arquitectura limpia.

🧠 4. Diagramas UML

Diagrama de Casos de Uso

Los principales actores del sistema son el Usuario (individual o miembro de un grupo familiar) y
el Administrador. Los casos de uso incluyen: Registrarse, Iniciar sesión, Registrar ingreso,
Registrar gasto, Editar transacción, Eliminar transacción, Generar reporte, Crear meta de ahorro,
Crear grupo familiar, Gestionar miembros, y Exportar datos. Relaciones de inclusión se aplican a acciones obligatorias como Validar usuario dentro de Iniciar sesión y
Actualizar balance dentro de Registrar transacción. Relaciones de extensión se
aplican para funcionalidades opcionales como Generar reporte por categoría, que extiende
Generar reporte general.
<img width="493" height="387" alt="image" src="https://github.com/user-attachments/assets/c327403d-5540-4a2f-946b-bc6b3bb55725" />


Diagrama de Secuencia

Para el caso de uso Registrar transacción el flujo de mensajes es el siguiente: el usuario ingresa
los datos en la interfaz web, esta envía una petición POST a la API REST con la información. La
API delega en el servicio de negocio la validación de los datos y la aplicación de reglas; luego, el
servicio utiliza el repositorio para guardar la transacción en la base de datos. Tras la
confirmación, se recalcula el balance y se devuelve una respuesta exitosa a la interfaz, que
notifica al usuario.

<img width="632" height="209" alt="image" src="https://github.com/user-attachments/assets/63330518-ac47-4c07-9fce-4cc66fc1b7eb" />


🎨 5. URL del Prototipo

https://www.figma.com/design/sd05vEaKrdwzWAf4YQfHeh/MockUp-Design?node-id=12-1015&t=rn3aVEpOug3iFZ46-1


🗄️ 6. Diseño de Base de Datos

Agregar imagen del modelo.
Tablas principales

🧩 7. Documentación del Sistema
FinanControl está organizado de forma simple y modular, separando las páginas principales del sistema y sus respectivos archivos de estilo. Esta estructura facilita la navegación, edición y mantenimiento del proyecto.
En la carpeta principal del proyecto se encuentran los archivos HTML que representan cada vista del sistema, como la página de inicio, inicio de sesión, registro, panel principal, reportes, transacciones, metas, grupos y perfil. También se incluye el archivo auth.js, encargado de algunas funciones de autenticación o redirección.
Además, en esta misma carpeta se encuentran los archivos CSS que controlan la apariencia visual de cada módulo. Algunos estilos son compartidos, como estilos.css, mientras que otros son específicos para ciertas páginas, como DashboardEstilos.css, ReportesEstilos.css, TransaccionesEstilos.css, Style_Iniciar.css, Style_Inicio.css, Style_Registrarse.css y Style_Sobre.css.

De acuerdo con la estructura actual del proyecto, los archivos principales son:

auth.js: archivo JavaScript utilizado para funciones relacionadas con autenticación o redirecciones del sistema.

Dashboard.html: vista principal del panel de control financiero.

DashboardEstilos.css: hoja de estilos específica del dashboard.

estilos.css: hoja de estilos compartida para páginas como metas, grupos y perfil.

grupos.html: módulo para la gestión de grupos familiares.

Iniciar.html: página de inicio de sesión.

Inicio.html: página principal o landing page del sistema.

metas.html: módulo para la administración de metas financieras.

perfil.html: módulo de perfil del usuario.

Registrarse.html: página para el registro de nuevos usuarios.

Reportes.html: módulo de reportes financieros.

ReportesEstilos.css: estilos específicos del módulo de reportes.

Sobre.html: página informativa sobre el sistema.

Style_Iniciar.css: estilos de la página de inicio de sesión.

Style_Inicio.css: estilos de la página principal.

Style_Registrarse.css: estilos de la página de registro.

Style_Sobre.css: estilos de la página “Sobre”.

Transacciones.html: módulo para la gestión de transacciones.

TransaccionesEstilos.css: estilos específicos del módulo de transacciones.

🚀 8. Instalación y Ejecución

Para ejecutar el proyecto FinanControl no se requiere instalación de dependencias externas ni compilación previa, ya que está desarrollado con HTML, CSS y JavaScript.

Primero, se debe descargar o clonar el repositorio en el equipo local. Luego, se abre la carpeta del proyecto en Visual Studio Code o en cualquier editor de código. Una vez dentro, basta con abrir el archivo Inicio.html en un navegador web para acceder a la página principal del sistema.
El flujo de navegación del proyecto inicia en Inicio.html. Desde allí, el usuario puede acceder a las páginas Iniciar.html, Registrarse.html y Sobre.html. Una vez iniciado sesión o registrado, el sistema redirige al usuario al Dashboard.html, desde donde puede navegar a los módulos de Transacciones, Reportes, Metas, Grupos y Perfil.

El sistema cuenta además con diseño responsive, por lo que su interfaz se adapta correctamente a computadores, tablets y dispositivos móviles.
