// public/js/socket/clienteSocket.js
import { io } from "/socket.io/socket.io.esm.min.js";

// Inicializas la conexión
export const socket = io();

// Escuchas el evento cuando se actualiza un pedido
socket.on("estadoMesaCambiado", ({ codMesa, nuevoEstado }) => {
  // 1. Buscar si la mesa existe en la pantalla actual
  const tarjetaMesa = document.querySelector(`a[data-id="${codMesa}"]`);

  if (tarjetaMesa) {
    // 2. Limpiar las clases anteriores de estado y agregar la nueva
    tarjetaMesa.classList.remove("LIBRE", "OCUPADA", "ESPERA");
    tarjetaMesa.classList.add(nuevoEstado);

    // 3. Actualizar el texto del estado (el <span> interno)
    const spanEstado = tarjetaMesa.querySelector("span");
    if (spanEstado) {
      spanEstado.textContent = nuevoEstado;
    }

    // 4. Actualizar el comportamiento del enlace según el nuevo estado
    if (nuevoEstado === "LIBRE") {
      tarjetaMesa.setAttribute("href", `/mesero/nroPersonas/${codMesa}`);
    } else {
      tarjetaMesa.setAttribute("href", "#");
    }
  }
});