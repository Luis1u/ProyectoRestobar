let ban = false;
      const formulario = document.getElementById("formCambiarClave");
      formulario.addEventListener("submit", (e) => {
        const campoClave = document.getElementById("nuevaClave").value;
        const confirmarClave = document.getElementById("confirmarClave").value;
        const cajaError = document.getElementById("cajaError");
        cajaError.textContent = "";

        if (ban) {
          if (campoClave != confirmarClave) {
            cajaError.textContent = "No coinciden las claves";
            e.preventDefault();
          }
        } else {
          e.preventDefault();
        }
      });
      function validarClave() {
        const campoClave = document.getElementById("nuevaClave").value;
        const cajaErrorNuevaClave = document.getElementById(
          "cajaErrorNuevaClave",
        );

        cajaErrorNuevaClave.textContent = "";

        if (
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(campoClave)
        ) {
          ban = true;
          cajaErrorNuevaClave.textContent = "";
        } else {
          cajaErrorNuevaClave.textContent = "No cumple con las condiciones";
          ban = false;
        }

        if (campoClave.length == 0) {
          cajaErrorNuevaClave.textContent = "";
        }
      }