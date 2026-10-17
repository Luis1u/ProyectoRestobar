
  import { io } from "/socket.io/socket.io.esm.min.js";
  const socket = io();

  socket.on("nuevoPedidoCocina", ({ nuevoPedidoCocina }) => {
    // 1. Tomamos el pedido que acaba de llegar
    const pedido = nuevoPedidoCocina[0];

    // 2. Si estaba el aviso de "No hay pedidos", lo quitamos
    const avisoVacio = document.querySelector(".sin-pedidos") || "";
    if (avisoVacio) {
      avisoVacio.remove();
    }

    // 3. Buscamos el contenedor donde están todos los pedidos
    let listaPedidos = document.querySelector(".pedidos") || "";

    // Si la lista no existe en el DOM (porque la pantalla estaba vacía), la creamos
    if (listaPedidos) {
      let productosHTML = "";
    if (pedido.productos && pedido.productos.length > 0) {
      pedido.productos.forEach(prod => {
        productosHTML += `
          <div class="producto">
            <div class="producto-nombre">
              <span class="cantidad">${prod.cadpcandet}x</span>
              <span class="nombre">${prod.capdnompro}</span>
            </div>
            ${prod.cadpnotdet ? `<div class="observacion">⚠ ${prod.cadpnotdet}</div>` : ''}
          </div>
        `;
      });
    } else {
      productosHTML = `<div class="sin-productos">Sin productos</div>`;
    }

    // Limpiamos el número de pedido
    const numPedido = pedido.codigo ? pedido.codigo.toString().replace(/^.*?(\d+)$/, '$1').replace(/^0+/, '') : '';

    // 5. Creamos la tarjeta del NUEVO pedido
    const nuevaTarjeta = `
      <article class="pedido" id="tarjeta-${pedido.codigo}">
        <div class="mesa">MESA ${pedido.mesa}</div>

        <div class="datos">
          <div>PEDIDO #: <strong>${numPedido}</strong></div>
          <div>MESERO: <strong>${pedido.meseroNombre} ${pedido.meseroApellido}</strong></div>
          <div>PERSONAS #: <strong>${pedido.nroPersonas}</strong></div>
          <div>FECHA: <strong>${pedido.fecha}</strong></div>
          <div>HORA: <strong>${pedido.hora}</strong></div>
        </div>

        <div class="productos">
          <div class="productos-titulo">PRODUCTOS</div>
          ${productosHTML}
        </div>

        <button class="btn-tomar" onclick="tomarPedido('${pedido.codigo}')">
          ✓ &nbsp; Marcar en preparacion
        </button>
      </article>
    `;

    // 6. AGREGAMOS EL NUEVO PEDIDO AL FINAL
    listaPedidos.insertAdjacentHTML("beforeend", nuevaTarjeta);
      
    }

    // 4. Armamos la lista de productos de este pedido
    
  });
  socket.on('pedidoCancelado', (codigoPedido) => {
    // Buscamos la tarjeta en el HTML usando el ID que pusimos
    const tarjeta = document.getElementById(`tarjeta-${codigoPedido}`);
    
    if (tarjeta) {
        // Opcional: Agregar una pequeña animación de desvanecimiento
        tarjeta.style.transition = "all 0.5s ease";
        tarjeta.style.opacity = "0";
        tarjeta.style.transform = "scale(0.9)";
        
        // La eliminamos del DOM después de que termine la animación
        setTimeout(() => {
            tarjeta.remove();
            
            // Opcional: Si ya no quedan pedidos en pantalla, podrías mostrar el mensaje de "No hay pedidos"
            verificarSiNoHayPedidos();
        }, 500);
    }
});

function verificarSiNoHayPedidos() {
    const contenedorPedidos = document.querySelector('.pedidos');
    // Si el contenedor ya no tiene tarjetas dentro
    if (contenedorPedidos && contenedorPedidos.children.length === 0) {
        location.reload(); // O recargar la sección para mostrar el mensaje de "No hay pedidos pendientes"
    }
}

