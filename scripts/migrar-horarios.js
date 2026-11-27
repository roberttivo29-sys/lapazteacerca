// ========================================
// LA PAZ TE ACERCA — Migración de Horarios v14.0
// ========================================
// Convierte los horarios de texto libre al nuevo formato JSON estructurado.
// Uso: node scripts/migrar-horarios.js
// ========================================

const fs = require('fs');
const path = require('path');

const RUTA_JSON = path.join(__dirname, '..', 'data', 'proveedores.json');
const RUTA_BACKUP = path.join(__dirname, '..', 'data', 'proveedores.backup.pre-migracion.json');

// ---------- PATRONES DE HORARIO ----------
// Detecta automáticamente el tipo de horario según el texto original
function parsearHorarioTexto(textoOriginal) {
  if (!textoOriginal || textoOriginal.trim() === '') {
    return {
      dias: 'lunes_viernes',
      apertura: '09:00',
      cierre: '18:00',
      es_24horas: false,
      nota: ''
    };
  }

  const texto = textoOriginal.trim();
  const textoLower = texto.toLowerCase();

  // CASO 1: 24 horas
  if (textoLower.includes('24 horas') || textoLower.includes('24h') || textoLower === '24') {
    return {
      dias: 'todos',
      apertura: '00:00',
      cierre: '23:59',
      es_24horas: true,
      nota: ''
    };
  }

  // CASO 2: Con cita previa
  if (textoLower.includes('cita')) {
    return {
      dias: 'personalizado',
      apertura: '09:00',
      cierre: '18:00',
      es_24horas: false,
      nota: texto
    };
  }

  // CASO 3: Extraer horas (formato 9:00, 09:00, 9, 18:00, etc.)
  const matchHoras = texto.match(/(\d{1,2})(?::(\d{2}))?\s*[-–—a]+\s*(\d{1,2})(?::(\d{2}))?/i);
  let apertura = '09:00';
  let cierre = '18:00';

  if (matchHoras) {
    const horaApertura = parseInt(matchHoras[1]).toString().padStart(2, '0');
    const minApertura = (matchHoras[2] || '00');
    const horaCierre = parseInt(matchHoras[3]).toString().padStart(2, '0');
    const minCierre = (matchHoras[4] || '00');
    apertura = `${horaApertura}:${minApertura}`;
    cierre = `${horaCierre}:${minCierre}`;
  }

  // CASO 4: Detectar días
  let dias = 'personalizado';
  let nota = texto;

  // "Lun-Vie", "Lunes a Viernes", "L-V", etc.
  if (/lun[a-z]*[-–—\sa]+vie[a-z]*/i.test(texto) || /\bl[-–—\sa]+v\b/i.test(texto)) {
    // Verificar si también incluye sábado
    if (/s[aá]b/i.test(texto)) {
      dias = 'lunes_sabado';
    } else {
      dias = 'lunes_viernes';
    }
    nota = '';
  }
  // "Lun-Sáb", "Lunes a Sábado"
  else if (/lun[a-z]*[-–—\sa]+s[aá]b/i.test(texto)) {
    dias = 'lunes_sabado';
    nota = '';
  }
  // "Todos los días", "Lun-Dom"
  else if (/todos\s+los\s+d[ií]as/i.test(texto) || /lun[a-z]*[-–—\sa]+dom/i.test(texto)) {
    dias = 'todos';
    nota = '';
  }
  // "Domingos y feriados", "Dom-Feriados"
  else if (/dom[a-z]*\s+y\s+fer/i.test(texto) || /dom[a-z]*[-–—\sa]+fer/i.test(texto)) {
    dias = 'domingo_feriado';
    nota = '';
  }

  return {
    dias: dias,
    apertura: apertura,
    cierre: cierre,
    es_24horas: false,
    nota: nota
  };
}

// ---------- MIGRACIÓN PRINCIPAL ----------
function migrar() {
  console.log('🚀 Iniciando migración de horarios...\n');

  // 1. Verificar que el JSON existe
  if (!fs.existsSync(RUTA_JSON)) {
    console.error('❌ No se encontró data/proveedores.json');
    process.exit(1);
  }

  // 2. Crear backup automático
  fs.copyFileSync(RUTA_JSON, RUTA_BACKUP);
  console.log(`✅ Backup creado: ${RUTA_BACKUP}\n`);

  // 3. Leer proveedores
  const data = JSON.parse(fs.readFileSync(RUTA_JSON, 'utf-8'));
  const proveedores = data.proveedores || data;

  if (!Array.isArray(proveedores)) {
    console.error('❌ Formato inesperado en proveedores.json');
    process.exit(1);
  }

  console.log(`📊 Total de proveedores: ${proveedores.length}\n`);

  // 4. Migrar cada proveedor
  let migrados = 0;
  let personalizados = 0;
  let errores = 0;

  proveedores.forEach((p, i) => {
    const horarioOriginal = p.horario;

    // Si ya es objeto (migrado previamente), saltar
    if (typeof horarioOriginal === 'object' && horarioOriginal !== null && horarioOriginal.dias) {
      console.log(`  ⏭️  [${p.id}] ${p.nombre} — ya está en formato nuevo`);
      return;
    }

    try {
      const nuevoHorario = parsearHorarioTexto(horarioOriginal);
      p.horario = nuevoHorario;

      if (nuevoHorario.dias === 'personalizado') {
        personalizados++;
        console.log(`  ✏️  [${p.id}] ${p.nombre} → personalizado (no se pudo parsear: "${horarioOriginal}")`);
      } else {
        migrados++;
        console.log(`  ✅ [${p.id}] ${p.nombre} → ${nuevoHorario.dias} ${nuevoHorario.apertura}-${nuevoHorario.cierre}`);
      }
    } catch (e) {
      errores++;
      console.log(`  ❌ [${p.id}] ${p.nombre} — ERROR: ${e.message}`);
    }
  });

  // 5. Guardar el JSON actualizado
  const dataFinal = Array.isArray(data) ? data : { ...data, proveedores };
  fs.writeFileSync(RUTA_JSON, JSON.stringify(dataFinal, null, 2), 'utf-8');

  // 6. Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(50));
  console.log(`  ✅ Migrados automáticamente: ${migrados}`);
  console.log(`  ✏️  Quedaron en personalizado: ${personalizados}`);
  console.log(`  ❌ Errores: ${errores}`);
  console.log(`  📁 Backup disponible en: ${RUTA_BACKUP}`);
  console.log('='.repeat(50));

  if (errores > 0) {
    console.log('\n⚠️  Revisa los errores antes de hacer push.');
  } else {
    console.log('\n🎉 Migración exitosa. Puedes hacer git add + commit + push.');
  }
}

// ---------- EJECUTAR ----------
migrar();