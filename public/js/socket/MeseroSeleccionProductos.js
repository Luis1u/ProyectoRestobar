/* ============================================================
   STOCK EN TIEMPO REAL (cuando otro mesero hace un pedido)
   ============================================================ */

// Guarda el stock más reciente de cada producto: { codigo: stock }
const stockActual = {};

// Estilos del aviso y del destello (se agregan solos, no hace falta tocar el CSS)
const estilosStock = document.createElement("style");
estilosStock.textContent = `
  #avisos-stock { position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
    z-index: 9999; display: flex; flex-direction: column; gap: 6px; width: 90%; max-width: 420px; }
  .aviso-stock { background: #1e293b; color: #fff; padding: 10px 14px; border-radius: 8px;
    border-left: 4px solid #f59e0b; font-size: 0.9rem; }
  .stock-cambio { display: inline-block; animation: destello 0.8s; }
  @keyframes destello {
    0%   { background: #fde68a; transform: scale(1.2); }
    100% { background: transparent; transform: scale(1); }
  }
  .stock-agotado { color: #dc2626; font-weight: bold; }
  .tarjeta-bloque.agotado { opacity: 0.5; }
  .btn-mas:disabled { opacity: 0.4; cursor: not-allowed; }
`;
document.head.appendChild(estilosStock);

// Muestra un mensaje corto arriba de la pantalla (desaparece solo a los 5 segundos)
function mostrarAviso(texto) {
  let caja = document.getElementById("avisos-stock");
  if (!caja) {
    caja = document.createElement("div");
    caja.id = "avisos-stock";
    document.body.appendChild(caja);
  }
  const aviso = document.createElement("div");
  aviso.className = "aviso-stock";
  aviso.textContent = texto;
  caja.appendChild(aviso);
  setTimeout(() => aviso.remove(), 5000);
}

// Cuando se carga una categoría, el servidor ya trae el stock real: lo guardamos
function guardarStockDeLaLista() {
  document.querySelectorAll("#contenedor-productos [data-codigo]").forEach((tarjeta) => {
    stockActual[tarjeta.dataset.codigo] = Number(tarjeta.dataset.stock);
  });
}

// Aplica un nuevo stock en la lista de productos y en el carrito
function actualizarStockEnPantalla(codigo, stock) {
  stockActual[codigo] = stock;

  // 1. Actualizar la tarjeta del producto (si se está viendo esa categoría)
  const tarjeta = document.querySelector(
    `#contenedor-productos [data-codigo="${codigo}"]`
  );
  if (tarjeta) {
    const textoStock = tarjeta.querySelector(".stock");
    const boton = tarjeta.querySelector(".btn-mas");
    tarjeta.dataset.stock = stock;
    textoStock.textContent = stock > 0 ? "Stock: " + stock : "AGOTADO";
    textoStock.classList.toggle("stock-bajo", stock <= 5);
    textoStock.classList.toggle("stock-agotado", stock <= 0);
    tarjeta.classList.toggle("agotado", stock <= 0);
    boton.disabled = stock <= 0;

    // Destello para que se note que cambió
    textoStock.classList.add("stock-cambio");
    setTimeout(() => textoStock.classList.remove("stock-cambio"), 800);
  }

  // 2. Revisar si ese producto está en el carrito de este mesero
  const producto = carrito.find((pro) => pro.codigo == codigo);
  if (!producto) return;

  producto.stock = stock;

  if (stock <= 0) {
    // Se agotó: se quita del carrito
    carrito = carrito.filter((pro) => pro.codigo != codigo);
    mostrarAviso(`"${producto.nombre}" se agotó y se quitó de tu pedido.`);
  } else if (producto.cantidadCompra > stock) {
    // Quedan menos de los que tenía: se ajusta la cantidad
    producto.cantidadCompra = stock;
    producto.subtotal = producto.cantidadCompra * producto.precio;
    mostrarAviso(`Solo quedan ${stock} de "${producto.nombre}". Se ajustó tu pedido.`);
  }

  actualizarCarrito();
}

// Escuchar los avisos del servidor
if (typeof io !== "undefined") {
  const socket = io();

  socket.on("stockActualizado", (datos) => {
    datos.productos.forEach((p) => {
      actualizarStockEnPantalla(String(p.codigo), Number(p.stock));
    });
  });
}