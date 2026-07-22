/* ==========================================================================
   utils.js — Funciones y datos reutilizables
   ========================================================================== */

/* URL del flujo de Power Automate (trigger "When an HTTP request is received").
   Se reemplaza por la URL real generada en la Fase 5. */
const POWER_AUTOMATE_URL = "https://defaultf7d1082b48604f049c0d046b1756fe.a7.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/19/workflows/7f6c7e10105c497d977c60c1bb8a108f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=p8cc2eEpliSyVgC0F8a-VRBneIdfuWif3NNvLzKPKiI";

/* Opciones del select por marca.
   La clave debe coincidir con el data-brand de cada tab. */
const VEHICLE_OPTIONS = {
  Hyundai: ["Kona eléctrica"],
  Volvo: ["100% eléctrica", "Híbrida enchufable"],
  MG: ["MG 4", "MG 4 Urban", "Marvel", "MG S5", "MG Cyberster", "MG ZS"],
  Mazda: ["CX-60"],
  Cupra: ["Formentor"],
};

/* Rellena el <select> con las opciones de la marca indicada.
   Reinicia el contenido y deja una opcion vacia inicial para el label flotante. */
function populateVehicleSelect(selectEl, brand) {
  // Opcion inicial vacia (oculta) para que el label flote correctamente
  selectEl.innerHTML = '<option value="" disabled selected hidden></option>';

  const options = VEHICLE_OPTIONS[brand] || [];
  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    selectEl.appendChild(option);
  });
}

/* Muestra un mensaje de estado en el formulario.
   type puede ser "success" o "error" (afecta el color via CSS). */
function showStatus(statusEl, message, type) {
  statusEl.textContent = message;
  statusEl.className = "form-status"; // Limpia clases previas
  if (type) {
    statusEl.classList.add(type);
  }
}

/* Valida que todos los campos requeridos esten completos.
   Devuelve un objeto { valid, firstInvalid } para poder enfocar el primer error. */
function validateForm(formEl) {
  const requiredFields = formEl.querySelectorAll("[required]");
  let firstInvalid = null;

  for (const field of requiredFields) {
    // trim evita que solo espacios en blanco cuenten como valido
    if (!field.value.trim()) {
      firstInvalid = field;
      break;
    }
  }

  return { valid: firstInvalid === null, firstInvalid };
}

/* Convierte los datos del formulario en un objeto plano.
   Se envia como JSON a Power Automate. */
function getFormData(formEl) {
  const formData = new FormData(formEl);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = typeof value === "string" ? value.trim() : value;
  });
  return data;
}

/* Envia los datos al flujo de Power Automate mediante POST.
   Lanza un error si la respuesta no es satisfactoria, para manejarlo arriba. */
async function sendToPowerAutomate(data) {
  const response = await fetch(POWER_AUTOMATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  // Power Automate suele responder 200/202 cuando acepta la peticion
  if (!response.ok) {
    throw new Error("Respuesta no satisfactoria del servidor: " + response.status);
  }

  return response;
}