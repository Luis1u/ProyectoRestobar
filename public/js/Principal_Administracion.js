// const socket = io();

function filtrarPersonas(texto) {
  const filtro = texto.toUpperCase();
  const select = document.getElementById("personaUsuario");
  const opciones = select.getElementsByTagName("option");

  for (let i = 0; i < opciones.length; i++) {
    const opt = opciones[i];
    if (!opt.value) continue; 

    const textoOpcion = opt.textContent || opt.innerText;
    if (textoOpcion.toUpperCase().indexOf(filtro) > -1) {
      opt.style.display = "";
    } else {
      opt.style.display = "none";
    }
  }
}
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
// ?
function mostrarVistaPreviaArchivo(event) {
  const archivo = event.target.files[0];
  const img = document.getElementById("vistaPreviaImagen");
  if (archivo && img) {
    img.src = URL.createObjectURL(archivo);
  }
}
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
function EnviarFormularioPersona(event, funcion, idFormulario, url) {
  event.preventDefault();

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

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // Permite de 2 a 50 caracteres
    const regexTexto50 = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;  
    const regexTexto100 = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,100}$/;  
   // Exige que la extensión tenga entre 2 y 6 letras
    const regexEmailConLimite = /^[^\s@]+@[^\s@]+\.[^\s@]{2,6}$/;
    const regexCelular = /^[67]\d{7}$/; // Formato común de celular de 8 dígitos (inicia en 6 o 7)
    const regexCI = /^\d{5,10}(-[0-9A-Z]{1,2})?$/i; // Acepta números y extensión (ej: 1234567 o 1234567-1B)

    if (!capsnumcid) {
      if (cjaErrorCapsnumcid) {
        cjaErrorCapsnumcid.textContent =
          "El documento de identidad es obligatorio.";
      }
      esValido = false;
    } else if (!regexCI.test(capsnumcid)) {
      if (cjaErrorCapsnumcid) {
        cjaErrorCapsnumcid.textContent =
          "Ingrese un número de documento válido.";
      }
      esValido = false;
    }

    if (!capsnomper) {
      if (cjaErrorCapsnomper) {
        cjaErrorCapsnomper.textContent = "El nombre es obligatorio.";
      }
      esValido = false;
    } else if (!regexTexto100.test(capsnomper)) {
      if (cjaErrorCapsnomper) {
        cjaErrorCapsnomper.textContent = "El nombre solo debe contener letras.";
      }
      esValido = false;
    }

    if (capsapemat || capsapepat) {
      if (capsapepat && !regexTexto50.test(capsapepat)) {
        if (cjaErrorCapsapepat) {
          cjaErrorCapsapepat.textContent =
            "El apellido paterno solo debe contener letras.";
        }
        esValido = false;
      }

      if (capsapemat && !regexTexto50.test(capsapemat)) {
        if (cjaErrorCapsapemat) {
          cjaErrorCapsapemat.textContent =
            "El apellido materno solo debe contener letras.";
        }
        esValido = false;
      }
    } else {
      if (cjaErrorCapsapemat) {
        cjaErrorCapsapemat.textContent = "Debe ingresar un apellido";
      }
      if (cjaErrorCapsapepat) {
        cjaErrorCapsapepat.textContent = "Debe ingresar un apellido";
      }
      esValido = false;
    }

    if (!capsnumcel) {
      if (cjaErrorCapsnumcel) {
        cjaErrorCapsnumcel.textContent = "El número de celular es obligatorio.";
      }
      esValido = false;
    } else if (!regexCelular.test(capsnumcel)) {
      if (cjaErrorCapsnumcel) {
        cjaErrorCapsnumcel.textContent =
          "Ingrese un número de celular válido de 8 dígitos.";
      }
      esValido = false;
    }

    if (!capscorele) {
      if (cjaErrorCapscorele) {
        cjaErrorCapscorele.textContent =
          "El correo electrónico es obligatorio.";
      }
      esValido = false;
    } else if (!regexEmailConLimite.test(capscorele)) {
      if (cjaErrorCapscorele) {
        cjaErrorCapscorele.textContent =
          "Ingrese un correo electrónico válido.";
      }
      esValido = false;
    }

    if (!capsestper) {
      if (cjaErrorCapsestper) {
        cjaErrorCapsestper.textContent = "Seleccione el estado.";
      }
      esValido = false;
    }

    if (!capsfecnac) {
      if (cjaErrorCapsfecnac) {
        cjaErrorCapsfecnac.textContent =
          "La fecha de nacimiento es obligatoria.";
      }
      esValido = false;
    } else {
      const fechaNac = new Date(capsfecnac);
      const hoy = new Date();
      if (fechaNac >= hoy) {
        if (cjaErrorCapsfecnac) {
          cjaErrorCapsfecnac.textContent =
            "La fecha debe ser anterior a la fecha actual.";
        }
        esValido = false;
      }
    }

    if (!capssexper) {
      if (cjaErrorCapssexper) {
        cjaErrorCapssexper.textContent = "Seleccione el género.";
      }
      esValido = false;
    }

    if (!capsdirper) {
      if (cjaErrorCapsdirper) {
        cjaErrorCapsdirper.textContent = "La dirección es obligatoria.";
      }
      esValido = false;
    } else if (capsdirper.length < 5) {
      if (cjaErrorCapsdirper) {
        cjaErrorCapsdirper.textContent =
          "La dirección debe ser más específica (mínimo 5 caracteres).";
      }
      esValido = false;
    } else if (capsdirper.length > 100) {
      if (cjaErrorCapsdirper) {
        cjaErrorCapsdirper.textContent =
          "La dirección debe ser más corta (máximo 100 caracteres).";
      }
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
        if (cjaErrorCapsnumcid) {
          cjaErrorCapsnumcid.textContent = "Este CI ya está en uso";
        }
        const ci = document.getElementsByName("capsnumcid")[0];
        if (ci) ci.focus();
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

  const fapncodcat =
    document.getElementsByName("fapncodcat")[0]?.value.trim() || "";
  const capdnompro =
    document.getElementsByName("capdnompro")[0]?.value.trim() || "";
  const capddespro =
    document.getElementsByName("capddespro")[0]?.value.trim() || "";
  const capdingpro =
    document.getElementsByName("capdingpro")[0]?.value.trim() || "";
  const capdpreven =
    document.getElementsByName("capdpreven")[0]?.value.trim() || "";
  const capdstodia =
    document.getElementsByName("capdstodia")[0]?.value.trim() || "";
  const capdfotpro =
    document.getElementsByName("capdfotpro")[0]?.value.trim() || "";
  const capdestpro =
    document.getElementsByName("capdestpro")[0]?.value.trim() || "";

  const cjaErrorFapncodcat = document.getElementById("cjaErrorFapncodcat");
  const cjaErrorCapdnompro = document.getElementById("cjaErrorCapdnompro");
  const cjaErrorCapddespro = document.getElementById("cjaErrorCapddespro");
  const cjaErrorCapdingpro = document.getElementById("cjaErrorCapdingpro");
  const cjaErrorCapdpreven = document.getElementById("cjaErrorCapdpreven");
  const cjaErrorCapdstodia = document.getElementById("cjaErrorCapdstodia");
  const cjaErrorCapdfotpro = document.getElementById("cjaErrorCapdfotpro");
  const cjaErrorCapdestpro = document.getElementById("cjaErrorCapdestpro");

  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorFapncodcat,
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

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // 0. Validar Categoría
    if (!fapncodcat) {
      if (cjaErrorFapncodcat) {
        cjaErrorFapncodcat.textContent = "Seleccione una categoría.";
      }
      esValido = false;
    }

    // 1. Validar Nombre (Max 100 según BD)
    if (!capdnompro) {
      if (cjaErrorCapdnompro) {
        cjaErrorCapdnompro.textContent = "El nombre es obligatorio.";
      }
      esValido = false;
    } else if (capdnompro.length < 3) {
      if (cjaErrorCapdnompro) {
        cjaErrorCapdnompro.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (capdnompro.length > 100) {
      if (cjaErrorCapdnompro) {
        cjaErrorCapdnompro.textContent = "Máximo 100 caracteres.";
      }
      esValido = false;
    }

    // 2. Validar Descripción (Max 250 según BD)
    if (!capddespro) {
      if (cjaErrorCapddespro) {
        cjaErrorCapddespro.textContent = "La descripción es obligatoria.";
      }
      esValido = false;
    } else if (capddespro.length < 3) {
      if (cjaErrorCapddespro) {
        cjaErrorCapddespro.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (capddespro.length > 250) {
      if (cjaErrorCapddespro) {
        cjaErrorCapddespro.textContent = "Máximo 250 caracteres.";
      }
      esValido = false;
    }

    // 3. Validar Ingredientes (Max 250 según BD)
    if (!capdingpro) {
      if (cjaErrorCapdingpro) {
        cjaErrorCapdingpro.textContent = "Ingrese los ingredientes.";
      }
      esValido = false;
    } else if (capdingpro.length < 3) {
      if (cjaErrorCapdingpro) {
        cjaErrorCapdingpro.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (capdingpro.length > 250) {
      if (cjaErrorCapdingpro) {
        cjaErrorCapdingpro.textContent = "Máximo 250 caracteres.";
      }
      esValido = false;
    }

    // 4. Validar Precio de Venta (Evita desbordamiento NUMERIC(9,2))
    const precio = parseFloat(capdpreven);
    if (!capdpreven) {
      if (cjaErrorCapdpreven) {
        cjaErrorCapdpreven.textContent = "El precio es obligatorio.";
      }
      esValido = false;
    } else if (isNaN(precio) || precio <= 0) {
      if (cjaErrorCapdpreven) {
        cjaErrorCapdpreven.textContent = "Ingrese un precio mayor a 0.";
      }
      esValido = false;
    } else if (precio >= 10000000) {
      if (cjaErrorCapdpreven) {
        cjaErrorCapdpreven.textContent = "El precio máximo es 9,999,999.99.";
      }
      esValido = false;
    }

    // 5. Validar Stock Diario
    const stock = parseInt(capdstodia, 10);
    if (!capdstodia) {
      if (cjaErrorCapdstodia) {
        cjaErrorCapdstodia.textContent = "El stock es obligatorio.";
      }
      esValido = false;
    } else if (isNaN(stock) || stock < 0) {
      if (cjaErrorCapdstodia) {
        cjaErrorCapdstodia.textContent = "Ingrese un valor mayor o igual a 0.";
      }
      esValido = false;
    } else if (stock > 99999) {
      if (cjaErrorCapdstodia) {
        cjaErrorCapdstodia.textContent = "El stock máximo es 99,999.";
      }
      esValido = false;
    }

    // 6. Validar Estado
    if (!capdestpro) {
      if (cjaErrorCapdestpro) {
        cjaErrorCapdestpro.textContent = "Seleccione el estado.";
      }
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
        if (cjaErrorCapdnompro) {
          cjaErrorCapdnompro.textContent = "El producto ya existe.";
        }
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
function EnviarFormularioCategoria(event, funcion, idFormulario, url) {
  event.preventDefault();

  const cacpnomcat =
    document.getElementsByName("cacpnomcat")[0]?.value.trim() || "";
  const cacpdescat =
    document.getElementsByName("cacpdescat")[0]?.value.trim() || "";
  const cacpestcat =
    document.getElementsByName("cacpestcat")[0]?.value.trim() || "";
  const cacptipcat =
    document.getElementsByName("cacptipcat")[0]?.value.trim() || "";

  const cjaErrorCacpnomcat = document.getElementById("cjaErrorCacpnomcat");
  const cjaErrorCacpdescat = document.getElementById("cjaErrorCacpdescat");
  const cjaErrorCacpestcat = document.getElementById("cjaErrorCacpestcat");
  const cjaErrorCacptipcat = document.getElementById("cjaErrorCacptipcat");

  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorCacpnomcat,
      cjaErrorCacpdescat,
      cjaErrorCacpestcat,
      cjaErrorCacptipcat
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // 1. Validar Nombre de Categoría (Max 50 según BD)
    if (!cacpnomcat) {
      if (cjaErrorCacpnomcat) {
        cjaErrorCacpnomcat.textContent = "El nombre es obligatorio.";
      }
      esValido = false;
    } else if (cacpnomcat.length < 3) {
      if (cjaErrorCacpnomcat) {
        cjaErrorCacpnomcat.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (cacpnomcat.length > 50) {
      if (cjaErrorCacpnomcat) {
        cjaErrorCacpnomcat.textContent = "Máximo 50 caracteres.";
      }
      esValido = false;
    }

    // 2. Validar Descripción (Max 100 según BD)
    if (!cacpdescat) {
      if (cjaErrorCacpdescat) {
        cjaErrorCacpdescat.textContent = "La descripción es obligatoria.";
      }
      esValido = false;
    } else if (cacpdescat.length < 3) {
      if (cjaErrorCacpdescat) {
        cjaErrorCacpdescat.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (cacpdescat.length > 100) {
      if (cjaErrorCacpdescat) {
        cjaErrorCacpdescat.textContent = "Máximo 100 caracteres.";
      }
      esValido = false;
    }

    // 3. Validar Estado
    if (!cacpestcat) {
      if (cjaErrorCacpestcat) {
        cjaErrorCacpestcat.textContent = "Seleccione el estado.";
      }
      esValido = false;
    }

    // 4. Validar Tipo de Categoría
    if (!cacptipcat) {
      if (cjaErrorCacptipcat) {
        cjaErrorCacptipcat.textContent = "Seleccione el tipo.";
      }
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
        if (cjaErrorCacpnomcat) {
          cjaErrorCacpnomcat.textContent = "La categoría ya existe.";
        }
        const nomInput = document.getElementsByName("cacpnomcat")[0];
        nomInput?.focus();
        return;
      }
      document.getElementById("contenedor_dinamico").innerHTML = resultado;
    })
    .catch((error) => {
      console.error("Ocurrió un error al guardar la categoría:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}
function EnviarFormularioMesa(event, funcion, idFormulario, url) {
  event.preventDefault();

  const camlnummes =
    document.getElementsByName("camlnummes")[0]?.value.trim() || "";
  const camlcapmes =
    document.getElementsByName("camlcapmes")[0]?.value.trim() || "";
  const camldesmes =
    document.getElementsByName("camldesmes")[0]?.value.trim() || "";
  const camlactmes =
    document.getElementsByName("camlactmes")[0]?.value.trim() || "";
  const camlestmes =
    document.getElementsByName("camlestmes")[0]?.value.trim() || "";

  const cjaErrorCamlnummes = document.getElementById("cjaErrorCamlnummes");
  const cjaErrorCamlcapmes = document.getElementById("cjaErrorCamlcapmes");
  const cjaErrorCamldesmes = document.getElementById("cjaErrorCamldesmes");
  const cjaErrorCamlactmes = document.getElementById("cjaErrorCamlactmes");
  const cjaErrorCamlestmes = document.getElementById("cjaErrorCamlestmes");

  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorCamlnummes,
      cjaErrorCamlcapmes,
      cjaErrorCamldesmes,
      cjaErrorCamlactmes,
      cjaErrorCamlestmes
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // 1. Validar Número de Mesa (Max 2 dígitos según BD)
    if (!camlnummes) {
      if (cjaErrorCamlnummes) {
        cjaErrorCamlnummes.textContent = "El número es obligatorio.";
      }
      esValido = false;
    } else if (isNaN(camlnummes) || parseInt(camlnummes, 10) <= 0) {
      if (cjaErrorCamlnummes) {
        cjaErrorCamlnummes.textContent = "Ingrese un número mayor a 0.";
      }
      esValido = false;
    } else if (camlnummes.length > 2) {
      if (cjaErrorCamlnummes) {
        cjaErrorCamlnummes.textContent = "Máximo 2 dígitos.";
      }
      esValido = false;
    }

    // 2. Validar Capacidad de la Mesa (Max 2 dígitos según BD)
    if (!camlcapmes) {
      if (cjaErrorCamlcapmes) {
        cjaErrorCamlcapmes.textContent = "La capacidad es obligatoria.";
      }
      esValido = false;
    } else if (isNaN(camlcapmes) || parseInt(camlcapmes, 10) <= 0) {
      if (cjaErrorCamlcapmes) {
        cjaErrorCamlcapmes.textContent = "Ingrese un número mayor a 0.";
      }
      esValido = false;
    } else if (camlcapmes.length > 2) {
      if (cjaErrorCamlcapmes) {
        cjaErrorCamlcapmes.textContent = "Máximo 2 dígitos.";
      }
      esValido = false;
    }

    // 3. Validar Descripción (Max 200 según BD, Mínimo 3)
    if (!camldesmes) {
      if (cjaErrorCamldesmes) {
        cjaErrorCamldesmes.textContent = "La descripción es obligatoria.";
      }
      esValido = false;
    } else if (camldesmes.length < 3) {
      if (cjaErrorCamldesmes) {
        cjaErrorCamldesmes.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (camldesmes.length > 200) {
      if (cjaErrorCamldesmes) {
        cjaErrorCamldesmes.textContent = "Máximo 200 caracteres.";
      }
      esValido = false;
    }

    // 4. Validar Habilitada (Boolean)
    if (!camlactmes) {
      if (cjaErrorCamlactmes) {
        cjaErrorCamlactmes.textContent = "Seleccione disponibilidad.";
      }
      esValido = false;
    }

    // 5. Validar Estado Operativo
    if (!camlestmes) {
      if (cjaErrorCamlestmes) {
        cjaErrorCamlestmes.textContent = "Seleccione el estado.";
      }
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
        if (cjaErrorCamlnummes) {
          cjaErrorCamlnummes.textContent = "La mesa ya existe.";
        }
        const numInput = document.getElementsByName("camlnummes")[0];
        numInput?.focus();
        return;
      }
      document.getElementById("contenedor_dinamico").innerHTML = resultado;
    })
    .catch((error) => {
      console.error("Ocurrió un error al guardar la mesa:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}
function EnviarFormularioUsuario(event, funcion, idFormulario, url) {
  event.preventDefault();

  const papscodper =
    document.getElementsByName("papscodper")[0]?.value.trim() || "";
  const causnomlog =
    document.getElementsByName("causnomlog")[0]?.value.trim() || "";
  const causrolusu =
    document.getElementsByName("causrolusu")[0]?.value.trim() || "";
  const causestusu =
    document.getElementsByName("causestusu")[0]?.value.trim() || "";

  const cjaErrorPapscodper = document.getElementById("cjaErrorPapscodper");
  const cjaErrorCausnomlog = document.getElementById("cjaErrorCausnomlog");
  const cjaErrorCausrolusu = document.getElementById("cjaErrorCausrolusu");
  const cjaErrorCausestusu = document.getElementById("cjaErrorCausestusu");

  function limpiarErrores() {
    const contenedoresError = [
      cjaErrorPapscodper,
      cjaErrorCausnomlog,
      cjaErrorCausrolusu,
      cjaErrorCausestusu
    ];

    contenedoresError.forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // 1. Validar Selección de Persona (FK fauscodper)
    if (!papscodper) {
      if (cjaErrorPapscodper) {
        cjaErrorPapscodper.textContent = "Debe seleccionar una persona.";
      }
      esValido = false;
    }

    // 2. Validar Nombre de Usuario Login (Max 100 según BD)
    if (!causnomlog) {
      if (cjaErrorCausnomlog) {
        cjaErrorCausnomlog.textContent = "El usuario es obligatorio.";
      }
      esValido = false;
    } else if (causnomlog.length < 3) {
      if (cjaErrorCausnomlog) {
        cjaErrorCausnomlog.textContent = "Mínimo 3 caracteres.";
      }
      esValido = false;
    } else if (causnomlog.length > 100) {
      if (cjaErrorCausnomlog) {
        cjaErrorCausnomlog.textContent = "Máximo 100 caracteres.";
      }
      esValido = false;
    }

    // 3. Validar Rol (Max 50 según BD)
    if (!causrolusu) {
      if (cjaErrorCausrolusu) {
        cjaErrorCausrolusu.textContent = "Seleccione un rol.";
      }
      esValido = false;
    }

    // 4. Validar Estado (Boolean)
    if (!causestusu) {
      if (cjaErrorCausestusu) {
        cjaErrorCausestusu.textContent = "Seleccione el estado.";
      }
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
        if (cjaErrorCausnomlog) {
          cjaErrorCausnomlog.textContent = "El usuario ya existe.";
        }
        const nomInput = document.getElementsByName("causnomlog")[0];
        nomInput?.focus();
        return;
      }
      document.getElementById("contenedor_dinamico").innerHTML = resultado;
    })
    .catch((error) => {
      console.error("Ocurrió un error al guardar el usuario:", error);
      document.getElementById("contenedor_dinamico").innerHTML =
        `<p style="color: red; padding: 10px;">No se pudo procesar la solicitud.</p>`;
    });
}
