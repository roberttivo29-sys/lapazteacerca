// ========================================
// LA PAZ TE ACERCA — Sistema de Horarios v14.0
// ========================================
// Plantillas de días + reloj nativo + checkbox 24h
//
// Formato JSON del horario:
// {
//   "dias": "lunes_viernes" | "lunes_sabado" | "domingo_feriado" | "todos" | "personalizado",
//   "apertura": "08:00",
//   "cierre": "18:00",
//   "es_24horas": false,
//   "nota": ""
// }
//
// Reglas:
//   - Si es_24horas = true, se ocultan apertura/cierre
//   - Si dias = "personalizado", se ocultan apertura/cierre y aparece campo de texto
//   - El reloj nativo (<input type="time">) usa el formato del navegador
// ========================================

// ---------- PLANTILLAS DE DÍAS ----------
const plantillasDias = [
  { id: "lunes_viernes", label: "Lunes a viernes", icon: "📅" },
  { id: "lunes_sabado", label: "Lunes a sábado", icon: "📆" },
  { id: "domingo_feriado", label: "Domingos y feriados", icon: "🎉" },
  { id: "todos", label: "Todos los días", icon: "🗓️" },
  { id: "personalizado", label: "Personalizado", icon: "✏️" }
];

// ---------- HELPERS ----------

// Renderizar los chips de días en el contenedor
function renderizarChipsDias(contenedorId, valorActual = "lunes_viernes") {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = plantillasDias.map(dia => `
    <button type="button" 
            class="chip-dia ${dia.id === valorActual ? 'activo' : ''}" 
            data-dia="${dia.id}"
            onclick="seleccionarDia('${contenedorId}', '${dia.id}')">
      ${dia.icon} ${dia.label}
    </button>
  `).join('');

  // Actualizar visibilidad de campos según el valor
  actualizarCamposHorario(contenedorId, valorActual);
}

// Seleccionar un chip de día
function seleccionarDia(contenedorId, diaId) {
  // Guardar el valor en el input oculto
  const inputOculta = document.getElementById(contenedorId.replace('chips', 'input'));
  if (inputOculta) {
    inputOculta.value = diaId;
  }

  // Actualizar clases visuales
  const chips = document.querySelectorAll(`#${contenedorId} .chip-dia`);
  chips.forEach(chip => {
    chip.classList.toggle('activo', chip.dataset.dia === diaId);
  });

  // Actualizar visibilidad de campos
  actualizarCamposHorario(contenedorId, diaId);
}

// Mostrar/ocultar campos según el tipo de día seleccionado
function actualizarCamposHorario(contenedorId, diaId) {
  const esPersonalizado = diaId === 'personalizado';
  const es24Horas = document.getElementById('horario_24horas')?.checked || false;

  // Campo de texto para personalizado
  const campoTexto = document.getElementById('horario_texto');
  if (campoTexto) {
    if (esPersonalizado) {
      campoTexto.classList.remove('hidden');
      campoTexto.required = true;
    } else {
      campoTexto.classList.add('hidden');
      campoTexto.required = false;
      campoTexto.value = '';
    }
  }

  // Relojes de apertura/cierre
  const grupoReloj = document.getElementById('horario_reloj');
  if (grupoReloj) {
    if (esPersonalizado || es24Horas) {
      grupoReloj.classList.add('hidden');
    } else {
      grupoReloj.classList.remove('hidden');
    }
  }
}

// Toggle de 24 horas
function toggle24Horas() {
  const checkbox = document.getElementById('horario_24horas');
  const grupoReloj = document.getElementById('horario_reloj');
  const inputDias = document.getElementById('horario_dias_input');
  const diasSeleccionado = inputDias?.value || 'lunes_viernes';

  if (checkbox.checked) {
    // Ocultar reloj si está marcado
    if (grupoReloj) grupoReloj.classList.add('hidden');
  } else {
    // Mostrar reloj solo si no es personalizado
    if (grupoReloj && diasSeleccionado !== 'personalizado') {
      grupoReloj.classList.remove('hidden');
    }
  }
}

// Obtener el horario como objeto JSON
function obtenerHorarioJSON() {
  const dias = document.getElementById('horario_dias_input')?.value || 'lunes_viernes';
  const apertura = document.getElementById('horario_apertura')?.value || '08:00';
  const cierre = document.getElementById('horario_cierre')?.value || '18:00';
  const es24Horas = document.getElementById('horario_24horas')?.checked || false;
  const nota = document.getElementById('horario_texto')?.value || '';

  return {
    dias: dias,
    apertura: apertura,
    cierre: cierre,
    es_24horas: es24Horas,
    nota: nota
  };
}

// Cargar un horario desde JSON (para editar)
function cargarHorarioJSON(horario) {
  if (!horario) return;

  // Si es string, parsear
  if (typeof horario === 'string') {
    try {
      horario = JSON.parse(horario);
    } catch {
      // Si no es JSON válido, tratar como texto libre
      document.getElementById('horario_dias_input').value = 'personalizado';
      document.getElementById('horario_texto').value = horario;
      renderizarChipsDias('horario_dias_chips', 'personalizado');
      return;
    }
  }

  // Cargar valores
  const dias = horario.dias || 'lunes_viernes';
  const apertura = horario.apertura || '08:00';
  const cierre = horario.cierre || '18:00';
  const es24Horas = horario.es_24horas || false;
  const nota = horario.nota || '';

  document.getElementById('horario_dias_input').value = dias;
  document.getElementById('horario_apertura').value = apertura;
  document.getElementById('horario_cierre').value = cierre;
  document.getElementById('horario_24horas').checked = es24Horas;
  document.getElementById('horario_texto').value = nota;

  // Renderizar chips
  renderizarChipsDias('horario_dias_chips', dias);

  // Actualizar visibilidad
  toggle24Horas();
}

// Formatear horario para mostrar en la web pública
function formatearHorarioParaWeb(horario) {
  if (!horario) return 'Sin horario';

  // Si es string, devolver tal cual
  if (typeof horario === 'string') return horario;

  // Si es 24 horas
  if (horario.es_24horas) {
    return 'Atención 24 horas';
  }

  // Si es personalizado
  if (horario.dias === 'personalizado') {
    return horario.nota || 'Horario personalizado';
  }

  // Mapear días a texto corto
  const diasTexto = {
    'lunes_viernes': 'Lun-Vie',
    'lunes_sabado': 'Lun-Sáb',
    'domingo_feriado': 'Dom-Feriados',
    'todos': 'Todos los días'
  };

  const dias = diasTexto[horario.dias] || horario.dias;
  const apertura = horario.apertura || '08:00';
  const cierre = horario.cierre || '18:00';

  return `${dias}: ${apertura} - ${cierre}`;
}