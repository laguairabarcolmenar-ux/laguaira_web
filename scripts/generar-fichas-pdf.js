// Genera fichas-cocina-la-guaira.pdf: foto, ingredientes y preparación de hamburguesas,
// pepito, patacones y parrillas. Precios y descripciones se leen de la carta (carta.json y
// code.html) para que la ficha coincida siempre con lo que ve el cliente.
// Uso: node scripts/generar-fichas-pdf.js <ruta a chrome.exe> <carpeta con node_modules de puppeteer-core> [captura.png]
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const chrome = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mods = process.argv[3] || root;
const puppeteer = require(path.join(mods, 'node_modules/puppeteer-core'));
const img = f => 'data:image/' + (f.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(root, 'img', f)).toString('base64');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// --- Datos de la carta ---
const carta = JSON.parse(fs.readFileSync(path.join(root, 'carta.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'code.html'), 'utf8');
const enCarta = {};
for (const p of carta.paneles) for (const x of p.platos) enCarta[x.nombre] = { precio: x.precio, detalle: x.detalle || '' };
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (m) enCarta[clean(m[1])] = { precio: clean(m[2]), detalle: clean(m[3]) };
}
const dato = n => { if (!enCarta[n]) throw new Error(`"${n}" no está en la carta`); return enCarta[n]; };

const comunes = ['Lechuga', 'Tomate', 'Cebolla', 'Queso', 'Beicon (tocineta)', 'Salsas', 'Papitas'];
const hojas = [
  {
    titulo: 'Hamburguesas', emoji: '🍔', nota: 'Todas se sirven con papitas',
    fotos: ['carta/hamburguesas.jpg'],
    platos: [
      { nombre: 'Hamburguesa normal', ingredientes: ['Pan de hamburguesa', 'Carne', ...comunes] },
      { nombre: 'Hamburguesa doble', ingredientes: ['Pan de hamburguesa', 'Pollo', 'Carne', ...comunes] },
      { nombre: 'Hamburguesa triple', ingredientes: ['Pan de hamburguesa', 'Chuleta', 'Pollo', 'Carne', ...comunes] },
    ],
    preparacion: [
      'Hacer la carne a la plancha bien caliente hasta el punto. En la doble, hacer también el pollo; en la triple, el pollo y la chuleta.',
      'Al final de la cocción, poner el queso encima de la carne para que se funda.',
      'Dorar el beicon en la plancha hasta que quede crujiente.',
      'Tostar el pan por la cara del corte.',
      'Montar: base del pan, salsas, lechuga, tomate y cebolla; encima las carnes con el queso y el beicon; por último las papitas.',
      'Cerrar con la tapa del pan y servir caliente.',
    ],
  },
  {
    titulo: 'Pepito mixto', emoji: '🥖', nota: 'Se sirve con papitas',
    fotos: ['carta/hamburguesas-2.jpg'],
    platos: [
      { nombre: 'Pepito mixto', ingredientes: ['Pan de pepito (barra)', 'Carne', 'Pollo', 'Col rallada', 'Zanahoria rallada', 'Maíz', 'Queso amarillo', 'Beicon (tocineta)', 'Aguacate', 'Papitas'] },
    ],
    preparacion: [
      'Cortar la carne y el pollo en tiras y saltearlos a la plancha bien caliente hasta que estén dorados.',
      'Dorar el beicon hasta que quede crujiente.',
      'Abrir el pan a lo largo y calentarlo en la plancha.',
      'Rellenar con la carne y el pollo, la col y la zanahoria rallada, el maíz y el beicon.',
      'Cubrir con el queso amarillo y gratinar o calentar hasta que se funda.',
      'Terminar con el aguacate en láminas y las papitas por encima. Servir al momento.',
    ],
  },
  {
    titulo: 'Patacones', emoji: '🍌', nota: 'Plátano verde frito y aplastado',
    fotos: ['carta/patacones.jpg'],
    platos: [
      { nombre: 'Patacón', ingredientes: ['Plátano verde', 'Carne mechada o pollo (a elegir)', 'Loncha de jamón', 'Loncha de queso', 'Tomate', 'Cebolla', 'Lechuga en tiras', 'Aguacate', 'Salsas'] },
    ],
    preparacion: [
      'Pelar el plátano verde y cortarlo en dos trozos largos.',
      'Freír en aceite medio hasta que esté tierno, sacar y aplastar hasta dejar dos tapas planas.',
      'Volver a freír las tapas en aceite bien caliente hasta que estén doradas y crujientes. Escurrir y salar.',
      'Calentar la carne mechada o el pollo.',
      'Montar sobre una tapa: carne mechada o pollo, loncha de jamón y de queso, la ensalada (tomate, cebolla y lechuga en tiras) y el aguacate.',
      'Añadir las salsas, cerrar con la otra tapa y servir al momento.',
    ],
  },
  {
    titulo: 'Parrillas', emoji: '🔥', nota: 'Para 2 personas · con yuca frita o arepitas y patatas',
    fotos: ['carta/parrillas.jpg', 'carta/parrillas-2.jpg'],
    platos: [
      { nombre: 'Parrilla La Guaira', ingredientes: ['Pollo', 'Carne', 'Mariscos', 'Yuca frita o arepitas', 'Patatas'] },
      { nombre: 'Parrilla Caracas', ingredientes: ['Morcilla', 'Chorizo', 'Pollo', 'Carne', 'Yuca frita o arepitas', 'Patatas'] },
    ],
    preparacion: [
      'Sazonar la carne y el pollo con antelación con sal y el adobo de la casa.',
      'Empezar por lo que más tarda: el pollo y, en la Parrilla Caracas, el chorizo y la morcilla, a la parrilla o plancha, girando hasta que estén bien hechos.',
      'Hacer la carne al punto. En la Parrilla La Guaira, los mariscos al final, solo hasta que cambien de color.',
      'Mientras tanto, freír la yuca (o hacer las arepitas) y las patatas.',
      'Servir todo en la tabla de parrilla, bien caliente, con la yuca o las arepitas y las patatas al lado.',
    ],
  },
];

const hoja = h => `<div class="page">
  <div class="tricolor"><i class="y"></i><i class="b"></i><i class="r"></i></div>
  <header><img src="${img('logo.png')}" alt=""><div><p class="kicker">Ficha de cocina · La Guaira</p><h1>${h.emoji} ${esc(h.titulo)}</h1><p class="nota">${esc(h.nota)}</p></div></header>
  <div class="fotos f${h.fotos.length}">${h.fotos.map(f => `<img src="${img(f)}" alt="">`).join('')}</div>
  <div class="platos n${h.platos.length}">
  ${h.platos.map(p => { const d = dato(p.nombre); return `<section class="plato">
    <div class="cab"><h2>${esc(p.nombre)}</h2><span class="precio">${esc(d.precio)}</span></div>
    ${d.detalle ? `<p class="carta"><b>En la carta:</b> ${esc(d.detalle)}</p>` : ''}
    <h3>Ingredientes</h3>
    <ul>${p.ingredientes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
  </section>`; }).join('')}
  </div>
  <section class="prep"><h3>Preparación <span class="borrador">Propuesta · revisar con cocina</span></h3>
    <ol>${h.preparacion.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  </section>
  <footer>La Guaira Bar Restaurante · Av. de América, 9 · Colmenar Viejo · Uso interno</footer>
</div>`;

const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Fichas de cocina · La Guaira</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Be+Vietnam+Pro:wght@400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: 'Be Vietnam Pro', sans-serif; color: #1E1A16; background: #fff; font-size: 10.5pt; }
  .page { width: 210mm; height: 297mm; padding: 12mm 14mm; overflow: hidden; break-after: page; display: flex; flex-direction: column; }
  .page:last-child { break-after: auto; }
  .tricolor { display: flex; height: 6px; border-radius: 3px; overflow: hidden; flex-shrink: 0; }
  .tricolor i { flex: 1; } .y { background: #FFD700; } .b { background: #1A3D9E; } .r { background: #C5221F; }
  header { display: flex; align-items: center; gap: 14px; padding: 12px 0 12px; border-bottom: 2px solid #FFD700; margin-bottom: 12px; flex-shrink: 0; }
  header img { width: 64px; height: 64px; }
  h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 25pt; margin: 0; letter-spacing: -0.02em; }
  .kicker { margin: 0; font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 8.5pt; letter-spacing: .1em; text-transform: uppercase; color: #A81B18; }
  .nota { margin: 2px 0 0; color: #6B5F55; }
  .fotos { display: grid; gap: 8px; margin-bottom: 12px; flex-shrink: 0; }
  .fotos.f1 { grid-template-columns: 1fr; } .fotos.f2 { grid-template-columns: 1fr 1fr; }
  .fotos img { width: 100%; height: 72mm; object-fit: cover; border-radius: 10px; display: block; }
  .fotos.f2 img { height: 62mm; }
  .platos { display: grid; gap: 10px; }
  .platos.n2 { grid-template-columns: 1fr 1fr; } .platos.n3 { grid-template-columns: 1fr 1fr 1fr; }
  .plato { border: 1px solid #E6DED5; border-radius: 12px; padding: 10px 12px; background: #FFFCF4; }
  .cab { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  h2 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 13pt; margin: 0; }
  .precio { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 13pt; color: #A81B18; white-space: nowrap; }
  .carta { margin: 4px 0 0; font-size: 8.8pt; color: #5C5148; line-height: 1.35; font-style: italic; }
  .carta b { font-style: normal; color: #1A3D9E; }
  h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 10pt; margin: 8px 0 3px; color: #1A3D9E; text-transform: uppercase; letter-spacing: .06em; }
  ul { margin: 0; padding-left: 18px; } li { margin: 1px 0; }
  .platos.n1 ul { columns: 2; column-gap: 14px; }
  .prep { margin-top: 12px; border-left: 4px solid #FFD700; padding: 2px 0 2px 14px; }
  .prep h3 { display: flex; align-items: center; gap: 10px; margin-top: 0; }
  .borrador { font-size: 7.5pt; background: #FFF1C2; color: #7A5A00; border-radius: 99px; padding: 2px 8px; letter-spacing: .04em; }
  ol { margin: 0; padding-left: 20px; } ol li { margin: 0 0 5px; line-height: 1.42; }
  footer { margin-top: auto; padding-top: 8px; border-top: 1px solid #E6DED5; font-size: 8pt; color: #8A7B6C; text-align: center; flex-shrink: 0; }
</style></head><body>${hojas.map(hoja).join('')}</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const p = await browser.newPage();
  await p.setContent(page, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1200));
  await p.emulateMediaType('print');
  const desborde = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => pg.scrollHeight > pg.clientHeight + 2 ? i + 1 : 0).filter(Boolean));
  if (desborde.length) { await browser.close(); throw new Error(`La hoja ${desborde.join(', ')} no cabe`); }
  const out = path.join(root, 'fichas-cocina-la-guaira.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (process.argv[4]) {
    await p.setViewport({ width: 794, height: 1123 * hojas.length });
    await p.screenshot({ path: process.argv[4], fullPage: true });
  }
  await browser.close();
  console.log(`Fichas generadas: ${hojas.length} hojas (${hojas.map(h => h.titulo).join(', ')})`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
