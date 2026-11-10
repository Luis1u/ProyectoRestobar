import { io } from "/socket.io/socket.io.esm.min.js";
  const socket = io();


  // 1. Referencia al audio del bar
const audioBar = document.getElementById("audioBar");
const audioCocina = document.getElementById("audioCocina");

// --- TRUCO PARA DESBLOQUEAR AMBOS AUDIOS AL INICIO ---
function desbloquearAudiosIniciales() {
  const audios = [audioBar, audioCocina];
  
  audios.forEach(audio => {
    if (audio) {
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.muted = false; // El audio queda listo y autorizado
        console.log("Audio desbloqueado para sonar sin permisos.");
      }).catch(err => {
        console.log("Esperando interacción...", err);
      });
    }
  });

  // Se remueven para que solo se ejecute con el primer clic o tecla
  window.removeEventListener('click', desbloquearAudiosIniciales);
  window.removeEventListener('keydown', desbloquearAudiosIniciales);
}

// Se activa con el primer clic o tecla que dé el mesero en la pantalla
window.addEventListener('click', desbloquearAudiosIniciales, { once: true });
window.addEventListener('keydown', desbloquearAudiosIniciales, { once: true });
// ==========================================

// --- INICIALIZACIÓN SEGURA ---
const badgeInicial = document.getElementById("badgePedidosListos");
let cantidadPedidosListos = 0;

if (badgeInicial) {
  let textoSpan = badgeInicial.textContent.trim();
  let numeroParseado = parseInt(textoSpan);
  if (!isNaN(numeroParseado) && numeroParseado > 0) {
    cantidadPedidosListos = numeroParseado;
  }
}

function actualizarBadge(nuevoNumero) {
  // Actualizamos nuestra variable global asegurando que nunca sea menor a 0
  cantidadPedidosListos = Math.max(0, nuevoNumero);

  // 1. Buscamos el span por su ID
  const badge = document.getElementById("badgePedidosListos");
  
  // 2. Verificamos si el badge existe en el DOM
  if (badge) {
    if (cantidadPedidosListos > 0) {
      // Si es mayor a 0, cambiamos el texto y nos aseguramos de que se vea
      badge.textContent = cantidadPedidosListos;
      badge.style.display = "inline-block"; 
    } else {
      // Si es 0 o menor, ocultamos la burbuja para que no aparezca vacía
      badge.style.display = "none";
    }
  } else {
    console.warn("El elemento #badgePedidosListos no existe en el DOM.");
  }
}

socket.on('restarPedidoListo', (data) => {
  
    actualizarBadge(cantidadPedidosListos - 1);
  

});
socket.on("pedidoListo", (data) => {
  // 1. Leemos el ID que está en el input oculto de la vista HTML
  const idMeseroInput = document.getElementById("idMesero");
  const miIdMeseroActual = idMeseroInput ? idMeseroInput.value : null;

  // 2. Comparamos si el ID que viene del servidor (data.idMesero) 
  // es exactamente igual al ID que tenemos nosotros en el input (miIdMeseroActual)
  if (data && data.idMesero && String(data.idMesero) === String(miIdMeseroActual)) {
    
    // Si coincide, hacemos la acción (sonido y badge)
    if (data.tipo === 'BAR') {
      if (audioBar) {
        audioBar.currentTime = 0;
        audioBar.play().catch(error => console.log("Audio bar bloqueado:", error));
      }
    } 
    else if (data.tipo === 'COCINA') {
      if (audioCocina) {
        audioCocina.currentTime = 0;
        audioCocina.play().catch(error => console.log("Audio cocina bloqueo:", error));
      }
    }

    // Actualizamos el contador
    if (typeof actualizarBadge === 'function' && typeof cantidadPedidosListos !== 'undefined') {
      actualizarBadge(cantidadPedidosListos + 1);
    } else {
      // Por si manejas el badge directo en esta vista
      const spanBadge = document.getElementById("badgePedidosListos");
      if (spanBadge) {
        spanBadge.style.display = 'inline-block';
        let valorActual = parseInt(spanBadge.textContent.trim()) || 0;
        spanBadge.textContent = valorActual + 1;
      }
    }

    

  }
});