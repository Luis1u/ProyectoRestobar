let ban = false;

function cargarPedidos(url, btnCat) {
  if (ban) {
    const btnActual = document.querySelector(".boton-filtro.activo");
    if (btnActual) btnActual.classList.remove("activo");
    btnCat.classList.add("activo");
  } else {
    btnCat.classList.add("activo");
    ban = true;
  }

  fetch(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta");
      return response.text();
    })
    .then((html) => {
      document.getElementById("contenedor-pedidos").innerHTML = html;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("contenedor-pedidos").innerHTML =
        `<p style="color: #dc2626; text-align: center; padding: 20px;">No se pudieron cargar los pedidos.</p>`;
    });
}

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  const btnInicial = document.querySelector(".boton-filtro");
  if (btnInicial) cargarPedidos("/bartender/espera/bar", btnInicial);
});

async function cambiarEstado(url) {
  
  try {
    const response = await fetch(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (!response.ok) throw new Error("Error en la respuesta");

    const data = await response.json(); //  Aquí ya lee correctamente el JSON que envías del backend

    if (data.success) {
      switch(data.tipo){
        case "LISTO":
          const btnListo = document.querySelectorAll('.boton-filtro')[2];
          cargarPedidos('/bartender/listo/bar', btnListo);
          break;
        case "EN_PREPARACION":
          const btnEnPreparacion = document.querySelectorAll('.boton-filtro')[1];
          cargarPedidos('/bartender/en_preparacion/bar', btnEnPreparacion);
          break;
        case "R_ESPERA":
          const btnEnEspera = document.querySelectorAll('.boton-filtro')[0];
          cargarPedidos('/bartender/espera/bar', btnEnEspera);
          break;
      }
      // Seleccionamos el segundo botón (EN PREPARACIÓN) y recargamos la vista automáticamente
      
    } else {
      alert(data.message || "Ocurrió un error al procesar el pedido.");
    }

  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo completar la operación.");
  }
}
