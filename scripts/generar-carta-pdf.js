// Genera carta-la-guaira.pdf (A4, fondo negro, estilo carta impresa: rótulos dorados
// y una imagen por apartado) con todos los platos de la web:
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
const img = f => 'data:image/' + (f.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(root, 'img', f)).toString('base64');

// Imagen de cada apartado: por id de pestaña, o "id:Subtítulo" para los grupos de una pestaña.
const imagenes = {
  desayunos: 'desayuno-empanadas-cafe.jpg',
  empanadas: 'empanada-abierta.jpg',
  arepas: 'arepa-reina-pepiada.jpg',
  platos: 'carta/platos.jpg',
  parrillas: 'parrilla-la-guaira.jpg',
  arroces: 'arroz-la-guaira.jpg',
  hamburguesas: 'carta/hamburguesa.jpg',
  postres: 'carta/postres.jpg',
  'bebidas:Jugos naturales': 'carta/jugos.jpg',
  'bebidas:Batidos': 'carta/batidos.jpg',
  'bebidas:Refrescos, zumos y agua': 'carta/refrescos.jpg',
  'bebidas:Cafés': 'carta/cafe.jpg',
};

// Descripciones cortas para papel (las de la web son largas)
const cortas = {
  'Parrilla La Guaira': 'Para 2: pollo, carne y mariscos, con yuca frita o arepitas y patatas.',
  'Parrilla Caracas': 'Para 2: morcilla, chorizo, pollo y carne, con yuca frita o arepitas y patatas.',
  'Arroz La Guaira': 'Al estilo paella, con pollo y mariscos.',
};
// Tarjetas con foto
const cards = {};
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const cat = (chunk.match(/data-category="([^"]+)"/) || [])[1];
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!cat || !m || cat === 'menu-dia') continue;
  const det = clean(m[3]);
  (cards[cat] = cards[cat] || []).push({ nombre: clean(m[1]), precio: clean(m[2]), detalle: cortas[clean(m[1])] || (det.length <= 80 ? det : '') });
}
const md = html.slice(html.indexOf('data-category="menu-dia"'));
const menuDia = {
  precio: clean(md.match(/text-display-lg[^>]*>([^<]+)<\/span>/)[1]),
  horario: clean(md.match(/<span class="bg-\[#FFD700\][^>]*>([^<]+)<\/span>/)[1]),
  detalle: clean(md.match(/<p class="font-body-md[^>]*>([\s\S]*?)<\/p>/)[1]),
};

const orden = carta.pestanas.map(p => p.id).filter(id => id !== 'all' && id !== 'menu-dia');
const titulo = id => carta.pestanas.find(p => p.id === id).label.replace(/^\S+\s/, '');
// Cada apartado lleva su rótulo; las pestañas con varios paneles (bebidas) se parten en apartados.
const apartados = [];
for (const id of orden) {
  const paneles = carta.paneles.filter(p => p.categoria === id);
  const varios = paneles.length > 1;
  if (!varios) {
    const platos = [...(cards[id] || []), ...(paneles[0] ? paneles[0].platos : [])];
    if (platos.length) apartados.push({ titulo: titulo(id), nota: paneles[0] && paneles[0].nota, platos, imagen: imagenes[id] });
    continue;
  }
  paneles.forEach((p, k) => apartados.push({
    titulo: p.titulo, nota: p.nota, imagen: imagenes[`${id}:${p.titulo}`],
    platos: k === 0 ? [...(cards[id] || []), ...p.platos] : p.platos,
  }));
}
const total = apartados.reduce((n, s) => n + s.platos.length, 0);

const fila = p => `<div class="item"><div class="row"><span class="name">${esc(p.nombre)}</span><span class="dots"></span><span class="price">${esc(p.precio)}</span></div>${p.detalle ? `<div class="desc">${esc(p.detalle)}</div>` : ''}</div>`;
const apartado = s => `<section class="cat${s.imagen ? ' con-foto' : ''}">
  <h2><span>${esc(s.titulo)}</span></h2>${s.nota ? `<p class="note">${esc(s.nota)}</p>` : ''}
  <div class="cuerpo"><div class="lista">${s.platos.map(fila).join('')}</div>${s.imagen ? `<img class="foto" src="${img(s.imagen)}" alt="">` : ''}</div>
</section>`;

(async () => {
  const qr = await QR.toDataURL('https://barlaguaira.es/#menu-criollo', { errorCorrectionLevel: 'Q', margin: 1, width: 400, color: { dark: '#000000', light: '#FFD700' } });
  const pagina = corte => `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Carta · La Guaira Bar Restaurante</title>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Oswald:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: #000; }
  body { margin: 0; font-family: 'Be Vietnam Pro', sans-serif; color: #FFFDF5; font-size: 9.4pt; }
  .page { position: relative; width: 210mm; height: 297mm; padding: 0 11mm 10mm; overflow: hidden; break-after: page; display: flex; flex-direction: column;
    background: radial-gradient(120% 60% at 50% 0%, #1d1208 0%, #000 55%), #000; }
  .page:last-child { break-after: auto; }
  /* Marco dorado */
  .page::before { content: ''; position: absolute; inset: 5mm; border: 1.2px solid rgba(232,190,90,.55); border-radius: 6mm; pointer-events: none; }
  .page::after { content: ''; position: absolute; inset: 6.2mm; border: .6px solid rgba(232,190,90,.25); border-radius: 5mm; pointer-events: none; }
  /* Cabecera atardecer */
  .hero, .ola, .info, .menudia, footer, .top2 { flex-shrink: 0; }
  .hero { position: relative; margin: 0 -11mm 4mm; height: 44mm; padding: 7mm 16mm 0; display: flex; align-items: center; gap: 6mm; overflow: hidden;
    background:
      radial-gradient(30mm 20mm at 52% 58%, rgba(255,214,102,.95), rgba(255,140,40,.55) 45%, transparent 75%),
      linear-gradient(180deg, #1b1033 0%, #6b1f3a 32%, #c2451a 58%, #f08a24 72%, #3a1608 86%, #000 100%); }
  .hero .mar { position: absolute; left: 0; right: 0; bottom: 0; height: 16mm; background: linear-gradient(180deg, rgba(10,25,60,.0), rgba(6,14,35,.85) 40%, #000); }
  .hero .monte { position: absolute; right: 0; bottom: 12mm; width: 70%; height: 22mm; background: #12070a; clip-path: polygon(0 100%, 12% 62%, 22% 70%, 38% 30%, 50% 48%, 64% 8%, 78% 40%, 90% 28%, 100% 50%, 100% 100%); opacity: .9; }
  .hero .brillo { position: absolute; left: 55%; bottom: 3mm; width: 22mm; height: 9mm; background: repeating-linear-gradient(180deg, rgba(255,200,90,.75) 0 1px, transparent 1px 3px); filter: blur(.4px); }
  .hero img { position: relative; width: 34mm; height: 34mm; filter: drop-shadow(0 2mm 3mm rgba(0,0,0,.6)); }
  .hero h1 { position: relative; margin: 0 0 0 auto; font-family: 'Great Vibes', cursive; font-weight: 400; font-size: 50pt; line-height: .85; text-align: right;
    background: linear-gradient(180deg, #fff1b8, #f2c14e 45%, #b8862b); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 1mm 1.2mm rgba(0,0,0,.7)); }
  .ola { height: 3mm; margin: -6mm -11mm 4mm; background: linear-gradient(90deg, transparent, #f2c14e 20%, #fff1b8 50%, #f2c14e 80%, transparent); clip-path: polygon(0 60%, 25% 20%, 50% 55%, 75% 15%, 100% 50%, 100% 75%, 75% 40%, 50% 80%, 25% 45%, 0 85%); position: relative; }
  .info { display: flex; justify-content: space-between; font-size: 8.4pt; color: #D9CDBF; margin: -1mm 1mm 3mm; }
  .info b { color: #F2C14E; font-family: 'Plus Jakarta Sans'; }
  /* Rótulo dorado tipo placa */
  h2 { margin: 0 0 4px; }
  h2 span { display: inline-block; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 13pt; letter-spacing: .02em; text-transform: uppercase; color: #2a1802;
    padding: 2px 14px 1px 12px; border-radius: 3px 14px 3px 14px; transform: skewX(-6deg);
    background: linear-gradient(180deg, #fff0b0 0%, #f2c14e 38%, #c8922e 70%, #f2c14e 100%);
    box-shadow: 0 1.5px 0 #6b4a12, 0 0 0 1px rgba(255,240,180,.35) inset, 0 2mm 3mm rgba(0,0,0,.55); }
  .menudia { display: flex; gap: 12px; align-items: center; border: 1.2px solid rgba(242,193,78,.7); border-radius: 14px; padding: 8px 14px; margin: 0 0 11px;
    background: linear-gradient(90deg, rgba(242,193,78,.16), rgba(242,193,78,.04)); }
  .menudia h2 { margin: 0 0 3px; }
  .menudia .tag { font-size: 7.8pt; font-weight: 700; color: #F2C14E; text-transform: uppercase; letter-spacing: .08em; font-family: 'Plus Jakarta Sans'; margin-left: 8px; }
  .menudia p { margin: 2px 0 0; font-size: 9pt; color: #EDE3D6; }
  .menudia .big { margin-left: auto; font-family: 'Oswald'; font-weight: 700; font-size: 28pt; color: #F2C14E; white-space: nowrap; }
  .cols { column-count: 2; column-gap: 9mm; column-rule: 1px solid rgba(242,193,78,.18); }
  .cat { break-inside: avoid-column; margin: 0 0 7px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .cuerpo { display: flex; gap: 8px; align-items: center; }
  .lista { flex: 1; min-width: 0; }
  .foto { flex: 0 0 auto; width: auto; max-width: 30mm; max-height: 32mm; object-fit: contain; border-radius: 3mm;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent), linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent);
    -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent), linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent); mask-composite: intersect; }
  .note { margin: 0 0 3px; font-size: 7.9pt; color: #F7B7A3; font-weight: 500; font-style: italic; }
  .item { padding: 1.6px 0; break-inside: avoid; }
  .row { display: flex; align-items: baseline; gap: 5px; }
  .name { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 9.4pt; }
  .dots { flex: 1; border-bottom: 1.2px dotted rgba(242,193,78,.35); transform: translateY(-3px); min-width: 8px; }
  .price { font-family: 'Plus Jakarta Sans'; font-weight: 800; color: #F2C14E; white-space: nowrap; }
  .desc { font-size: 7.9pt; color: #CFC3B5; line-height: 1.32; margin-top: 1px; }
  footer { break-inside: avoid; display: flex; align-items: center; gap: 12px; margin-top: auto; padding: 8px 2mm 0; border-top: 1px solid rgba(242,193,78,.35); font-size: 8.2pt; color: #CFC3B5; }
  footer img { width: 62px; height: 62px; flex-shrink: 0; border-radius: 6px; }
  footer b { color: #F2C14E; }
  .top2 { height: 9mm; }
</style></head><body>
<div class="page">
  <div class="hero"><div class="monte"></div><div class="mar"></div>
    <img src="${img('logo.png')}" alt=""><h1>Nuestra<br>Carta</h1></div>
  <div class="ola"></div>
  <div class="info"><span><b>Av. de América, 9 · Colmenar Viejo</b> · Reservas y pedidos: <b>919 47 20 27</b></span><span>L–V 8:00–23:00 · S–D 9:00–0:00</span></div>
  <div class="menudia">
    <div><h2><span>Menú del Día</span><em class="tag">${esc(menuDia.horario)}</em></h2><p>${esc(menuDia.detalle)}</p></div>
    <div class="big">${esc(menuDia.precio)}</div>
  </div>
  <div class="cols">${apartados.slice(0, corte).map(apartado).join('')}</div>
</div>
<div class="page">
  <div class="top2"></div>
  <div class="cols">${apartados.slice(corte).map(apartado).join('')}</div>
  <footer>
    <img src="${qr}" alt="">
    <div><b>Carta digital con fotos:</b> escanea el código o entra en <b>barlaguaira.es</b> · @laguairabar.colmenar<br>
    Precios con IVA incluido. Si tienes alguna alergia o intolerancia, consulta a nuestro equipo.<br>
    <b>Contorno</b>: acompañante a elegir.</div>
  </footer>
</div>
</body></html>`;

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const p = await browser.newPage();
  await p.emulateMediaType('print');
  // Prueba cortes desde el centro hasta encontrar uno en el que quepan las dos hojas
  const mitad = Math.round(apartados.length / 2);
  const candidatos = [...Array(apartados.length - 2).keys()].map(i => i + 1).sort((a, b) => Math.abs(a - mitad) - Math.abs(b - mitad));
  let corte = null;
  for (const c of candidatos) {
    await p.setContent(pagina(c), { waitUntil: 'load', timeout: 60000 });
    await p.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 300));
    const desborde = await p.evaluate(() => [...document.querySelectorAll('.page')].some(pg => {
      const cols = pg.querySelector('.cols');
      return cols.scrollWidth > cols.clientWidth + 2 || pg.scrollHeight > pg.clientHeight + 2;
    }));
    if (!desborde) { corte = c; break; }
  }
  if (corte === null) { await browser.close(); throw new Error('La carta no cabe en dos hojas con ningún corte'); }
  await new Promise(r => setTimeout(r, 800));
  const out = path.join(root, 'carta-la-guaira.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (process.argv[4]) {
    await p.setViewport({ width: 794, height: 1123 * 2 });
    await p.screenshot({ path: process.argv[4], fullPage: true });
  }
  await browser.close();
  console.log(`Carta PDF generada (segunda hoja desde «${apartados[corte].titulo}»): ${apartados.length} apartados, ${total} platos + menú del día`);
})().catch(e => { console.error(e); process.exit(1); });
