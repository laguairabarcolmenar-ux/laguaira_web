// Genera carta-la-guaira.pdf (A4, fondo negro) con todos los platos de la web:
// las tarjetas con foto de code.html + los paneles de carta.json.
// Uso: node scripts/generar-carta-pdf.js <ruta a chrome.exe> <carpeta con node_modules de puppeteer-core y qrcode>
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const chrome = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mods = process.argv[3] || root;
const puppeteer = require(path.join(mods, 'node_modules/puppeteer-core'));
const QR = require(path.join(mods, 'node_modules/qrcode'));

const html = fs.readFileSync(path.join(root, 'code.html'), 'utf8');
const carta = JSON.parse(fs.readFileSync(path.join(root, 'carta.json'), 'utf8'));
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Tarjetas con foto
const cards = {};
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const cat = (chunk.match(/data-category="([^"]+)"/) || [])[1];
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!cat || !m || cat === 'menu-dia') continue;
  (cards[cat] = cards[cat] || []).push({ nombre: clean(m[1]), precio: clean(m[2]), detalle: clean(m[3]) });
}
const md = html.slice(html.indexOf('data-category="menu-dia"'));
const menuDia = {
  precio: clean(md.match(/text-display-lg[^>]*>([^<]+)<\/span>/)[1]),
  horario: clean(md.match(/<span class="bg-\[#FFD700\][^>]*>([^<]+)<\/span>/)[1]),
  detalle: clean(md.match(/<p class="font-body-md[^>]*>([\s\S]*?)<\/p>/)[1]),
};

const orden = carta.pestanas.map(p => p.id).filter(id => id !== 'all' && id !== 'menu-dia');
const titulo = id => carta.pestanas.find(p => p.id === id).label;
const secciones = orden.map(id => {
  const grupos = [];
  if (cards[id]) grupos.push({ platos: cards[id] });
  for (const p of carta.paneles.filter(p => p.categoria === id)) {
    const generico = p.titulo.startsWith('Más ') || titulo(id).includes(p.titulo);
    grupos.push({ subtitulo: generico ? null : p.titulo, nota: p.nota, platos: p.platos });
  }
  return { titulo: titulo(id), grupos };
}).filter(s => s.grupos.length);
const corte = Math.max(1, secciones.findIndex(s => s.titulo.includes('Parrillas'))); // primera sección de la segunda hoja
const total = secciones.reduce((n, s) => n + s.grupos.reduce((k, g) => k + g.platos.length, 0), 0);

const fila = p => `<div class="item"><div class="row"><span class="name">${esc(p.nombre)}</span><span class="dots"></span><span class="price">${esc(p.precio)}</span></div>${p.detalle ? `<div class="desc">${esc(p.detalle)}</div>` : ''}</div>`;
const seccion = s => `<section class="cat"><h2>${esc(s.titulo)}</h2>${s.grupos.map(g => `${g.subtitulo ? `<h3>${esc(g.subtitulo)}</h3>` : ''}${g.nota ? `<p class="note">${esc(g.nota)}</p>` : ''}${g.platos.map(fila).join('')}`).join('')}</section>`;

(async () => {
  const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'img/logo.png')).toString('base64');
  const qr = await QR.toDataURL('https://barlaguaira.es/#menu-criollo', { errorCorrectionLevel: 'Q', margin: 1, width: 400, color: { dark: '#000000', light: '#FFD700' } });
  const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Carta · La Guaira Bar Restaurante</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Be+Vietnam+Pro:wght@400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html { background: #000; }
  body { margin: 0; font-family: 'Be Vietnam Pro', sans-serif; color: #FFFDF5; background: #000; font-size: 9.6pt; }
  /* Cada hoja es una caja propia para que lleve su margen negro */
  .page { width: 210mm; height: 297mm; padding: 12mm; overflow: hidden; break-after: page; display: flex; flex-direction: column; }
  .page:last-child { break-after: auto; }
  .tricolor { display: flex; height: 6px; border-radius: 3px; overflow: hidden; }
  .tricolor i { flex: 1; } .y { background: #FFD700; } .b { background: #1A3D9E; } .r { background: #C5221F; }
  header { display: flex; align-items: center; gap: 14px; padding: 10px 0 12px; }
  header img { width: 78px; height: 78px; }
  header h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 25pt; margin: 0; letter-spacing: -0.02em; }
  header h1 em { font-style: normal; color: #FFD700; }
  header p { margin: 2px 0 0; color: #CFC5BB; font-size: 9.5pt; }
  .info { margin-left: auto; text-align: right; font-size: 8.6pt; line-height: 1.5; color: #CFC5BB; }
  .info b { color: #FFD700; font-family: 'Plus Jakarta Sans'; }
  .menudia { display: flex; gap: 14px; align-items: center; background: #FFD700; color: #241A00; border-radius: 14px; padding: 10px 16px; margin: 6px 0 14px; }
  .menudia h2 { font-family: 'Plus Jakarta Sans'; font-size: 14pt; margin: 0 0 2px; color: #241A00; border: 0; padding: 0; }
  .menudia .tag { font-size: 8pt; font-weight: 700; color: #8F1512; text-transform: uppercase; letter-spacing: .08em; font-family: 'Plus Jakarta Sans'; }
  .menudia p { margin: 3px 0 0; font-size: 8.8pt; font-weight: 500; line-height: 1.4; }
  .menudia .big { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 26pt; color: #A81B18; white-space: nowrap; }
  .cols { column-count: 2; column-gap: 11mm; }
  .cat { break-inside: avoid-column; margin: 0 0 10px; }
  h2 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 12.5pt; margin: 0 0 4px; padding-bottom: 3px; color: #FFD700; border-bottom: 1.5px solid rgba(255,215,0,.55); }
  h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 10pt; margin: 8px 0 2px; color: #FFFDF5; }
  .note { margin: 2px 0 2px; font-size: 8pt; color: #FFB4AB; font-weight: 500; }
  .item { padding: 2px 0; break-inside: avoid; }
  .row { display: flex; align-items: baseline; gap: 5px; }
  .name { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 9.8pt; }
  .dots { flex: 1; border-bottom: 1.2px dotted rgba(255,255,255,.35); transform: translateY(-3px); min-width: 10px; }
  .price { font-family: 'Plus Jakarta Sans'; font-weight: 800; color: #FFD700; white-space: nowrap; }
  .desc { font-size: 8.2pt; color: #CFC5BB; line-height: 1.35; margin-top: 1px; padding-right: 42px; }
  footer { break-inside: avoid; display: flex; align-items: center; gap: 14px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.2); font-size: 8.4pt; color: #CFC5BB; }
  footer img { width: 66px; height: 66px; flex-shrink: 0; border-radius: 6px; }
  footer b { color: #FFD700; }
</style></head><body>
<div class="page">
<div class="tricolor"><i class="y"></i><i class="b"></i><i class="r"></i></div>
<header>
  <img src="${logo}" alt="">
  <div><h1>Nuestra <em>Carta</em></h1><p>La Guaira · Bar Restaurante · Gastronomía venezolana</p></div>
  <div class="info"><b>Av. de América, 9 · Colmenar Viejo</b><br>Reservas y pedidos: <b>919 47 20 27</b><br>L–V 8:00–23:00 · Sáb y dom 9:00–0:00<br>barlaguaira.es · @laguairabar.colmenar</div>
</header>
<div class="menudia">
  <div style="flex:1"><span class="tag">${esc(menuDia.horario)}</span><h2>⭐ Menú del Día</h2><p>${esc(menuDia.detalle)}</p></div>
  <div class="big">${esc(menuDia.precio)}</div>
</div>
<div class="cols">${secciones.slice(0, corte).map(seccion).join('')}</div>
</div>
<div class="page">
<div class="tricolor" style="margin-bottom:14px"><i class="y"></i><i class="b"></i><i class="r"></i></div>
<div class="cols">${secciones.slice(corte).map(seccion).join('')}</div>
<footer style="margin-top:auto">
  <img src="${qr}" alt="">
  <div><b>Carta digital con fotos:</b> escanea el código o entra en <b>barlaguaira.es</b><br>
  Precios con IVA incluido. Si tienes alguna alergia o intolerancia, consulta a nuestro equipo.<br>
  <b>Contorno</b>: acompañante a elegir.</div>
</footer>
</div>
</body></html>`;

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const p = await browser.newPage();
  await p.setContent(page, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1200));
  await p.emulateMediaType('print');
  const desborde = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => {
    const cols = pg.querySelector('.cols');
    return cols.scrollWidth > cols.clientWidth + 2 || pg.scrollHeight > pg.clientHeight + 2 ? i + 1 : 0;
  }).filter(Boolean));
  if (desborde.length) console.warn(`AVISO: la hoja ${desborde.join(', ')} no cabe; ajusta el corte`);
  const out = path.join(root, 'carta-la-guaira.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log(`Carta PDF generada: ${secciones.length} secciones, ${total} platos + menú del día`);
})().catch(e => { console.error(e); process.exit(1); });
