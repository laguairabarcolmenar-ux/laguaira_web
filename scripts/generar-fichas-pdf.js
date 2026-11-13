// Genera fichas-cocina-la-guaira.pdf: ingredientes, foto y preparación de
// hamburguesas, patacones y parrillas (una hoja A4 por familia).
// Uso: node scripts/generar-fichas-pdf.js <ruta a chrome.exe> <carpeta con node_modules de puppeteer-core>
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const chrome = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mods = process.argv[3] || root;
const puppeteer = require(path.join(mods, 'node_modules/puppeteer-core'));
const img = f => 'data:image/' + (f.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(root, 'img', f)).toString('base64');

const toppings = ['Lechuga', 'Tomate en rodajas', 'Cebolla', 'Queso en lonchas', 'Beicon (tocineta)', 'Salsas de la casa', 'Papitas'];
const hojas = [
  {
    titulo: 'Hamburguesas', emoji: '🍔', nota: 'Todas se sirven con papitas',
    platos: [
      { nombre: 'Hamburguesa normal', precio: '8,00€', ingredientes: ['Pan de hamburguesa', 'Carne de res', ...toppings] },
      { nombre: 'Hamburguesa doble', precio: '10,00€', ingredientes: ['Pan de hamburguesa', 'Carne de res', 'Pechuga de pollo', ...toppings] },
      { nombre: 'Hamburguesa triple', precio: '12,00€', ingredientes: ['Pan de hamburguesa', 'Chuleta', 'Pechuga de pollo', 'Carne de res', ...toppings] },
    ],
    preparacion: [
      'Hacer la carne a la plancha bien caliente, vuelta y vuelta, hasta el punto (en la doble y la triple, hacer también el pollo y la chuleta).',
      'Al final de la cocción, poner el queso encima para que se funda.',
      'Dorar el beicon en la plancha hasta que quede crujiente.',
      'Tostar el pan por la cara del corte.',
      'Montar: base del pan, salsas, lechuga, tomate y cebolla, las carnes con el queso, el beicon y las papitas por encima.',
      'Cerrar con la tapa del pan y servir caliente con papitas al lado.',
    ],
    foto: null,
  },
  {
    titulo: 'Patacones', emoji: '🍌', nota: 'Plátano verde frito y aplastado',
    platos: [
      { nombre: 'Patacón', precio: '12,00€', ingredientes: ['Plátano verde', 'Carne mechada o pollo (a elegir)', 'Loncha de jamón', 'Loncha de queso', 'Tomate', 'Cebolla', 'Lechuga en tiras', 'Aguacate', 'Salsas de la casa'] },
    ],
    preparacion: [
      'Pelar el plátano verde y cortarlo en dos trozos largos.',
      'Freír en aceite medio hasta que esté tierno, sacar y aplastar entre dos tablas o papel hasta dejar dos tapas planas.',
      'Volver a freír las tapas en aceite bien caliente hasta que estén doradas y crujientes. Escurrir y salar.',
      'Calentar la carne mechada o el pollo.',
      'Montar sobre una tapa: carne o pollo, loncha de jamón y de queso, la ensalada (tomate, cebolla y lechuga en tiras) y el aguacate.',
      'Añadir las salsas, cerrar con la otra tapa y servir al momento.',
    ],
    foto: null,
  },
  {
    titulo: 'Parrillas', emoji: '🔥', nota: 'Para 2 personas · con yuca frita o arepitas y patatas',
    platos: [
      { nombre: 'Parrilla La Guaira', precio: '30,00€', foto: 'parrilla-la-guaira.jpg', ingredientes: ['Pollo', 'Carne de res', 'Mariscos', 'Yuca frita o arepitas', 'Patatas fritas'] },
      { nombre: 'Parrilla Caracas', precio: '25,00€', foto: 'parrilla-caracas.jpg', ingredientes: ['Morcilla', 'Chorizo', 'Pollo', 'Carne de res', 'Yuca frita o arepitas', 'Patatas fritas'] },
    ],
    preparacion: [
      'Sazonar la carne y el pollo con antelación (sal y adobo de la casa).',
      'Empezar por lo que más tarda: pollo, chorizo y morcilla a la parrilla o plancha, girando hasta que estén bien hechos.',
      'Hacer la carne al punto y, en la Parrilla La Guaira, los mariscos al final, solo hasta que cambien de color.',
      'Mientras tanto, freír la yuca (o hacer las arepitas) y las patatas.',
      'Servir todo en la tabla o plancha de parrilla, bien caliente, con los acompañantes al lado.',
    ],
  },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fotoHtml = f => f
  ? `<img class="foto" src="${img(f)}" alt="">`
  : `<div class="foto vacia"><span>📷</span>Foto pendiente<br><small>Envíanos una foto del plato y la añadimos</small></div>`;

const hoja = h => `<div class="page">
  <div class="tricolor"><i class="y"></i><i class="b"></i><i class="r"></i></div>
  <header><img src="${img('logo.png')}" alt=""><div><p class="kicker">Ficha de cocina · La Guaira</p><h1>${h.emoji} ${esc(h.titulo)}</h1><p class="nota">${esc(h.nota)}</p></div></header>
  <div class="platos ${h.platos.length > 1 ? 'multi' : ''}">
  ${h.platos.map(p => `<section class="plato">
    ${fotoHtml(p.foto || h.foto)}
    <div class="cab"><h2>${esc(p.nombre)}</h2><span class="precio">${esc(p.precio)}</span></div>
    <h3>Ingredientes</h3>
    <ul>${p.ingredientes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
  </section>`).join('')}
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
  .tricolor { display: flex; height: 6px; border-radius: 3px; overflow: hidden; }
  .tricolor i { flex: 1; } .y { background: #FFD700; } .b { background: #1A3D9E; } .r { background: #C5221F; }
  header { display: flex; align-items: center; gap: 14px; padding: 12px 0 14px; border-bottom: 2px solid #FFD700; margin-bottom: 14px; }
  header img { width: 70px; height: 70px; }
  h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 26pt; margin: 0; letter-spacing: -0.02em; }
  .kicker { margin: 0; font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 8.5pt; letter-spacing: .1em; text-transform: uppercase; color: #A81B18; }
  .nota { margin: 2px 0 0; color: #6B5F55; }
  .platos { display: grid; grid-template-columns: 1fr; gap: 14px; }
  .platos.multi { grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); }
  .plato { border: 1px solid #E6DED5; border-radius: 14px; padding: 12px; background: #FFFCF4; }
  .foto { width: 100%; height: 62mm; object-fit: cover; border-radius: 10px; display: block; }
  .platos:not(.multi) .foto { height: 80mm; }
  .platos.multi:has(.plato:nth-child(3)) .foto { height: 40mm; }
  .vacia { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: repeating-linear-gradient(45deg, #F5EFE6 0 10px, #EFE7DB 10px 20px); border: 2px dashed #CDBFAE; color: #8A7B6C; font-family: 'Plus Jakarta Sans'; font-weight: 700; }
  .vacia span { font-size: 26pt; margin-bottom: 4px; } .vacia small { font-weight: 500; font-size: 8.5pt; }
  .cab { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 10px 0 2px; }
  h2 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 14pt; margin: 0; }
  .precio { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 14pt; color: #A81B18; white-space: nowrap; }
  h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 10.5pt; margin: 8px 0 4px; color: #1A3D9E; text-transform: uppercase; letter-spacing: .06em; }
  ul { margin: 0; padding-left: 18px; columns: 2; column-gap: 14px; } li { margin: 1px 0; }
  .platos.multi ul { columns: 1; }
  .platos.multi:has(.plato:nth-child(3)) ul { font-size: 9.5pt; }
  .prep { margin-top: 16px; border-left: 4px solid #FFD700; padding: 4px 0 4px 14px; }
  .prep h3 { display: flex; align-items: center; gap: 10px; }
  .borrador { font-size: 7.5pt; background: #FFF1C2; color: #7A5A00; border-radius: 99px; padding: 2px 8px; letter-spacing: .04em; }
  ol { margin: 0; padding-left: 20px; } ol li { margin: 0 0 6px; line-height: 1.45; }
  footer { margin-top: auto; padding-top: 8px; border-top: 1px solid #E6DED5; font-size: 8pt; color: #8A7B6C; text-align: center; }
</style></head><body>${hojas.map(hoja).join('')}</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const p = await browser.newPage();
  await p.setContent(page, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1200));
  await p.emulateMediaType('print');
  const desborde = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => pg.scrollHeight > pg.clientHeight + 2 ? i + 1 : 0).filter(Boolean));
  if (desborde.length) console.warn(`AVISO: la hoja ${desborde.join(', ')} no cabe`);
  const out = path.join(root, 'fichas-cocina-la-guaira.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (process.argv[4]) {
    await p.setViewport({ width: 794, height: 1123 * hojas.length });
    await p.screenshot({ path: process.argv[4], fullPage: true });
  }
  await browser.close();
  console.log(`Fichas generadas: ${hojas.length} hojas`);
})().catch(e => { console.error(e); process.exit(1); });
