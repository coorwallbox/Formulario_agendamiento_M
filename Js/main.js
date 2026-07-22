/* ==========================================================================
   main.js — Logica principal de la aplicacion
   Depende de las funciones definidas en utils.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Referencias a los elementos del DOM
  const tabsContainer = document.getElementById("tabs");
  const form = document.getElementById("registration-form");
  const brandInput = document.getElementById("brand");
  const vehicleSelect = document.getElementById("vehicleReference");
  const statusEl = document.getElementById("form-status");

  /* Marca activa inicial (coincide con la tab .active del HTML) */
  let currentBrand = "Hyundai";

  /* Aplica una marca: actualiza fondo, campo oculto y opciones del select. */
  function applyBrand(brand) {
    currentBrand = brand;

    // Cambia el fondo (el CSS reacciona al data-brand del body)
    document.body.dataset.brand = brand;

    // Guarda la marca en el campo oculto (viaja en el envio)
    brandInput.value = brand;

    // Recarga las opciones del select segun la marca
    populateVehicleSelect(vehicleSelect, brand);
  }

  /* Delegacion de eventos: un solo listener para todas las tabs */
  tabsContainer.addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return; // Click fuera de una tab

    const brand = tab.dataset.brand;
    if (brand === currentBrand) return; // Ya esta activa, no hace nada

    // Actualiza el estado visual de las tabs
    tabsContainer.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Aplica la nueva marca
    applyBrand(brand);

    // Limpia cualquier mensaje de estado previo al cambiar de marca
    showStatus(statusEl, "", null);
  });

  /* Referencia al boton de envio para bloquearlo durante el proceso */
  const submitBtn = form.querySelector(".btn-submit");

  /* Manejo del envio del formulario: valida y envia a Power Automate */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { valid, firstInvalid } = validateForm(form);

    if (!valid) {
      showStatus(statusEl, "Por favor completa todos los campos obligatorios.", "error");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = getFormData(form);

    // Bloquea el boton y avisa que se esta enviando (evita envios duplicados)
    submitBtn.disabled = true;
    showStatus(statusEl, "Registrando...", null);

    try {
      await sendToPowerAutomate(data);

      // Exito: limpia el formulario y recarga las opciones de la marca actual
      showStatus(statusEl, "¡Registro guardado correctamente!", "success");
      form.reset();
      populateVehicleSelect(vehicleSelect, currentBrand);
      brandInput.value = currentBrand; // form.reset() borra el hidden; lo restauramos
    } catch (error) {
      console.error("Error al registrar:", error);
      showStatus(statusEl, "No se pudo registrar. Intenta de nuevo.", "error");
    } finally {
      // Rehabilita el boton pase lo que pase
      submitBtn.disabled = false;
    }
  });

  /* Inicializacion: carga las opciones de la marca inicial al arrancar */
  applyBrand(currentBrand);
});