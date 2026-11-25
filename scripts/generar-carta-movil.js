// Genera carta.html: la carta pensada para el móvil (la que abren los comensales con el QR de la mesa).
// Lee los mismos datos que la web y el PDF: las tarjetas con foto de code.html + los paneles de carta.json,
// y las fotos de cada apartado en img/carta/<apartado>.jpg (y -2, -3).
// Diseño editorial con 3D muy sutil ligado al scroll (ver el objeto AJUSTES_3D del script de la página).
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

// Etiquetas: las de las tarjetas de la web y las que se pongan en carta.json ("etiquetas": ["Vegetariano"]).
// "Sin gluten" no va plato a plato: todas las arepas son de maíz y se indica en la cabecera del apartado.
const FAVORITOS = /más pedida|especial de la casa|plato nacional|la reina|favorit/i;
const tipoEtiqueta = t => FAVORITOS.test(t) ? 'fav' : /vegetarian|vegan|gluten|lactosa/i.test(t) ? 'dieta' : /picante/i.test(t) ? 'pica' : '';
const etiquetas = lista => !lista || !lista.length ? '' :
  `<div class="tags">${lista.map(t => `<span class="tag ${tipoEtiqueta(t)}">${tipoEtiqueta(t) === 'fav' ? '<i aria-hidden="true">★</i>' : ''}${esc(t)}</span>`).join('')}</div>`;

// Tarjetas con foto de la portada (arepas, empanadas, parrillas...)
const cards = {};
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const cat = (chunk.match(/data-category="([^"]+)"/) || [])[1];
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!cat || !m || cat === 'menu-dia') continue;
  const cabeza = chunk.slice(0, chunk.indexOf('<h3'));
  const foto = (cabeza.match(/<img[^>]*\ssrc="([^"]+)"/) || [])[1] || null;
  const alt = (cabeza.match(/<img[^>]*\salt="([^"]*)"/) || [])[1] || '';
  const sellos = [...cabeza.matchAll(/<span class="absolute[^>]*>([\s\S]*?)<\/span>/g)].map(x => clean(x[1])).filter(t => t && !/sin gluten/i.test(t));
  (cards[cat] = cards[cat] || []).push({ nombre: clean(m[1]), precio: clean(m[2]), detalle: clean(m[3]), foto, alt: clean(alt), etiquetas: sellos });
}
const md = html.slice(html.indexOf('data-category="menu-dia"'));
const menuDia = {
  precio: clean(md.match(/text-display-lg[^>]*>([^<]+)<\/span>/)[1]),
  detalle: clean(md.match(/<p class="font-body-md[^>]*>([\s\S]*?)<\/p>/)[1]),
};

const fotos = k => ['', '-2', '-3'].map(n => `img/carta/${slug(k)}${n}.jpg`).filter(f => fs.existsSync(path.join(root, f)));
const NOTAS_EXTRA = { arepas: 'Todas de maíz · sin gluten' };

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
const pestana = id => carta.pestanas.find(p => p.id === id);
const etiqueta = id => pestana(id).label.replace(/^\S+\s/, '');
const emoji = id => (pestana(id).label.match(/^(\S+)\s/) || [, '🍽️'])[1];

// Una categoría = una pestaña; si tiene varios paneles (bebidas) cada panel es un bloque con su foto.
// Los platos con foto propia van como "destacados"; el resto, en la lista de lectura rápida.
const categoria = id => {
  const paneles = carta.paneles.filter(p => p.categoria === id);
  const varios = paneles.length > 1;
  const dest = cards[id] || [];
  const bloques = varios
    ? paneles.map((p, k) => ({ titulo: p.titulo, nota: p.nota, fotos: fotos(`${id}:${p.titulo}`), destacados: k === 0 ? dest : [], platos: p.platos }))
    : [{ titulo: null, nota: paneles[0] && paneles[0].nota, fotos: fotos(id), destacados: dest, platos: paneles[0] ? paneles[0].platos : [] }];
  return { id, titulo: etiqueta(id), emoji: emoji(id), extra: NOTAS_EXTRA[id], bloques: bloques.filter(b => b.platos.length || b.destacados.length) };
};

const altFoto = t => `${esc(t)} en La Guaira, restaurante venezolano en Colmenar Viejo`;
// Si una foto no carga, la tarjeta pasa a su versión sin foto (onerror), sin huecos rotos.
const img = (src, alt, extra = '') => `<img src="${esc(src)}" alt="${alt}" loading="lazy" decoding="async" width="900" height="600"${extra} onerror="this.closest('[data-foto]').classList.add('sin-foto');this.remove()">`;

const plato = p => `<li class="plato rev">
<div class="linea"><h4>${esc(p.nombre)}</h4><span class="precio">${precio(p.precio)}</span></div>${p.detalle ? `
<p>${esc(p.detalle)}</p>` : ''}${etiquetas(p.etiquetas)}
</li>`;

const destacado = (p, cat) => `<li class="dest${p.foto ? '' : ' sin-foto'}" data-foto data-3d="tarjeta">
<div class="dfoto"><div class="marco">${p.foto ? img(p.foto, esc(p.alt || p.nombre), ' data-par') : ''}</div><span class="vacio" aria-hidden="true">${cat.emoji}</span></div>
<div class="dtxt">
<div class="linea"><h4>${esc(p.nombre)}</h4><span class="precio">${precio(p.precio)}</span></div>
${p.detalle ? `<p>${esc(p.detalle)}</p>` : ''}${etiquetas(p.etiquetas)}
</div>
</li>`;
const destacados = (b, cat) => !b.destacados.length ? '' : `
<ul class="destacados${b.destacados.length > 1 ? ' fila' : ''}" aria-label="Platos destacados: ${esc(b.titulo || cat.titulo)}"${b.destacados.length > 1 ? ' tabindex="0"' : ''}>
${b.destacados.map(p => destacado(p, cat)).join('\n')}
</ul>`;

// Portada del apartado: la foto grande. Si los destacados ya traen foto propia, no se repite portada.
const portada = (b, cat) => {
  if (b.destacados.some(d => d.foto)) return '';
  const lista = b.fotos;
  if (!lista.length) return b.destacados.length ? '' : `<div class="portada sin-foto" data-foto aria-hidden="true"><span class="vacio">${cat.emoji}</span></div>`;
  if (lista.length === 1) return `<div class="portada" data-foto data-3d="portada"><div class="marco">${img(lista[0], altFoto(b.titulo || cat.titulo), ' data-par')}</div><span class="vacio" aria-hidden="true">${cat.emoji}</span></div>`;
  return `<ul class="portada-fila fila" aria-label="Fotos: ${esc(b.titulo || cat.titulo)}" tabindex="0">${lista.map(f => `<li class="pf" data-foto><div class="marco">${img(f, altFoto(b.titulo || cat.titulo))}</div><span class="vacio" aria-hidden="true">${cat.emoji}</span></li>`).join('')}</ul>`;
};

const bloque = (b, cat) => `${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ''}${[b.nota, cat.extra].filter(Boolean).map(n => `<p class="nota">${esc(n)}</p>`).join('')}
${portada(b, cat)}${destacados(b, cat)}${b.platos.length ? `
<ul class="lista">
${b.platos.map(plato).join('\n')}
</ul>` : ''}`;
const seccion = id => {
  const c = categoria(id);
  if (!c.bloques.length) return '';
  const n = c.bloques.reduce((m, b) => m + b.platos.length + b.destacados.length, 0);
  return `<section class="cat" id="${c.id}" data-chip="${c.id}">
<header class="cab"><h2>${esc(c.titulo)}</h2><span class="cuenta">${n} ${n === 1 ? 'opción' : 'opciones'}</span></header>
${c.bloques.map(b => bloque(b, c)).join('\n')}
</section>`;
};

const existe = id => pestanas.some(p => p.id === id) && categoria(id).bloques.length;
const chips = grupos.flatMap(g => g.ids.filter(existe)).map(id => `<a href="#${id}" data-chip="${id}"><span aria-hidden="true">${emoji(id)}</span> ${esc(etiqueta(id))}</a>`).join('');
const cuerpo = grupos.map(g => {
  const ids = g.ids.filter(existe);
  return ids.length ? `<div class="grupo"><span>${esc(g.titulo)}</span></div>\n${ids.map(seccion).join('\n')}` : '';
}).join('\n');
const total = grupos.flatMap(g => g.ids.filter(existe)).reduce((n, id) => n + categoria(id).bloques.reduce((m, b) => m + b.platos.length + b.destacados.length, 0), 0);

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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --fondo: #0D0B0A; --panel: #171310; --panel-2: #1E1915; --linea: rgba(255,253,245,.08);
  --texto: #FFFDF5; --suave: #B9AC9C; --oro: #F5C542; --oro-tinta: #241A00; --rojo: #C5221F; --verde: #8FD19E;
  --titulo: 'Playfair Display', Georgia, serif; --cuerpo: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --barra: 56px; --chips: 52px;
  --radio: 20px;
  --sombra: 0 18px 40px -18px rgba(0,0,0,.85), 0 2px 6px rgba(0,0,0,.35);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--fondo); color: var(--texto); font-family: var(--cuerpo); font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
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
.chips a { flex: 0 0 auto; min-height: 36px; display: inline-flex; align-items: center; gap: 4px; padding: 0 14px; border-radius: 999px; background: var(--panel); border: 1px solid var(--linea); color: var(--suave); font-size: 14px; font-weight: 600; white-space: nowrap; transition: background .25s, color .25s, border-color .25s; }
.chips a.activa { background: var(--oro); border-color: var(--oro); color: var(--oro-tinta); }

/* Cabecera */
.intro { padding: 30px 0 8px; text-align: center; }
.intro .sobre { color: var(--oro); font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
.intro h1 { margin: 6px 0 6px; font-family: var(--titulo); font-size: clamp(36px, 10vw, 48px); line-height: 1.08; font-weight: 700; }
.intro h1 em { font-weight: 500; color: var(--oro); }
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

/* Grupos y apartados */
.grupo { margin: 44px 0 0; display: flex; align-items: center; gap: 12px; color: var(--oro); font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
.grupo::before, .grupo::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,197,66,.45)); }
.grupo::after { transform: scaleX(-1); }
.cat { padding-top: 30px; scroll-margin-top: calc(var(--barra) + var(--chips)); }
.cab { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 12px; }
.cab h2 { margin: 0; font-family: var(--titulo); font-size: 30px; line-height: 1.12; font-weight: 700; }
.cuenta { color: var(--suave); font-size: 13px; font-weight: 600; white-space: nowrap; }
.cat h3 { margin: 30px 0 10px; font-family: var(--titulo); font-size: 22px; font-weight: 600; color: var(--oro); }
.cab + h3 { margin-top: 0; }
.nota { display: inline-block; margin: 0 6px 12px 0; padding: 4px 12px; border-radius: 999px; background: var(--panel); border: 1px solid var(--linea); color: var(--oro); font-size: 13px; font-weight: 600; }

/* Fotos: marco con sombra de profundidad suave. La imagen va un poco ampliada para el paralaje. */
.marco { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; background: var(--panel-2); }
.marco img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.06); filter: saturate(1.06) contrast(1.03); }
.marco::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,240,210,.06), transparent 35%, transparent 70%, rgba(13,11,10,.28)); box-shadow: inset 0 0 0 1px rgba(255,253,245,.07); }
.vacio { display: none; }
/* Sin foto: un fondo cálido con el icono del apartado, para que la tarjeta no se vea vacía */
.sin-foto .marco { display: none; }
.sin-foto .vacio { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 44px; border-radius: inherit;
  background: radial-gradient(120% 90% at 30% 20%, rgba(245,197,66,.18), transparent 60%), radial-gradient(90% 80% at 85% 90%, rgba(197,34,31,.16), transparent 60%), var(--panel-2);
  box-shadow: inset 0 0 0 1px rgba(245,197,66,.16); }

.portada { position: relative; aspect-ratio: 16 / 10; border-radius: var(--radio); margin: 0 0 14px; box-shadow: var(--sombra); }
.portada.sin-foto { aspect-ratio: 16 / 6; box-shadow: none; }

/* Filas deslizables (destacados y fotos de apartado) */
.fila { display: flex; gap: 12px; margin: 0 -16px 14px; padding: 4px 16px 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; list-style: none; -webkit-overflow-scrolling: touch; }
.fila::-webkit-scrollbar { display: none; }
.fila > li { scroll-snap-align: center; }
.portada-fila .pf { position: relative; flex: 0 0 84%; aspect-ratio: 4 / 3; border-radius: var(--radio); box-shadow: var(--sombra); }

/* Platos destacados (con foto propia) */
ul { list-style: none; margin: 0; padding: 0; }
.destacados { margin-bottom: 14px; }
.dest { border-radius: var(--radio); background: var(--panel); box-shadow: var(--sombra); overflow: hidden; }
.destacados.fila .dest { flex: 0 0 80%; max-width: 340px; }
.destacados:not(.fila) .dest { margin-bottom: 4px; }
.dfoto { position: relative; aspect-ratio: 4 / 3; border-radius: var(--radio) var(--radio) 0 0; }
.dest.sin-foto .dfoto { aspect-ratio: 16 / 7; }
.dtxt { padding: 14px 16px 16px; }
.dtxt p { margin: 5px 0 0; color: var(--suave); font-size: 14.5px; line-height: 1.45; }

/* Lista de lectura rápida */
.lista { margin-top: 2px; }
.plato { padding: 14px 0; border-bottom: 1px solid var(--linea); }
.plato:last-child { border-bottom: 0; }
.linea { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
h4 { margin: 0; font-size: 17px; line-height: 1.3; font-weight: 700; }
.plato p { margin: 4px 0 0; max-width: 34em; padding-right: 56px; color: var(--suave); font-size: 14.5px; line-height: 1.45; }
.precio { flex: 0 0 auto; color: var(--oro); font-size: 17px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }

/* Etiquetas discretas */
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 999px; border: 1px solid var(--linea); color: var(--suave); font-size: 12px; font-weight: 600; line-height: 1.5; }
.tag i { font-style: normal; color: var(--oro); font-size: 11px; }
.tag.fav { border-color: rgba(245,197,66,.35); color: #F3DDA0; }
.tag.dieta { border-color: rgba(143,209,158,.35); color: var(--verde); }
.tag.pica { border-color: rgba(197,34,31,.5); color: #F0A39F; }

/* Movimiento: solo se activa cuando el script está listo (html.mov). Sin JS, todo se ve quieto y completo. */
.mov [data-3d] { will-change: transform; }
.mov .rev { opacity: 0; transform: translate3d(0, 10px, 0); transition: opacity .55s ease-out, transform .55s cubic-bezier(.2,.7,.2,1); }
.mov .rev.dentro { opacity: 1; transform: none; }

/* Pie */
footer { margin-top: 48px; padding: 28px 0 calc(28px + env(safe-area-inset-bottom)); border-top: 1px solid var(--linea); background: var(--panel); color: var(--suave); font-size: 14px; text-align: center; }
footer p { margin: 0 0 10px; }
footer strong { color: var(--texto); }
footer .acciones { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 18px 0 0; }
footer .acciones a { min-height: 44px; display: inline-flex; align-items: center; padding: 0 18px; border-radius: 999px; font-weight: 700; font-size: 15px; }
footer .oro { background: var(--oro); color: var(--oro-tinta); }
footer .borde { border: 1px solid rgba(245,197,66,.45); color: var(--oro); }

@media (min-width: 720px) {
  h4, .precio { font-size: 18px; }
  .portada-fila { margin: 0 0 14px; padding: 4px 0 18px; overflow: visible; }
  .portada-fila .pf { flex: 1 1 0; min-width: 0; }
  .destacados.fila .dest { flex-basis: 46%; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .chips a, .mov .rev { transition: none; }
  .mov .rev { opacity: 1; transform: none; }
  [data-3d], [data-par], .fila > li { transform: none !important; }
}
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
<h1>Nuestra <em>Carta</em></h1>
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
// Categorías: resalta la pestaña del apartado que se está leyendo
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

// 3D sutil ligado al scroll. Solo transform y opacity (van por la GPU) y solo en lo que está en pantalla.
(function () {
  var AJUSTES_3D = {
    intensidad: 1,       // multiplica todo el efecto: 0 = apagado, 0.6 = más discreto, 1.4 = algo más marcado
    inclinacion: 3,      // grados máximos de inclinación de las fotos al entrar desde abajo
    elevacion: 18,       // píxeles que sube la foto mientras entra
    escala: 0.025,       // cuánto crece (2,5 %) hasta su tamaño final
    paralaje: 3.5,       // % que se desplaza la imagen dentro de su marco
    giroFila: 5,         // grados de giro de las tarjetas laterales en las filas deslizables
    escalaFila: 0.05,    // cuánto se reducen las tarjetas laterales
    gamaBaja: 0.6,       // factor para móviles modestos (4 núcleos o menos, ahorro de datos)
    perspectiva: 1100    // px; más alto = profundidad más plana y elegante
  };
  var reducir = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducir.matches || !('IntersectionObserver' in window) || /[?&]3d=0/.test(location.search)) return;
  var C = AJUSTES_3D, I = C.intensidad;
  var con = navigator.connection || {};
  if ((navigator.hardwareConcurrency || 8) <= 4 || con.saveData || (navigator.deviceMemory || 8) <= 3) I *= C.gamaBaja;
  document.documentElement.classList.add('mov');

  // Aparición suave de la lista de platos (sin 3D: el texto nunca se inclina)
  var ioRev = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dentro'); ioRev.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rev').forEach(function (el) { ioRev.observe(el); });

  // Fotos y tarjetas que reaccionan al scroll vertical: solo las visibles
  var visibles = new Set();
  var io3d = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visibles.add(e.target); else visibles.delete(e.target); });
    pedir();
  }, { rootMargin: '15% 0px 15% 0px' });
  document.querySelectorAll('.portada[data-3d], .destacados:not(.fila) [data-3d]').forEach(function (el) { io3d.observe(el); });

  var cola = false;
  function pedir() { if (!cola) { cola = true; requestAnimationFrame(pintar); } }
  function lim(v, a, b) { return v < a ? a : v > b ? b : v; }
  function suave(t) { return t * t * (3 - 2 * t); }

  function pintar() {
    cola = false;
    if (I <= 0) return;
    var vh = innerHeight;
    visibles.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var c = (r.top + r.height / 2) / vh;              // 0 = arriba de la pantalla, 1 = abajo
      var k = suave(lim((c - 0.55) / 0.5, 0, 1));         // 0 ya colocada, 1 entrando por abajo
      el.style.transform = 'perspective(' + C.perspectiva + 'px) translate3d(0,' + (k * C.elevacion * I).toFixed(1) + 'px,0) rotateX(' + (k * C.inclinacion * I).toFixed(2) + 'deg) scale(' + (1 - k * C.escala * I).toFixed(4) + ')';
      var im = el.querySelector('[data-par]');
      if (im) im.style.transform = 'translate3d(0,' + (lim(c - 0.5, -0.8, 0.8) * C.paralaje * 2 * I).toFixed(2) + '%,0) scale(1.08)';
    });
  }
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir, { passive: true });

  // Filas deslizables: la tarjeta central queda plana; las laterales giran y se alejan muy poco
  document.querySelectorAll('.fila').forEach(function (fila) {
    var items = [].slice.call(fila.children), pend = false;
    function pintarFila() {
      pend = false;
      var fr = fila.getBoundingClientRect(), centro = fr.left + fr.width / 2;
      items.forEach(function (it) {
        var r = it.getBoundingClientRect();
        var d = lim((r.left + r.width / 2 - centro) / r.width, -1.2, 1.2), a = Math.abs(d);
        it.style.transform = 'perspective(' + C.perspectiva + 'px) rotateY(' + (-d * C.giroFila * I).toFixed(2) + 'deg) scale(' + (1 - Math.min(a, 1) * C.escalaFila * I).toFixed(4) + ')';
      });
    }
    fila.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(pintarFila); } }, { passive: true });
    addEventListener('resize', pintarFila, { passive: true });
    pintarFila();
  });

  // Si el móvil va justo (fotogramas lentos al hacer scroll), se rebaja el efecto automáticamente
  var t0 = 0, lentos = 0, n = 0;
  function vigilar(t) {
    if (t0) { var dt = t - t0; n++; if (dt > 26) lentos++; }
    t0 = t;
    if (n >= 90) { if (lentos > 25) { I *= 0.5; if (I < 0.3) { I = 0; visibles.forEach(function (el) { el.style.transform = ''; }); } } return; }
    requestAnimationFrame(vigilar);
  }
  addEventListener('scroll', function arrancar() { removeEventListener('scroll', arrancar); requestAnimationFrame(vigilar); }, { passive: true });

  // Si el usuario activa "reducir movimiento" con la página abierta, todo queda quieto
  if (reducir.addEventListener) reducir.addEventListener('change', function (e) { if (e.matches) { I = 0; document.querySelectorAll('[data-3d], [data-par], .fila > li').forEach(function (el) { el.style.transform = ''; }); } });
  pintar();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'carta.html'), require('./webp').usarWebp(pagina));
console.log(`Carta móvil generada: ${grupos.length} grupos, ${total} platos.`);
