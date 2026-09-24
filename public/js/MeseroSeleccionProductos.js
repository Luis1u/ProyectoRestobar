let ban = false;
let carrito = [];
function cargarProductosPorCategoria(url, btnCat) {
  console.log(url);
  if (ban) {
    const btnActual = document.querySelector(".btn-categoria.activa");
    btnActual.className = "btn-categoria";
    btnCat.className = "btn-categoria activa";
  } else {
    btnCat.className = "btn-categoria activa";
    ban = true;
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener la respuesta del servidor");
      }
      return response.text();
    })
    .then((html) => {
      const contenedor = document.getElementById("contenedor-productos");
      contenedor.innerHTML = html;
    })
    .catch((error) => {
      console.error("Ocurrió un error:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo cargar la información.</p>`;
    });
}
// 1. Mueve la función de renderizado afuera para que sea global y reutilizable
function cambiarCantidad(codigo, cambio) {
  const producto = carrito.find((pro) => pro.codigo == codigo);
  if (!producto) return;

  const nuevaCantidad = producto.cantidadCompra + cambio;

  if (nuevaCantidad > producto.stock) {
    alert(`No hay suficiente stock. Máximo: ${producto.stock}`);
    return;
  }

  if (nuevaCantidad > 0) {
    producto.cantidadCompra = nuevaCantidad;
    producto.subtotal = producto.cantidadCompra * producto.precio;
  } else {
    // Si la cantidad llega a 0, se remueve el producto
    eliminarProducto(codigo);
    return;
  }

  actualizarCarrito();
}
function eliminarProducto(codigo) {
  carrito = carrito.filter((pro) => pro.codigo != codigo);
  actualizarCarrito();
}
function actualizarNota(codigo, textoNota) {
  const producto = carrito.find((pro) => pro.codigo === codigo);
  if (producto) {
    producto.nota = textoNota;
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  const contenedor = document.getElementById("contenedor-detalle");
  const cajaTotal = document.getElementById("txt-total");

  if (!contenedor || !cajaTotal) return; // Validación de seguridad

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío.</p>";
    cajaTotal.textContent = "0.00";
    return;
  }

  let totalGeneral = 0;

  carrito.forEach((pro) => {
    totalGeneral += pro.subtotal;

    contenedor.innerHTML += `
         <div class="item-carrito">
           <button class="btn-eliminar" title="Eliminar producto" onclick="eliminarProducto('${pro.codigo}')">✕</button>
           
           <div class="info-producto">
             <strong>${pro.nombre}</strong><br>
             Precio: $${Number(pro.precio).toFixed(2)}
           </div>
   
           <div class="controles-cantidad">
             <span>Cantidad:</span>
             <button class="btn-cantidad" onclick="cambiarCantidad('${pro.codigo}', -1)">-</button>
             <strong>${pro.cantidadCompra}</strong>
             <button class="btn-cantidad" onclick="cambiarCantidad('${pro.codigo}', 1)" ${pro.cantidadCompra >= pro.stock ? "disabled" : ""}>+</button>
           </div>
   
           <div>
             <strong>Subtotal:</strong> $${Number(pro.subtotal).toFixed(2)}
           </div>
   
           <div>
             <input type="text" 
                    class="input-nota" 
                    placeholder="Añadir una nota (ej. Sin cebolla, extra salsa)..." 
                    value="${pro.nota || ""}" 
                    onchange="actualizarNota('${pro.codigo}', this.value)">
           </div>
         </div>
       `;
  });

  cajaTotal.textContent = totalGeneral.toFixed(2);
}
// 2. Función para agregar productos arreglada sin errores de variables
function AgregarAlPedido(codigo, stockVal, precioVal, nombre) {
  // Nombres de variables distintos a los parámetros para evitar el SyntaxError
  const precioNum = Number(precioVal) || 0;
  const stockNum = Number(stockVal) || 0;

  const productoExistente = carrito.find((pro) => pro.codigo === codigo);

  if (productoExistente) {
    if (productoExistente.cantidadCompra < stockNum) {
      productoExistente.cantidadCompra += 1;
      productoExistente.subtotal =
        productoExistente.cantidadCompra * productoExistente.precio;
    } else {
      console.log(`Sin stock suficiente para el producto: ${codigo}`);
    }
  } else {
    const nuevoProducto = {
      codigo: codigo,
      nombre: nombre,
      stock: stockNum,
      precio: precioNum,
      cantidadCompra: 1,
      subtotal: precioNum,
      nota: ""
    };
    carrito.push(nuevoProducto);
  }

  actualizarCarrito();
}
function enviarPedido(url) {
  const textoTotal = document.getElementById("txt-total").innerText;
  const cajaTotal = parseFloat(textoTotal.replace("Bs.", "").trim()) || 0.0;
  const datosMesa = document.getElementById("datosMesa").value;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productos: carrito,
      datosMesa: datosMesa,
      total: cajaTotal
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta de la red");
      }
      return response.json(); // Esperamos respuesta en formato JSON desde el servidor
    })
    .then((data) => {
      // 2. El servidor responde con la validación
      if (data.success) {
        // Si no hay errores, redirigimos a la página deseada
        window.location.href = data.url;
      } else {
        // Si el servidor detectó que un producto se agotó
        alert(
          data.mensaje ||
            "Lo sentimos, uno de los productos se acaba de agotar."
        );
      }
    })
    .catch((error) => {
      console.error("Error al procesar la solicitud:", error);
      alert("Ocurrió un problema de conexión al validar el pedido.");
    });
}
