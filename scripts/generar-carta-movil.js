// Genera carta.html: la carta pensada para el móvil (la que abren los comensales con el QR de la mesa).
// Lee los mismos datos que la web y el PDF: las tarjetas con foto de code.html + los paneles de carta.json,
// y las fotos de cada apartado en img/carta/<apartado>.jpg (y -2, -3).
// Uso: node scripts/generar-carta-movil.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'code.html'), 'utf8');
const carta = JSON.parse(fs.readFileSync(path.join(root, 'carta.json'), 'utf8'));

const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = k => k.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const precio = p => esc(p).replace(/\s*€/, '&nbsp;€');

// Tarjetas con foto de la portada (arepas, empanadas, parrillas...)
const cards = {};
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const cat = (chunk.match(/data-category="([^"]+)"/) || [])[1];
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!cat || !m || cat === 'menu-dia') continue;
  const sinGluten = /Sin Gluten/i.test(chunk.slice(0, chunk.indexOf('<h3')));
  (cards[cat] = cards[cat] || []).push({ nombre: clean(m[1]), precio: clean(m[2]), detalle: clean(m[3]), sinGluten });
}
const md = html.slice(html.indexOf('data-category="menu-dia"'));
const menuDia = {
  precio: clean(md.match(/text-display-lg[^>]*>([^<]+)<\/span>/)[1]),
  detalle: clean(md.match(/<p class="font-body-md[^>]*>([\s\S]*?)<\/p>/)[1]),
};

const fotos = k => ['', '-2', '-3'].map(n => `img/carta/${slug(k)}${n}.jpg`).filter(f => fs.existsSync(path.join(root, f)));

// Grupos de la carta, en el orden en que se come
const grupos = [
  { titulo: 'Para empezar', ids: ['desayunos', 'tequenos', 'empanadas'] },
  { titulo: 'Principales', ids: ['cachapas', 'arepas', 'patacones', 'platos', 'parrillas', 'arroces', 'hamburguesas'] },
  { titulo: 'Postres', ids: ['postres'] },
  { titulo: 'Bebidas', ids: ['bebidas', 'licores'] },
];
const pestanas = carta.pestanas.filter(p => p.id !== 'all' && p.id !== 'menu-dia');
const sinGrupo = pestanas.filter(p => !grupos.some(g => g.ids.includes(p.id))).map(p => p.id);
if (sinGrupo.length) grupos.push({ titulo: 'Y además', ids: sinGrupo });
const etiqueta = id => carta.pestanas.find(p => p.id === id).label.replace(/^\S+\s/, '');

// Una categoría = una pestaña; si tiene varios paneles (bebidas) cada panel es un bloque con su foto.
const categoria = id => {
  const paneles = carta.paneles.filter(p => p.categoria === id);
  const varios = paneles.length > 1;
  const bloques = varios
    ? paneles.map((p, k) => ({ titulo: p.titulo, nota: p.nota, fotos: fotos(`${id}:${p.titulo}`), platos: k === 0 ? [...(cards[id] || []), ...p.platos] : p.platos }))
    : [{ titulo: null, nota: paneles[0] && paneles[0].nota, fotos: fotos(id), platos: [...(cards[id] || []), ...(paneles[0] ? paneles[0].platos : [])] }];
  return { id, titulo: etiqueta(id), bloques: bloques.filter(b => b.platos.length) };
};

const plato = p => `<li class="plato">
<div class="linea"><h4>${esc(p.nombre)}</h4><span class="precio">${precio(p.precio)}</span></div>${p.detalle ? `
<p>${esc(p.detalle)}</p>` : ''}
</li>`;
const galeria = (b, alt) => !b.fotos.length ? '' : `
<div class="fotos${b.fotos.length > 1 ? ' varias' : ''}">${b.fotos.map(f => `<img src="${f}" alt="${esc(alt)} en La Guaira, Colmenar Viejo" loading="lazy" decoding="async" width="900" height="600">`).join('')}</div>`;
const bloque = (b, cat) => `${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ''}${b.nota ? `<p class="nota">${esc(b.nota)}</p>` : ''}${galeria(b, b.titulo || cat.titulo)}
<ul>
${b.platos.map(plato).join('\n')}
</ul>`;
const seccion = id => {
  const c = categoria(id);
  if (!c.bloques.length) return '';
  return `<section class="cat" id="${c.id}" data-chip="${c.id}">
<h2>${esc(c.titulo)}</h2>
${c.bloques.map(b => bloque(b, c)).join('\n')}
</section>`;
};

const existe = id => pestanas.some(p => p.id === id) && categoria(id).bloques.length;
const chips = grupos.flatMap(g => g.ids.filter(existe)).map(id => `<a href="#${id}" data-chip="${id}">${esc(etiqueta(id))}</a>`).join('');
const cuerpo = grupos.map(g => {
  const ids = g.ids.filter(existe);
  return ids.length ? `<div class="grupo"><span>${esc(g.titulo)}</span></div>\n${ids.map(seccion).join('\n')}` : '';
}).join('\n');
const total = grupos.flatMap(g => g.ids.filter(existe)).reduce((n, id) => n + categoria(id).bloques.reduce((m, b) => m + b.platos.length, 0), 0);

const pagina = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Carta | La Guaira Bar Restaurante · Comida venezolana en Colmenar Viejo</title>
<meta name="description" content="Carta de La Guaira, restaurante venezolano en Colmenar Viejo: arepas, tequeños, empanadas, cachapas, patacones, parrillas, postres caseros y jugos naturales, con precios.">
<link rel="canonical" href="https://barlaguaira.es/carta">
<meta name="theme-color" content="#0D0B0A">
<link rel="icon" href="favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta property="og:title" content="Carta de La Guaira Bar Restaurante">
<meta property="og:description" content="Comida venezolana en Colmenar Viejo: arepas, tequeños, cachapas, parrillas y más.">
<meta property="og:image" content="https://barlaguaira.es/img/carta/arepas.jpg">
<meta property="og:url" content="https://barlaguaira.es/carta">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --fondo: #0D0B0A; --panel: #171310; --linea: rgba(255,253,245,.09);
  --texto: #FFFDF5; --suave: #B9AC9C; --oro: #F5C542; --oro-tinta: #241A00; --rojo: #C5221F;
  --titulo: 'Playfair Display', Georgia, serif; --cuerpo: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --barra: 56px; --chips: 52px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--fondo); color: var(--texto); font-family: var(--cuerpo); font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
.ancho { max-width: 720px; margin: 0 auto; padding: 0 16px; }

/* Barra superior fija */
.barra { position: sticky; top: 0; z-index: 20; height: var(--barra); background: rgba(13,11,10,.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.barra .ancho { height: 100%; display: flex; align-items: center; gap: 10px; }
.barra img { width: 38px; height: 38px; border-radius: 50%; }
.barra strong { font-family: var(--titulo); font-size: 19px; font-weight: 700; letter-spacing: .01em; }
.barra small { display: block; color: var(--suave); font-size: 11px; line-height: 1.2; }
.barra .llamar { margin-left: auto; min-height: 40px; display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(245,197,66,.45); color: var(--oro); font-size: 14px; font-weight: 600; }

/* Categorías fijas */
.chips { position: sticky; top: var(--barra); z-index: 19; background: rgba(13,11,10,.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--linea); }
.chips nav { max-width: 720px; margin: 0 auto; height: var(--chips); display: flex; align-items: center; gap: 8px; padding: 0 16px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.chips nav::-webkit-scrollbar { display: none; }
.chips a { flex: 0 0 auto; min-height: 36px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; background: var(--panel); border: 1px solid var(--linea); color: var(--suave); font-size: 14px; font-weight: 600; white-space: nowrap; transition: background .2s, color .2s; }
.chips a.activa { background: var(--oro); border-color: var(--oro); color: var(--oro-tinta); }

/* Cabecera */
.intro { padding: 28px 0 8px; text-align: center; }
.intro .sobre { color: var(--oro); font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
.intro h1 { margin: 6px 0 6px; font-family: var(--titulo); font-size: clamp(34px, 9vw, 46px); line-height: 1.1; font-weight: 700; }
.intro p { margin: 0 auto; max-width: 30em; color: var(--suave); font-size: 15px; }
.tricolor { display: flex; width: 72px; height: 3px; margin: 16px auto 0; border-radius: 3px; overflow: hidden; }
.tricolor i { flex: 1; } .tricolor i:nth-child(1) { background: #FFD700; } .tricolor i:nth-child(2) { background: #1A3D9E; } .tricolor i:nth-child(3) { background: var(--rojo); }

/* Menú del día */
.menudia { margin: 22px 0 4px; padding: 16px 18px; border-radius: 18px; border: 1px solid rgba(245,197,66,.4); background: linear-gradient(135deg, rgba(245,197,66,.14), rgba(197,34,31,.10)); display: flex; align-items: center; gap: 14px; }
.menudia div { flex: 1; min-width: 0; }
.menudia b { display: block; font-family: var(--titulo); font-size: 21px; }
.menudia small { display: block; color: var(--oro); font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.menudia p { margin: 2px 0 0; color: #E8DFD8; font-size: 14px; line-height: 1.4; }
.menudia .precio { font-size: 26px; }

/* Grupos y categorías */
.grupo { margin: 36px 0 0; display: flex; align-items: center; gap: 12px; color: var(--oro); font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
.grupo::before, .grupo::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,197,66,.45)); }
.grupo::after { transform: scaleX(-1); }
.cat { padding-top: 26px; scroll-margin-top: calc(var(--barra) + var(--chips)); }
.cat h2 { margin: 0 0 12px; font-family: var(--titulo); font-size: 28px; line-height: 1.15; font-weight: 700; }
.cat h3 { margin: 26px 0 10px; font-family: var(--titulo); font-size: 21px; font-weight: 600; color: var(--oro); }
.cat h2 + h3 { margin-top: 0; }
.nota { display: inline-block; margin: 0 0 12px; padding: 4px 12px; border-radius: 999px; background: var(--panel); border: 1px solid var(--linea); color: var(--oro); font-size: 13px; font-weight: 600; }

.fotos { margin: 0 0 6px; }
.fotos img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 16px; background: var(--panel); }
.fotos.varias { display: flex; gap: 10px; margin: 0 -16px 6px; padding: 0 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.fotos.varias::-webkit-scrollbar { display: none; }
.fotos.varias img { flex: 0 0 82%; width: 82%; aspect-ratio: 4 / 3; scroll-snap-align: center; }

ul { list-style: none; margin: 0; padding: 0; }
.plato { padding: 14px 0; border-bottom: 1px solid var(--linea); }
.plato:last-child { border-bottom: 0; }
.linea { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.plato h4 { margin: 0; font-size: 17px; line-height: 1.3; font-weight: 700; }
.plato p { margin: 4px 0 0; max-width: 34em; padding-right: 56px; color: var(--suave); font-size: 14.5px; line-height: 1.45; }
.precio { flex: 0 0 auto; color: var(--oro); font-size: 17px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.sg { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(245,197,66,.4); color: var(--oro); font-size: 11px; font-weight: 600; vertical-align: middle; white-space: nowrap; }

/* Pie */
footer { margin-top: 44px; padding: 28px 0 calc(28px + env(safe-area-inset-bottom)); border-top: 1px solid var(--linea); background: var(--panel); color: var(--suave); font-size: 14px; text-align: center; }
footer p { margin: 0 0 10px; }
footer strong { color: var(--texto); }
footer .acciones { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 18px 0 0; }
footer .acciones a { min-height: 44px; display: inline-flex; align-items: center; padding: 0 18px; border-radius: 999px; font-weight: 700; font-size: 15px; }
footer .oro { background: var(--oro); color: var(--oro-tinta); }
footer .borde { border: 1px solid rgba(245,197,66,.45); color: var(--oro); }

@media (min-width: 720px) {
  .plato h4, .precio { font-size: 18px; }
  .fotos.varias { margin: 0 0 6px; padding: 0; overflow: visible; }
  .fotos.varias img { flex: 1 1 0; width: auto; min-width: 0; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } .chips a { transition: none; } }
</style>
</head>
<body>
<header class="barra"><div class="ancho">
<img src="apple-touch-icon.png" alt="" width="38" height="38">
<div><strong>La Guaira</strong><small>Bar Restaurante · Colmenar Viejo</small></div>
<a class="llamar" href="tel:+34919472027" aria-label="Llamar al 919 47 20 27">Llamar</a>
</div></header>
<div class="chips"><nav aria-label="Categorías de la carta">${chips}</nav></div>
<main class="ancho">
<div class="intro">
<span class="sobre">Cocina venezolana</span>
<h1>Nuestra Carta</h1>
<p>Hecha al momento, como en casa. Consulta los alérgenos con nuestro equipo.</p>
<div class="tricolor" aria-hidden="true"><i></i><i></i><i></i></div>
</div>
<div class="menudia">
<div><small>Lunes a viernes al mediodía</small><b>Menú del día</b><p>${esc(menuDia.detalle)}</p></div>
<span class="precio">${precio(menuDia.precio)}</span>
</div>
${cuerpo}
</main>
<footer><div class="ancho">
<p><strong>La Guaira Bar Restaurante</strong><br>Av. de América, 9 · 28770 Colmenar Viejo, Madrid</p>
<p>Lunes a viernes de 8:00 a 23:00 · Sábados y domingos de 9:00 a 0:00</p>
<p>Precios con IVA incluido. Las arepas son de maíz, sin gluten.</p>
<div class="acciones"><a class="oro" href="tel:+34919472027">Llamar 919 47 20 27</a><a class="borde" href="/">Ver la web y reservar</a></div>
</div></footer>
<script>
(function () {
  var nav = document.querySelector('.chips nav'), chips = {}, actual = null;
  nav.querySelectorAll('a').forEach(function (a) { chips[a.dataset.chip] = a; });
  function activar(id) {
    if (id === actual || !chips[id]) return;
    if (actual) chips[actual].classList.remove('activa');
    actual = id; var a = chips[id]; a.classList.add('activa');
    nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
  }
  var secciones = [].slice.call(document.querySelectorAll('section.cat'));
  function medir() {
    var corte = 56 + 52 + 24, id = secciones[0].id;
    for (var i = 0; i < secciones.length; i++) { if (secciones[i].getBoundingClientRect().top <= corte) id = secciones[i].id; else break; }
    activar(id);
  }
  var pendiente = false;
  addEventListener('scroll', function () { if (pendiente) return; pendiente = true; requestAnimationFrame(function () { pendiente = false; medir(); }); }, { passive: true });
  medir();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'carta.html'), pagina);
console.log(`Carta móvil generada: ${grupos.length} grupos, ${total} platos.`);
