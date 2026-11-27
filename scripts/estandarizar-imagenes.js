// ========================================
// LA PAZ TE ACERCA — Estandarización de Imágenes v14.1
// ========================================
// Lee admin/plantillas.js y estandariza todas las subcategorías a 4 imágenes.
// Si una subcategoría tiene menos de 4, duplica las existentes.
// Uso: node scripts/estandarizar-imagenes.js
// ========================================

const fs = require('fs');
const path = require('path');

const RUTA_PLANTILLAS = path.join(__dirname, '..', 'admin', 'plantillas.js');
const RUTA_BACKUP = path.join(__dirname, '..', 'admin', 'plantillas.backup.pre-estandarizacion.js');

function estandarizar() {
  console.log('🚀 Iniciando estandarización de imágenes...\n');

  if (!fs.existsSync(RUTA_PLANTILLAS)) {
    console.error('❌ No se encontró admin/plantillas.js');
    process.exit(1);
  }

  // Backup
  fs.copyFileSync(RUTA_PLANTILLAS, RUTA_BACKUP);
  console.log(`✅ Backup creado: ${RUTA_BACKUP}\n`);

  let contenido = fs.readFileSync(RUTA_PLANTILLAS, 'utf-8');

  // Extraer el objeto imagenesMuestra
  const match = contenido.match(/const imagenesMuestra\s*=\s*\{([\s\S]*?)\n\};/);
  if (!match) {
    console.error('❌ No se pudo encontrar el objeto imagenesMuestra');
    process.exit(1);
  }

  const bloqueImagenes = match[1];
  let modificadas = 0;
  let yaEstandarizadas = 0;

  // Buscar cada subcategoría y su array de imágenes
  const regex = /"([^"]+)":\s*\[([\s\S]*?)\]/g;
  let matchSub;
  let nuevoBloque = bloqueImagenes;

  const subcategorias = [];
  while ((matchSub = regex.exec(bloqueImagenes)) !== null) {
    const nombre = matchSub[1];
    const arrayStr = matchSub[2];

    // Contar URLs en el array
    const urls = arrayStr.match(/https?:\/\/[^\s"]+/g) || [];
    subcategorias.push({ nombre, urls, arrayStr, matchStr: matchSub[0] });
  }

  console.log(`📊 Total de subcategorías encontradas: ${subcategorias.length}\n`);

  // Procesar cada subcategoría
  for (const sub of subcategorias) {
    if (sub.urls.length >= 4) {
      yaEstandarizadas++;
      console.log(`  ✅ [${sub.urls.length} imgs] ${sub.nombre} — ya estandarizada`);
      continue;
    }

    if (sub.urls.length === 0) {
      console.log(`  ⚠️  [0 imgs] ${sub.nombre} — sin imágenes, se omite`);
      continue;
    }

    // Completar hasta 4 duplicando las existentes
    const urlsCompletas = [...sub.urls];
    while (urlsCompletas.length < 4) {
      urlsCompletas.push(urlsCompletas[urlsCompletas.length % sub.urls.length]);
    }

    // Reconstruir el array con 4 URLs
    const nuevoArray = urlsCompletas.map(url => `\n    "${url}"`).join(',') + '\n  ';
    const nuevoMatchStr = `"${sub.nombre}": [${nuevoArray}]`;

    nuevoBloque = nuevoBloque.replace(sub.matchStr, nuevoMatchStr);
    modificadas++;
    console.log(`  ✏️  [${sub.urls.length}→4] ${sub.nombre}`);
  }

  // Reemplazar en el contenido original
  const nuevoContenido = contenido.replace(bloqueImagenes, nuevoBloque);

  if (modificadas === 0) {
    console.log('\n🎉 Todas las subcategorías ya tienen 4 imágenes. No se hicieron cambios.');
    return;
  }

  // Guardar
  fs.writeFileSync(RUTA_PLANTILLAS, nuevoContenido, 'utf-8');

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE ESTANDARIZACIÓN');
  console.log('='.repeat(50));
  console.log(`  ✅ Ya estandarizadas (4 imgs): ${yaEstandarizadas}`);
  console.log(`  ✏️  Modificadas: ${modificadas}`);
  console.log(`  📁 Backup en: ${RUTA_BACKUP}`);
  console.log('='.repeat(50));
  console.log('\n🎉 Estandarización completada. Haz git add + commit + push.');
}

estandarizar();