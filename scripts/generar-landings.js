// Páginas para búsquedas concretas de Google ("arepas en Colmenar Viejo", "desayunos en Colmenar Viejo", "menú del día en Colmenar Viejo").
// Salen de los mismos datos que la web (tarjetas con foto de code.html + carta.json): al cambiar un precio y regenerar, se actualizan solas.
// Uso: node scripts/generar-landings.js   (también lo llama generar-carta.js)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'code.html'), 'utf8');
const carta = JSON.parse(fs.readFileSync(path.join(root, 'carta.json'), 'utf8'));
const { usarWebp } = require('./webp');

const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = p => p.replace(/[^\d,]/g, '').replace(',', '.');

// Tarjetas con foto de la web, por categoría
const cards = {};
for (const chunk of html.split('<div class="dish-item').slice(1)) {
  const cat = (chunk.match(/data-category="([^"]+)"/) || [])[1];
  const m = chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*whitespace-nowrap">([^<]+)<\/span>\s*<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!cat || !m) continue;
  const cabeza = chunk.slice(0, chunk.indexOf('<h3'));
  const foto = (cabeza.match(/<img[^>]*\ssrc="(img\/[^"]+)"/) || [])[1] || null; // solo fotos propias del servidor
  const alt = (cabeza.match(/<img[^>]*\salt="([^"]*)"/) || [])[1] || '';
  (cards[cat] = cards[cat] || []).push({ nombre: clean(m[1]), precio: clean(m[2]), detalle: clean(m[3]), foto, alt: clean(alt) });
}
const panel = (cat, titulo) => carta.paneles.find(p => p.categoria === cat && (!titulo || p.titulo === titulo));
const md = html.slice(html.indexOf('data-category="menu-dia"'));
const menuDia = { precio: clean(md.match(/text-display-lg[^>]*>([^<]+)<\/span>/)[1]), detalle: clean(md.match(/<p class="font-body-md[^>]*>([\s\S]*?)<\/p>/)[1]) };

const WA = 'https://api.whatsapp.com/send?phone=34643128808';
const MAPS = 'https://www.google.com/maps/search/?api=1&amp;query=Avenida+de+Am%C3%A9rica+9%2C+28770+Colmenar+Viejo%2C+Madrid';
const RESENAS = 'https://maps.google.com/?cid=3124493378761162679';

const lista = platos => `<ul class="lista">${platos.map(p => `
<li><div class="l"><h3>${esc(p.nombre)}</h3><span class="pr">${esc(p.precio).replace(/\s*€/, '&nbsp;€')}</span></div>${p.detalle ? `<p>${esc(p.detalle)}</p>` : ''}</li>`).join('')}
</ul>`;
const destacados = platos => `<ul class="dest">${platos.filter(p => p.foto).map(p => `
<li><img src="${esc(p.foto)}" alt="${esc(p.alt || p.nombre)}" loading="lazy" decoding="async" width="960" height="720">
<div class="t"><div class="l"><h3>${esc(p.nombre)}</h3><span class="pr">${esc(p.precio).replace(/\s*€/, '&nbsp;€')}</span></div><p>${esc(p.detalle)}</p></div></li>`).join('')}
</ul>`;
const galeria = fotos => `<div class="gal">${fotos.map(([f, a]) => `<img src="${f}" alt="${esc(a)}" loading="lazy" decoding="async" width="960" height="720">`).join('')}</div>`;

const paginas = [
  {
    archivo: 'arepas-colmenar-viejo',
    titulo: 'Arepas en Colmenar Viejo | La Guaira, arepera venezolana',
    desc: 'Arepas venezolanas de maíz hechas al momento en Colmenar Viejo: Reina Pepiada, pabellón, La Pelúa, carne mechada y más. Av. de América 9. Para tomar aquí o para llevar.',
    kicker: 'Arepera venezolana en Colmenar Viejo',
    h1: 'Arepas venezolanas <em>en Colmenar Viejo</em>',
    intro: 'En La Guaira hacemos las arepas como en casa: masa de maíz, a la plancha al momento y bien rellenas. Elige un clásico como la Reina Pepiada o la de pabellón, o combina tus rellenos favoritos. Todas son de maíz.',
    hero: ['img/arepa-reina-pepiada.jpg', 'Arepa Reina Pepiada de pollo y aguacate en La Guaira, Colmenar Viejo'],
    cuerpo: () => {
      const p = panel('arepas');
      return `<h2>Las más pedidas</h2>${destacados(cards.arepas || [])}
<h2>Más arepas</h2>${p.nota ? `<p class="nota">${esc(p.nota)} · todas de maíz</p>` : ''}${lista(p.platos)}`;
    },
    platosSchema: () => [...(cards.arepas || []), ...panel('arepas').platos],
    faq: [
      ['¿Dónde comer arepas en Colmenar Viejo?', 'En La Guaira Bar Restaurante, en la Avenida de América, 9. Hacemos arepas venezolanas de maíz al momento, para tomar aquí o para llevar.'],
      ['¿Las arepas son sin gluten?', 'La masa de nuestras arepas es de harina de maíz. Si eres celíaco, avísanos al pedir y te contamos cómo las preparamos.'],
      ['¿Puedo pedir arepas para llevar?', `Sí. Llámanos al 919 47 20 27 o escríbenos por WhatsApp al 643 12 88 08 y te las preparamos para recoger.`],
    ],
  },
  {
    archivo: 'desayunos-colmenar-viejo',
    titulo: 'Desayunos en Colmenar Viejo | Desayuno criollo venezolano en La Guaira',
    desc: 'Desayuno criollo venezolano en Colmenar Viejo: arepa con perico, caraotas, empanadas, cachitos, golfeados y café. De lunes a viernes desde las 8:00 y fines de semana desde las 9:00.',
    kicker: 'Desayunos en Colmenar Viejo',
    h1: 'Desayuno criollo <em>en Colmenar Viejo</em>',
    intro: 'Empieza el día a la venezolana: arepa con queso y perico, caraotas negras, empanadas recién fritas, cachitos de jamón o un golfeado con queso de mano, con su café con leche. Abrimos temprano también el fin de semana.',
    hero: ['img/desayuno-empanadas-cafe.jpg', 'Desayuno con empanadas, guasacaca y café con leche en La Guaira, Colmenar Viejo'],
    cuerpo: () => {
      const d = panel('desayunos'), e = panel('empanadas'), c = panel('bebidas', 'Cafés');
      return `<p class="hora">☕ ${esc(d.nota || 'L–V desde 8:00 · S–D desde 9:00')}</p>
<h2>Desayunos</h2>${lista(d.platos)}
<h2>Empanadas recién fritas</h2>${destacados((cards.empanadas || []).filter(p => /pollo|queso|carne mechada/i.test(p.nombre)))}${e.nota ? `<p class="nota">${esc(e.nota)}</p>` : ''}${lista(e.platos)}
<h2>Cafés</h2>${lista(c.platos)}`;
    },
    platosSchema: () => [...panel('desayunos').platos, ...(cards.empanadas || []), ...panel('bebidas', 'Cafés').platos],
    faq: [
      ['¿A qué hora abrís para desayunar?', 'De lunes a viernes desde las 8:00 y sábados y domingos desde las 9:00.'],
      ['¿Qué es un desayuno criollo?', 'Es el desayuno típico venezolano: arepa con queso acompañada de perico (huevo revuelto con tomate y cebolla), caraotas negras o aguacate, y café.'],
      ['¿Dónde estáis?', 'En la Avenida de América, 9, 28770 Colmenar Viejo (Madrid).'],
    ],
  },
  {
    archivo: 'menu-del-dia-colmenar-viejo',
    titulo: `Menú del día en Colmenar Viejo por ${menuDia.precio} | La Guaira`,
    desc: `Menú del día casero en Colmenar Viejo por ${menuDia.precio}, de lunes a viernes al mediodía: ${menuDia.detalle.replace(/\s*Varía.*$/, '').toLowerCase()} Cocina venezolana y casera en la Av. de América 9.`,
    kicker: 'Menú del día en Colmenar Viejo',
    h1: `Menú del día <em>por ${esc(menuDia.precio)}</em>`,
    intro: `De lunes a viernes, al mediodía, cocina casera a buen precio. ${esc(menuDia.detalle)} El menú cambia según el día, así que siempre hay algo nuevo.`,
    hero: ['img/menu-del-dia.jpg', 'Menú del día en La Guaira: pescado a la plancha con arroz blanco y ensalada de aguacate y tomate'],
    cuerpo: () => `<div class="precio-grande"><span>${esc(menuDia.precio)}</span><small>IVA incluido · Lunes a viernes, mediodía</small></div>
<h2>Así es nuestro menú</h2>
<ul class="lista"><li><div class="l"><h3>Primer plato</h3></div></li><li><div class="l"><h3>Bebida</h3></div></li><li><div class="l"><h3>Postre o café</h3></div></li></ul>
<h2>Platos que han salido en el menú</h2>
<p class="nota">Algunos de los platos que hemos servido estas semanas. Pregúntanos por el de hoy o míralo en nuestras historias de Instagram.</p>
${galeria([['img/menu-del-dia.jpg', 'Pescado a la plancha con arroz y ensalada'], ['img/arroz-la-guaira.jpg', 'Arroz La Guaira del menú del día'], ['img/carta/platos-2.jpg', 'Pasticho casero con tajadas de plátano']])}`,
    platosSchema: () => [{ nombre: 'Menú del día', precio: menuDia.precio, detalle: menuDia.detalle }],
    faq: [
      ['¿Cuánto cuesta el menú del día?', `${menuDia.precio}, IVA incluido.`],
      ['¿Qué días hay menú del día?', 'De lunes a viernes, al mediodía.'],
      ['¿Cómo sé qué hay hoy en el menú?', 'Llámanos al 919 47 20 27, escríbenos por WhatsApp al 643 12 88 08 o mira nuestras historias de Instagram @laguairabar.colmenar.'],
    ],
  },
];

const pagina = p => {
  const url = `https://barlaguaira.es/${p.archivo}`;
  const platos = p.platosSchema();
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Restaurant', '@id': 'https://barlaguaira.es/#restaurante', name: 'La Guaira Bar Restaurante', url: 'https://barlaguaira.es/', telephone: '+34919472027', servesCuisine: ['Venezolana'], priceRange: '€', image: `https://barlaguaira.es/${p.hero[0]}`,
      address: { '@type': 'PostalAddress', streetAddress: 'Avenida de América, 9', postalCode: '28770', addressLocality: 'Colmenar Viejo', addressRegion: 'Madrid', addressCountry: 'ES' },
      hasMenu: { '@type': 'Menu', name: p.kicker, hasMenuSection: { '@type': 'MenuSection', name: p.kicker, hasMenuItem: platos.map(x => ({ '@type': 'MenuItem', name: x.nombre, ...(x.detalle ? { description: x.detalle } : {}), offers: { '@type': 'Offer', price: num(x.precio), priceCurrency: 'EUR' } })) } } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'La Guaira', item: 'https://barlaguaira.es/' }, { '@type': 'ListItem', position: 2, name: p.kicker, item: url }] },
  ];
  const otras = paginas.filter(o => o !== p);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.titulo)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0D0B0A">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="La Guaira Bar Restaurante">
<meta property="og:title" content="${esc(p.titulo)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="https://barlaguaira.es/${p.hero[0]}">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500&display=swap" rel="stylesheet">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<style>
:root { --fondo: #0D0B0A; --tarjeta: #1C1815; --borde: rgba(255,215,0,.2); --oro: #FFD700; --crema: #FFFDF5; --suave: #E8DFD8; --tenue: #9E8E7C; --rojo: #C5221F; --azul: #1A3D9E; }
* { box-sizing: border-box; margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body { background: var(--fondo); color: var(--crema); font: 400 16px/1.6 'Be Vietnam Pro', system-ui, sans-serif; padding-bottom: calc(72px + env(safe-area-inset-bottom)); }
a { color: inherit; }
.tri { display: flex; height: 5px; } .tri i { flex: 1; } .tri i:nth-child(1) { background: var(--oro); } .tri i:nth-child(2) { background: var(--azul); } .tri i:nth-child(3) { background: var(--rojo); }
header.cab { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; max-width: 980px; margin: 0 auto; }
.marca { display: flex; align-items: center; gap: 10px; text-decoration: none; font: 800 17px/1.1 'Plus Jakarta Sans', sans-serif; }
.marca img { width: 42px; height: 42px; border-radius: 50%; border: 2px solid var(--oro); }
.marca small { display: block; font-size: 11px; font-weight: 600; color: var(--tenue); letter-spacing: .04em; }
.cab .ver { font: 700 14px 'Plus Jakarta Sans', sans-serif; color: var(--oro); text-decoration: none; white-space: nowrap; }
main { max-width: 980px; margin: 0 auto; padding: 0 16px 40px; }
.hero { position: relative; border-radius: 28px; overflow: hidden; margin-top: 6px; aspect-ratio: 4 / 3; max-height: 520px; width: 100%; }
.hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(13,11,10,.9)); }
.hero .txt { position: absolute; left: 20px; right: 20px; bottom: 18px; z-index: 1; }
.kicker { font: 800 12px 'Plus Jakarta Sans', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--oro); }
h1 { font: 800 clamp(30px, 7vw, 52px)/1.04 'Plus Jakarta Sans', sans-serif; letter-spacing: -.02em; margin-top: 6px; }
h1 em { font-style: normal; color: var(--oro); }
.intro { font-size: 18px; color: var(--suave); margin: 22px 0 8px; max-width: 720px; }
.ctas { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 8px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 18px; border-radius: 16px; font: 700 15px 'Plus Jakarta Sans', sans-serif; text-decoration: none; border: 1px solid var(--borde); background: var(--tarjeta); }
.btn.r { background: var(--rojo); border-color: var(--rojo); }
.btn.w { color: #25D366; border-color: rgba(37,211,102,.4); }
h2 { font: 800 24px/1.2 'Plus Jakarta Sans', sans-serif; margin: 38px 0 14px; }
.nota, .hora { color: var(--tenue); font-size: 14px; margin: -6px 0 12px; }
.hora { color: var(--oro); font-weight: 600; margin: 18px 0 0; font-size: 15px; }
.lista { list-style: none; padding: 0; background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 22px; padding: 6px 18px; }
.lista li { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.06); } .lista li:last-child { border: 0; }
.l { display: flex; align-items: baseline; gap: 10px; }
.l h3 { font: 700 16px/1.3 'Plus Jakarta Sans', sans-serif; flex: 1; }
.pr { font: 800 17px 'Plus Jakarta Sans', sans-serif; color: var(--oro); white-space: nowrap; }
.lista p, .dest p { color: var(--suave); font-size: 14px; opacity: .85; margin-top: 2px; }
.dest { list-style: none; padding: 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.dest li { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 22px; overflow: hidden; }
.dest img, .gal img { width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
.dest .t { padding: 14px 16px 16px; }
.gal { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); } .gal img { border-radius: 18px; border: 1px solid var(--borde); }
.precio-grande { margin: 26px 0 0; } .precio-grande span { font: 800 64px/1 'Plus Jakarta Sans', sans-serif; color: var(--oro); } .precio-grande small { display: block; color: var(--suave); margin-top: 6px; }
.info { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.info div { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 22px; padding: 16px 18px; }
.info b { display: block; font: 700 13px 'Plus Jakarta Sans', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--oro); margin-bottom: 4px; }
details { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 18px; padding: 14px 18px; margin-bottom: 10px; }
summary { cursor: pointer; font: 700 16px 'Plus Jakarta Sans', sans-serif; } details p { color: var(--suave); margin-top: 8px; }
.otras { display: flex; flex-wrap: wrap; gap: 10px; }
footer { text-align: center; color: var(--tenue); font-size: 13px; padding: 26px 16px; border-top: 1px solid rgba(255,255,255,.06); }
footer a { color: var(--oro); }
.barra { position: fixed; left: 0; right: 0; bottom: 0; z-index: 9; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 6px 8px calc(6px + env(safe-area-inset-bottom)); background: rgba(13,11,10,.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid var(--borde); }
.barra a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px 0; border-radius: 16px; text-decoration: none; font: 700 11px 'Plus Jakarta Sans', sans-serif; }
.barra a span { font-size: 19px; line-height: 1; }
.barra .r { background: var(--rojo); } .barra .w { color: #25D366; } .barra .t { color: var(--oro); }
@media (min-width: 1024px) { .barra { display: none; } body { padding-bottom: 0; } }
</style>
</head>
<body>
<div class="tri"><i></i><i></i><i></i></div>
<header class="cab">
<a class="marca" href="/"><img src="/apple-touch-icon.png" alt="" width="42" height="42"><span>La Guaira<small>Bar Restaurante · Colmenar Viejo</small></span></a>
<a class="ver" href="/carta">Ver la carta →</a>
</header>
<main>
<div class="hero"><img src="${p.hero[0]}" alt="${esc(p.hero[1])}" width="960" height="720" fetchpriority="high"><div class="txt"><p class="kicker">${esc(p.kicker)}</p><h1>${p.h1}</h1></div></div>
<p class="intro">${p.intro}</p>
<div class="ctas">
<a class="btn r" href="/#reservas">🍽️ Reservar mesa</a>
<a class="btn w" href="${WA}" target="_blank" rel="noopener noreferrer">💬 WhatsApp 643 12 88 08</a>
<a class="btn" href="tel:+34919472027">📞 919 47 20 27</a>
</div>
${p.cuerpo()}
<h2>Dónde estamos</h2>
<div class="info">
<div><b>Dirección</b>Avenida de América, 9<br>28770 Colmenar Viejo (Madrid)<br><a href="${MAPS}" target="_blank" rel="noopener noreferrer">Cómo llegar →</a></div>
<div><b>Horario</b>Lunes a viernes: 8:00 – 23:00<br>Sábados y domingos: 9:00 – 0:00</div>
<div><b>Opiniones</b>5,0 ★ en Google<br><a href="${RESENAS}" target="_blank" rel="noopener noreferrer">Ver opiniones →</a></div>
</div>
<h2>Preguntas frecuentes</h2>
${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
<h2>También te puede interesar</h2>
<div class="otras">${otras.map(o => `<a class="btn" href="/${o.archivo}">${esc(o.kicker)}</a>`).join('')}<a class="btn" href="/carta">Carta completa</a><a class="btn" href="/">Inicio</a></div>
</main>
<footer>La Guaira Bar Restaurante · Av. de América, 9 · Colmenar Viejo · <a href="tel:+34919472027">919 47 20 27</a> · <a href="https://www.instagram.com/laguairabar.colmenar/" target="_blank" rel="noopener noreferrer">@laguairabar.colmenar</a></footer>
<nav class="barra" aria-label="Acciones rápidas">
<a class="r" href="/#reservas"><span>🍽️</span>Reservar</a>
<a class="w" href="${WA}" target="_blank" rel="noopener noreferrer"><span>💬</span>WhatsApp</a>
<a class="t" href="tel:+34919472027"><span>📞</span>Llamar</a>
<a href="${MAPS}" target="_blank" rel="noopener noreferrer"><span>📍</span>Cómo llegar</a>
</nav>
</body>
</html>
`;
};

for (const p of paginas) fs.writeFileSync(path.join(root, p.archivo + '.html'), usarWebp(pagina(p)));
console.log('Páginas generadas:', paginas.map(p => '/' + p.archivo).join(' '));
module.exports = { paginas };
