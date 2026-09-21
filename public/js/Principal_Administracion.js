// const socket = io();

// Para filtrar en el formulario nuevo usuario
function filtrarPersonas(texto) {
  const filtro = texto.toUpperCase();
  const select = document.getElementById("personaUsuario");
  const opciones = select.getElementsByTagName("option");

  for (let i = 0; i < opciones.length; i++) {
    const opt = opciones[i];
    if (!opt.value) continue; // Ignorar la opción por defecto

    const textoOpcion = opt.textContent || opt.innerText;
    if (textoOpcion.toUpperCase().indexOf(filtro) > -1) {
      opt.style.display = "";
    } else {
      opt.style.display = "none";
    }
  }
}

// Para nuevo y modificar producto base64 (Unificada para evitar conflicto de nombres)
function convertirYPrevisualizarBase64(
  input,
  idPreview = "previewFotoProducto",
  idHiddenInput = "fotoBase64"
) {
  const archivo = input.files[0];
  const previewImg = document.getElementById(idPreview);
  const hiddenInput = document.getElementById(idHiddenInput);

  if (archivo && previewImg && hiddenInput) {
    const lector = new FileReader();

    lector.onload = function (e) {
      const cadenaBase64 = e.target.result; // Contiene data:image/...;base64,...

      // 1. Mostrar la vista previa
      previewImg.src = cadenaBase64;
      previewImg.style.display = "inline-block";

      // 2. Asignar el valor Base64 al input oculto
      hiddenInput.value = cadenaBase64;
    };

    lector.readAsDataURL(archivo);
  } else if (previewImg && hiddenInput) {
    previewImg.src = "";
    previewImg.style.display = "none";
    hiddenInput.value = "";
  }
}

// Para que al modificar un producto se vea la imagen
function mostrarVistaPreviaArchivo(event) {
  const archivo = event.target.files[0];
  const img = document.getElementById("vistaPreviaImagen");
  if (archivo && img) {
    img.src = URL.createObjectURL(archivo);
  }
}

//#region Metodos Globales para boton
function convertirMayusculas(input) {
  input.value = input.value.toUpperCase();
}

function ActualizarContenido(url) {
  console.log(url);

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener la respuesta del servidor");
      }
      return response.text();
    })
    .then((html) => {
      const contenedor = document.getElementById("contenedor_dinamico");
      contenedor.innerHTML = html;
    })
    .catch((error) => {
      console.error("Ocurrió un error:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo cargar la información.</p>`;
    });
}
//#endregion

//#region Eventos Repatartidor
// RepartidorLista.ejs

function filtrarTabla() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const filas = document.querySelectorAll("#tablaCuerpo tr");

  filas.forEach((fila) => {
    const textoFila = fila.innerText.toLowerCase();
    if (textoFila.includes(input)) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}

// Función para ver la información completa de los repartidores (AHORA GLOBAL)
function verRepartidor(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener la respuesta del servidor");
      }
      return response.text();
    })
    .then((html) => {
      const contenedor = document.getElementById("contenedor_dinamico");
      contenedor.innerHTML = html;
    })
    .catch((error) => {
      console.error("Ocurrió un error:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo cargar la información.</p>`;
    });
}

// Para formularios
function EnviarFormularioPersona(event, funcion, idFormulario, url) {
  event.preventDefault();

  // 1. Obtención de valores (con trim para eliminar espacios innecesarios)
  const capsnumcid =
    document.getElementsByName("capsnumcid")[0]?.value.trim() || "";
  const capsnomper =
    document.getElementsByName("capsnomper")[0]?.value.trim() || "";
  const capsapepat =
    document.getElementsByName("capsapepat")[0]?.value.trim() || "";
  const capsapemat =
    document.getElementsByName("capsapemat")[0]?.value.trim() || "";
  const capsnumcel =
    document.getElementsByName("capsnumcel")[0]?.value.trim() || "";
  const capscorele =
    document.getElementsByName("capscorele")[0]?.value.trim() || "";
  const capsestper =
    document.getElementsByName("capsestper")[0]?.value.trim() || "";
  const capsfecnac =
    document.getElementsByName("capsfecnac")[0]?.value.trim() || "";
  const capssexper =
    document.getElementsByName("capssexper")[0]?.value.trim() || "";
  const capsdirper =
    document.getElementsByName("capsdirper")[0]?.value.trim() || "";

  // 2. Elementos donde se mostrarán los errores
  const cjaErrorCapsnumcid = document.getElementById("cjaErrorCapsnumcid");
  const cjaErrorCapsnomper = document.getElementById("cjaErrorCapsnomper");
  const cjaErrorCapsapepat = document.getElementById("cjaErrorCapsapepat");
  const cjaErrorCapsapemat = document.getElementById("cjaErrorCapsapemat");
  const cjaErrorCapsnumcel = document.getElementById("cjaErrorCapsnumcel");
  const cjaErrorCapscorele = document.getElementById("cjaErrorCapscorele");
  const cjaErrorCapsestper = document.getElementById("cjaErrorCapsestper");
  const cjaErrorCapsfecnac = document.getElementById("cjaErrorCapsfecnac");
  const cjaErrorCapssexper = document.getElementById("cjaErrorCapssexper");
  const cjaErrorCapsdirper = document.getElementById("cjaErrorCapsdirper");

  // 3. Función auxiliar para limpiar mensajes previos
  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorCapsnumcid,
      cjaErrorCapsnomper,
      cjaErrorCapsapepat,
      cjaErrorCapsapemat,
      cjaErrorCapsnumcel,
      cjaErrorCapscorele,
      cjaErrorCapsestper,
      cjaErrorCapsfecnac,
      cjaErrorCapssexper,
      cjaErrorCapsdirper
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  // 4. Proceso de validación
  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // Expresiones regulares para validaciones comunes
    const regexTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexCelular = /^[67]\d{7}$/; // Formato común de celular de 8 dígitos (inicia en 6 o 7)
    const regexCI = /^\d{5,10}(-[0-9A-Z]{1,2})?$/i; // Acepta números y extensión (ej: 1234567 o 1234567-1B)

    // Cédula de Identidad / Documento
    if (!capsnumcid) {
      if (cjaErrorCapsnumcid)
        cjaErrorCapsnumcid.textContent =
          "El documento de identidad es obligatorio.";
      esValido = false;
    } else if (!regexCI.test(capsnumcid)) {
      if (cjaErrorCapsnumcid)
        cjaErrorCapsnumcid.textContent =
          "Ingrese un número de documento válido.";
      esValido = false;
    }

    // Nombre
    if (!capsnomper) {
      if (cjaErrorCapsnomper)
        cjaErrorCapsnomper.textContent = "El nombre es obligatorio.";
      esValido = false;
    } else if (!regexTexto.test(capsnomper)) {
      if (cjaErrorCapsnomper)
        cjaErrorCapsnomper.textContent = "El nombre solo debe contener letras.";
      esValido = false;
    }

    if (capsapemat || capsapepat) {
      // Apellido Paterno(opcional pero si llena solo letras)
      if (capsapepat && !regexTexto.test(capsapepat)) {
        if (cjaErrorCapsapepat)
          cjaErrorCapsapepat.textContent =
            "El apellido apterno solo debe contener letras.";
        esValido = false;
      }

      // Apellido Materno (Opcional, pero si se llena debe ser solo letras)
      if (capsapemat && !regexTexto.test(capsapemat)) {
        if (cjaErrorCapsapemat)
          cjaErrorCapsapemat.textContent =
            "El apellido materno solo debe contener letras.";
        esValido = false;
      }
    } else {
      cjaErrorCapsapemat.textContent = "Deve ingresar un apellido";
      cjaErrorCapsapepat.textContent = "Deve ingresar un apellido";
    }

    // Número de Celular
    if (!capsnumcel) {
      if (cjaErrorCapsnumcel)
        cjaErrorCapsnumcel.textContent = "El número de celular es obligatorio.";
      esValido = false;
    } else if (!regexCelular.test(capsnumcel)) {
      if (cjaErrorCapsnumcel)
        cjaErrorCapsnumcel.textContent =
          "Ingrese un número de celular válido de 8 dígitos.";
      esValido = false;
    }

    // Correo Electrónico
    if (!capscorele) {
      if (cjaErrorCapscorele)
        cjaErrorCapscorele.textContent =
          "El correo electrónico es obligatorio.";
      esValido = false;
    } else if (!regexEmail.test(capscorele)) {
      if (cjaErrorCapscorele)
        cjaErrorCapscorele.textContent =
          "Ingrese un correo electrónico válido.";
      esValido = false;
    }

    // Estado del Registro / Persona (ej. Activo/Inactivo o Select)
    if (!capsestper) {
      if (cjaErrorCapsestper)
        cjaErrorCapsestper.textContent = "Seleccione el estado.";
      esValido = false;
    }

    // Fecha de Nacimiento
    if (!capsfecnac) {
      if (cjaErrorCapsfecnac)
        cjaErrorCapsfecnac.textContent =
          "La fecha de nacimiento es obligatoria.";
      esValido = false;
    } else {
      const fechaNac = new Date(capsfecnac);
      const hoy = new Date();
      if (fechaNac >= hoy) {
        if (cjaErrorCapsfecnac)
          cjaErrorCapsfecnac.textContent =
            "La fecha debe ser anterior a la fecha actual.";
        esValido = false;
      }
    }

    // Género / Sexo
    if (!capssexper) {
      if (cjaErrorCapssexper)
        cjaErrorCapssexper.textContent = "Seleccione el género.";
      esValido = false;
    }

    // Dirección
    if (!capsdirper) {
      if (cjaErrorCapsdirper)
        cjaErrorCapsdirper.textContent = "La dirección es obligatoria.";
      esValido = false;
    } else if (capsdirper.length < 5) {
      if (cjaErrorCapsdirper)
        cjaErrorCapsdirper.textContent =
          "La dirección debe ser más específica (mínimo 5 caracteres).";
      esValido = false;
    }

    return esValido;
  }

  if (!validarFormulario()) {
    return;
  }

  const formulario = document.getElementById(idFormulario);
  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());

 
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        return response.text();
      })
      .then((resultado) => {
        if (resultado === "EXISTE") {
          cjaErrorCapsnumcid.textContent = "Este CI ya está en uso";
          const ci = document.getElementsByName("capsnumcid")[0];
          ci.focus();
          return;
        }
        document.getElementById("contenedor_dinamico").innerHTML = resultado;
      })
      .catch((error) => {
        console.error("Ocurrió un error:", error);
        document.getElementById("contenedor_dinamico").innerHTML =
          `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
        return;
      });
  

  


}

function EnviarFormularioProducto(event, funcion, idFormulario, url) {
  event.preventDefault();

  // 1. Obtención de valores (con trim y fallback)
  const capdnompro = document.getElementsByName("capdnompro")[0]?.value.trim() || "";
  const capddespro = document.getElementsByName("capddespro")[0]?.value.trim() || "";
  const capdingpro = document.getElementsByName("capdingpro")[0]?.value.trim() || "";
  const capdpreven = document.getElementsByName("capdpreven")[0]?.value.trim() || "";
  const capdstodia = document.getElementsByName("capdstodia")[0]?.value.trim() || "";
  const capdfotpro = document.getElementsByName("capdfotpro")[0]?.value.trim() || "";
  const capdestpro = document.getElementsByName("capdestpro")[0]?.value.trim() || "";

  // 2. Elementos donde se mostrarán los errores
 
  const cjaErrorCapdnompro = document.getElementById("cjaErrorCapdnompro");
  const cjaErrorCapddespro = document.getElementById("cjaErrorCapddespro");
  const cjaErrorCapdingpro = document.getElementById("cjaErrorCapdingpro");
  const cjaErrorCapdpreven = document.getElementById("cjaErrorCapdpreven");
  const cjaErrorCapdstodia = document.getElementById("cjaErrorCapdstodia");
  const cjaErrorCapdfotpro = document.getElementById("cjaErrorCapdfotpro");
  const cjaErrorCapdestpro = document.getElementById("cjaErrorCapdestpro");

  // 3. Función auxiliar para limpiar mensajes previos
  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorCapdnompro,
      cjaErrorCapddespro,
      cjaErrorCapdingpro,
      cjaErrorCapdpreven,
      cjaErrorCapdstodia,
      cjaErrorCapdfotpro,
      cjaErrorCapdestpro
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  // 4. Proceso de validación
  function validarFormulario() {
    limpiarErrores();
    let esValido = true;


    // Nombre del Producto (Requerido, mínimo 3 caracteres)
    if (!capdnompro) {
      if (cjaErrorCapdnompro)
        cjaErrorCapdnompro.textContent = "El nombre del producto es obligatorio.";
      esValido = false;
    } else if (capdnompro.length < 3) {
      if (cjaErrorCapdnompro)
        cjaErrorCapdnompro.textContent = "El nombre debe tener al menos 3 caracteres.";
      esValido = false;
    }

    // Descripción (pero si se ingresa debe tener al menos 5 caracteres)
    if (!capddespro || capddespro.length < 5) {
      if (cjaErrorCapddespro)
        cjaErrorCapddespro.textContent = "Deve introducir una descripcion (mínimo 5 caracteres).";
      esValido = false;
    }
    if(!capdingpro){
      cjaErrorCapdingpro.textContent = "Deve ingresar los ingredientes del producto";
    }


    // Precio de Venta (Requerido, numérico y mayor a 0)
    if (!capdpreven) {
      if (cjaErrorCapdpreven)
        cjaErrorCapdpreven.textContent = "El precio de venta es obligatorio.";
      esValido = false;
    } else if (isNaN(capdpreven) || parseFloat(capdpreven) <= 0) {
      if (cjaErrorCapdpreven)
        cjaErrorCapdpreven.textContent = "Ingrese un precio válido mayor a 0.";
      esValido = false;
    }

    // Stock Diario (Requerido, número entero mayor o igual a 0)
    if (!capdstodia) {
      if (cjaErrorCapdstodia)
        cjaErrorCapdstodia.textContent = "El stock diario es obligatorio.";
      esValido = false;
    } else if (isNaN(capdstodia) || parseInt(capdstodia, 10) < 0) {
      if (cjaErrorCapdstodia)
        cjaErrorCapdstodia.textContent = "Ingrese un valor de stock válido (0 o mayor).";
      esValido = false;
    }

    // Estado del Producto
    if (!capdestpro) {
      if (cjaErrorCapdestpro)
        cjaErrorCapdestpro.textContent = "Seleccione el estado del producto.";
      esValido = false;
    }

    return esValido;
  }

  // Si la validación falla, interrumpe la ejecución
  if (!validarFormulario()) {
    return;
  }

  // 5. Envío mediante Fetch
  const formulario = document.getElementById(idFormulario);
  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.text();
    })
    .then((resultado) => {
      if (resultado === "EXISTE") {
        if (cjaErrorCapdnompro)
          cjaErrorCapdnompro.textContent = "Este producto ya se encuentra registrado.";
        const nomInput = document.getElementsByName("capdnompro")[0];
        nomInput?.focus();
        return;
      }
      document.getElementById("contenedor_dinamico").innerHTML = resultado;
    })
    .catch((error) => {
      console.error("Ocurrió un error al guardar el producto:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}

function EnviarFormularioUsuario(event, funcion, idFormulario, url) {
  event.preventDefault();

  // 1. Obtención de valores (con trim y fallback)
  const papscodper = document.getElementsByName("papscodper")[0]?.value.trim() || "";
  const causnomlog = document.getElementsByName("causnomlog")[0]?.value.trim() || "";
  const causpasswo = document.getElementsByName("causpasswo")[0]?.value.trim() || "";
  const causrolusu = document.getElementsByName("causrolusu")[0]?.value.trim() || "";
  const causestusu = document.getElementsByName("causestusu")[0]?.value.trim() || "";

  // 2. Elementos para mostrar mensajes de error
  const cjaErrorPapscodper = document.getElementById("cjaErrorPapscodper");
  const cjaErrorCausnomlog = document.getElementById("cjaErrorCausnomlog");
  const cjaErrorCauspasswo = document.getElementById("cjaErrorCauspasswo");
  const cjaErrorCausrolusu = document.getElementById("cjaErrorCausrolusu");
  const cjaErrorCausestusu = document.getElementById("cjaErrorCausestusu");

  // 3. Limpieza de mensajes previos
  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorPapscodper,
      cjaErrorCausnomlog,
      cjaErrorCauspasswo,
      cjaErrorCausrolusu,
      cjaErrorCausestusu
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  // 4. Lógica de validación
  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // Persona asociada / FK (Requerido)
    if (!papscodper) {
      if (cjaErrorPapscodper)
        cjaErrorPapscodper.textContent = "Debe seleccionar una persona asociada.";
      esValido = false;
    }

    // Nombre de usuario / Login (Requerido, mínimo 4 caracteres)
    if (!causnomlog) {
      if (cjaErrorCausnomlog)
        cjaErrorCausnomlog.textContent = "El nombre de usuario es obligatorio.";
      esValido = false;
    } else if (causnomlog.length < 4) {
      if (cjaErrorCausnomlog)
        cjaErrorCausnomlog.textContent = "El usuario debe tener al menos 4 caracteres.";
      esValido = false;
    }

    // Contraseña (Requerida en 'agregar', mínimo 6 caracteres)
    if (funcion === 'agregar' && !causpasswo) {
      if (cjaErrorCauspasswo)
        cjaErrorCauspasswo.textContent = "La contraseña es obligatoria.";
      esValido = false;
    } else if (causpasswo && causpasswo.length < 6) {
      if (cjaErrorCauspasswo)
        cjaErrorCauspasswo.textContent = "La contraseña debe tener al menos 6 caracteres.";
      esValido = false;
    }

    // Rol de usuario (Requerido)
    if (!causrolusu) {
      if (cjaErrorCausrolusu)
        cjaErrorCausrolusu.textContent = "Debe seleccionar un rol para el usuario.";
      esValido = false;
    }

    // Estado del usuario (Requerido)
    if (!causestusu) {
      if (cjaErrorCausestusu)
        cjaErrorCausestusu.textContent = "Debe seleccionar el estado del usuario.";
      esValido = false;
    }

    return esValido;
  }

  // Detener si falla la validación
  if (!validarFormulario()) {
    return;
  }

  // 5. Envío de datos vía Fetch
  const formulario = document.getElementById(idFormulario);
  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.text();
    })
    .then((resultado) => {
      if (resultado === "EXISTE") {
        if (cjaErrorCausnomlog)
          cjaErrorCausnomlog.textContent = "El nombre de usuario ya se encuentra registrado.";
        const logInput = document.getElementsByName("causnomlog")[0];
        logInput?.focus();
        return;
      }
      document.getElementById("contenedor_dinamico").innerHTML = resultado;
    })
    .catch((error) => {
      console.error("Error al procesar el usuario:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}

// Para formularios
function EnviarFormularioCategoria(event, funcion, idFormulario, url) {
  event.preventDefault();

  const cacpnomcat = document.getElementsByName("cacpnomcat")[0]?.value;
  const cacpdescat = document.getElementsByName("cacpdescat")[0]?.value;

  const cjaErrorCacpnomcat = document.getElementById("cjaErrorCacpnomcat");
  const cjaErrorCacpdescat = document.getElementById("cjaErrorCacpdescat");

  if (cjaErrorCacpnomcat) cjaErrorCacpnomcat.textContent = "";
  if (cjaErrorCacpdescat) cjaErrorCacpdescat.textContent = "";

  const formulario = document.getElementById(idFormulario);
  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());

  if (funcion == "modificar") {
    console.log(url, funcion);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.text();
      })
      .then((html) => {
        document.getElementById("contenedor_dinamico").innerHTML = html;
      })
      .catch((error) => {
        console.error("Ocurrió un error:", error);
      });
    return;
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById("contenedor_dinamico").innerHTML = html;
    })
    .catch((error) => {
      console.error("Ocurrió un error:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}

function EnviarFormularioMesa(event, funcion, idFormulario, url) {
  event.preventDefault();

  const camlnummes = document.getElementsByName("camlnummes")[0]?.value;
  const camlcapmes = document.getElementsByName("camlcapmes")[0]?.value;
  const camldesmes = document.getElementsByName("camldesmes")[0]?.value;
  const camlactmes = document.getElementsByName("camlactmes")[0]?.value;
  const camlestmes = document.getElementsByName("camlestmes")[0]?.value;

  // Referencias a los contenedores de error
  const cjaErrorCamlnummes = document.getElementById("cjaErrorCamlnummes");
  const cjaErrorCamlcapmes = document.getElementById("cjaErrorCamlcapmes");
  const cjaErrorCamldesmes = document.getElementById("cjaErrorCamldesmes");
  const cjaErrorCamlactmes = document.getElementById("cjaErrorCamlactmes");
  const cjaErrorCamlestmes = document.getElementById("cjaErrorCamlestmes");

  // Limpieza de mensajes previos
  if (cjaErrorCamlnummes) cjaErrorCamlnummes.textContent = "";
  if (cjaErrorCamlcapmes) cjaErrorCamlcapmes.textContent = "";
  if (cjaErrorCamldesmes) cjaErrorCamldesmes.textContent = "";
  if (cjaErrorCamlactmes) cjaErrorCamlactmes.textContent = "";
  if (cjaErrorCamlestmes) cjaErrorCamlestmes.textContent = "";

  const formulario = document.getElementById(idFormulario);
  const formData = new FormData(formulario);
  const data = Object.fromEntries(formData.entries());

  if (funcion == "modificar") {
    console.log(url, funcion);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return response.text();
      })
      .then((html) => {
        document.getElementById("contenedor_dinamico").innerHTML = html;
      })
      .catch((error) => {
        console.error("Ocurrió un error:", error);
      });
    return;
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById("contenedor_dinamico").innerHTML = html;
    })
    .catch((error) => {
      console.error("Ocurrió un error:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}
//#endregion
