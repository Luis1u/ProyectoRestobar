
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
      if (btnInicial) cargarPedidos('/cocinero/productos/espera', btnInicial);
    });
  