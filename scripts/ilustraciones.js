// Ilustraciones doradas (SVG) para cada apartado de la carta en PDF.
// Todas comparten estilo: trazo dorado degradado sobre fondo negro, rellenos suaves.
const defs = `<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".5" stop-color="#F2C14E"/><stop offset="1" stop-color="#B8862B"/></linearGradient>
  <radialGradient id="halo" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#F2C14E" stop-opacity=".22"/><stop offset="1" stop-color="#F2C14E" stop-opacity="0"/></radialGradient>
</defs>`;
const S = 'fill="none" stroke="url(#g)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="#F2C14E" fill-opacity=".13"';
const D = 'fill="url(#g)" stroke="none"';
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">${defs}<ellipse cx="60" cy="56" rx="58" ry="44" fill="url(#halo)"/><g ${S}>${body}</g></svg>`;
const plato = (cy = 84, rx = 46) => `<ellipse cx="60" cy="${cy}" rx="${rx}" ry="${Math.round(rx / 5.5)}"/><ellipse cx="60" cy="${cy}" rx="${rx - 9}" ry="${Math.round(rx / 7.5)}" stroke-width="1.2" opacity=".6"/>`;

const ilustraciones = {
  hamburguesas: svg(`
    <path d="M20 46 Q20 16 60 16 Q100 16 100 46 Z" ${F}/>
    <g ${D}><ellipse cx="44" cy="30" rx="2.4" ry="1.3"/><ellipse cx="60" cy="25" rx="2.4" ry="1.3"/><ellipse cx="76" cy="30" rx="2.4" ry="1.3"/><ellipse cx="52" cy="37" rx="2.4" ry="1.3"/><ellipse cx="68" cy="37" rx="2.4" ry="1.3"/></g>
    <path d="M16 51 q6 6 11 0 q6 6 11 0 q6 6 11 0 q6 6 11 0 q6 6 11 0 q6 6 11 0 q6 6 11 0 q6 6 11 0"/>
    <path d="M22 58 L98 58 L92 64 L84 59 L76 67 L68 59 L52 59 L44 66 L38 59 Z" ${F}/>
    <rect x="18" y="62" width="84" height="11" rx="5.5" ${F}/>
    <path d="M20 78 L100 78 Q100 90 88 90 L32 90 Q20 90 20 78 Z" ${F}/>`),

  'bebidas:Jugos naturales': svg(`
    <path d="M24 28 L30 90 L52 90 L58 28 Z" ${F}/><path d="M26 44 L56 44"/>
    <path d="M47 28 L56 8 L64 8"/>
    <g ${D} opacity=".7"><circle cx="38" cy="58" r="1.6"/><circle cx="44" cy="70" r="1.3"/><circle cx="36" cy="78" r="1.2"/></g>
    <path d="M64 40 L69 90 L89 90 L94 40 Z" ${F}/><path d="M65 52 L93 52"/>
    <circle cx="94" cy="38" r="11" ${F}/><circle cx="94" cy="38" r="7.5" stroke-width="1.2"/>
    <path d="M94 31 V45 M87 38 H101 M89 33 L99 43 M99 33 L89 43" stroke-width="1"/>`),

  'bebidas:Batidos': svg(`
    <path d="M38 42 L45 90 L75 90 L82 42 Z" ${F}/>
    <path d="M36 42 Q33 31 45 30 Q46 19 60 21 Q74 19 75 30 Q87 31 84 42 Z" ${F}/>
    <path d="M60 21 Q60 14 64 11"/><circle cx="60" cy="16" r="5" ${D}/>
    <path d="M70 26 L84 4"/><path d="M41 58 L79 58 M43 72 L77 72" stroke-width="1.2" opacity=".6"/>
    <circle cx="98" cy="80" r="11" ${F}/><circle cx="98" cy="80" r="6.5" stroke-width="1.2"/>
    <circle cx="22" cy="82" r="8" ${F}/><circle cx="22" cy="82" r="4.5" stroke-width="1.2"/>`),

  'bebidas:Refrescos, zumos y agua': svg(`
    <path d="M30 92 L30 52 Q30 42 36 36 L36 18 L46 18 L46 36 Q52 42 52 52 L52 92 Z" ${F}/>
    <rect x="35" y="11" width="12" height="7" rx="1.5"/><rect x="30" y="58" width="22" height="18" rx="2" stroke-width="1.4"/>
    <path d="M58 92 L58 56 Q58 46 63 41 L63 24 L71 24 L71 41 Q76 46 76 56 L76 92 Z" ${F}/>
    <rect x="62" y="18" width="10" height="6" rx="1.5"/><path d="M58 64 Q67 60 76 64 M58 74 Q67 70 76 74" stroke-width="1.4"/>
    <path d="M82 52 L86 92 L102 92 L106 52 Z" ${F}/><rect x="87" y="60" width="7" height="7" rx="1.5" stroke-width="1.2"/><rect x="94" y="70" width="7" height="7" rx="1.5" stroke-width="1.2"/>`),

  'bebidas:Cafés': svg(`
    <ellipse cx="60" cy="86" rx="42" ry="7" ${F}/>
    <path d="M30 50 L35 76 Q37 82 45 82 L75 82 Q83 82 85 76 L90 50 Z" ${F}/>
    <ellipse cx="60" cy="50" rx="30" ry="5.5"/>
    <path d="M56 49 q-4 -3 -1 -5 q2 -1 5 2 q3 -3 5 -2 q3 2 -1 5 l-4 3 Z" ${D} opacity=".8"/>
    <path d="M88 56 Q101 55 100 65 Q99 74 85 72"/>
    <path d="M48 40 q-5 -7 0 -13 q5 -6 0 -13 M62 40 q-5 -7 0 -13 q5 -6 0 -13 M76 40 q-5 -7 0 -13 q5 -6 0 -13" stroke-width="1.6" opacity=".75"/>`),

  postres: svg(`
    ${plato(84, 46)}
    <path d="M34 80 L43 48 L77 48 L86 80 Z" ${F}/>
    <ellipse cx="60" cy="48" rx="17" ry="4" ${D} opacity=".55"/>
    <path d="M44 52 q2 7 4 0 q2 10 4 0 M70 52 q2 8 4 0 q2 6 3 0" stroke-width="1.6"/>
    <path d="M100 30 L104 80"/><ellipse cx="99" cy="26" rx="5" ry="8" ${F}/>
    <path d="M16 64 L28 52 L38 62 L26 74 Z" ${F} stroke-width="1.6"/>`),

  desayunos: svg(`
    ${plato(80, 44)}
    <ellipse cx="46" cy="64" rx="24" ry="14" ${F}/>
    <path d="M26 62 Q46 56 66 62" stroke-width="1.6"/>
    <path d="M34 70 l4 -3 M44 72 l4 -3 M54 70 l4 -3" stroke-width="1.4" opacity=".7"/>
    <path d="M70 70 Q66 52 80 48 Q96 46 96 62 Q96 76 82 76 Q72 76 70 70 Z" ${F}/>
    <circle cx="83" cy="62" r="6" ${D} opacity=".5"/>
    <path d="M78 30 L80 44 Q81 47 85 47 L95 47 Q99 47 100 44 L102 30 Z" ${F}/><path d="M101 33 Q108 33 107 38 Q106 42 100 41"/>
    <path d="M86 24 q-3 -4 0 -8 M94 24 q-3 -4 0 -8" stroke-width="1.4" opacity=".7"/>`),

  tequenos: svg(`
    ${plato(84, 46)}
    <g transform="rotate(-14 50 60)"><rect x="22" y="40" width="56" height="11" rx="5.5" ${F}/><path d="M30 40 l8 11 M42 40 l8 11 M54 40 l8 11 M66 40 l8 11" stroke-width="1.2" opacity=".7"/></g>
    <g transform="rotate(-6 50 66)"><rect x="18" y="56" width="58" height="11" rx="5.5" ${F}/><path d="M26 56 l8 11 M38 56 l8 11 M50 56 l8 11 M62 56 l8 11" stroke-width="1.2" opacity=".7"/></g>
    <g transform="rotate(4 50 74)"><rect x="22" y="70" width="54" height="11" rx="5.5" ${F}/><path d="M30 70 l8 11 M42 70 l8 11 M54 70 l8 11" stroke-width="1.2" opacity=".7"/></g>
    <ellipse cx="94" cy="66" rx="13" ry="5"/><path d="M81 66 Q82 80 94 80 Q106 80 107 66" ${F}/>`),

  empanadas: svg(`
    ${plato(84, 46)}
    <path d="M18 76 A30 30 0 0 1 78 76 Z" ${F}/>
    <path d="M22 72 l-3 2 M26 62 l-3 -1 M33 54 l-2 -3 M43 49 l-1 -3 M53 48 l1 -3 M63 51 l2 -3 M71 58 l3 -2 M75 67 l3 -1" stroke-width="1.6"/>
    <path d="M58 78 A26 26 0 0 1 108 74 Z" ${F} transform="rotate(-8 83 76)"/>
    <path d="M64 68 l-3 -1 M70 60 l-2 -3 M80 56 l0 -3 M90 57 l2 -3 M99 62 l3 -2" stroke-width="1.6"/>`),

  cachapas: svg(`
    ${plato(84, 46)}
    <path d="M36 68 L52 52 L88 60 L84 72 Z" ${D} opacity=".35"/>
    <path d="M18 76 Q30 34 66 36 Q96 38 102 74 Q60 84 18 76 Z" ${F}/>
    <g ${D} opacity=".55"><circle cx="44" cy="54" r="1.5"/><circle cx="58" cy="48" r="1.5"/><circle cx="74" cy="50" r="1.5"/><circle cx="66" cy="62" r="1.5"/><circle cx="50" cy="66" r="1.5"/><circle cx="84" cy="62" r="1.5"/></g>
    <g transform="rotate(-30 98 30)"><ellipse cx="98" cy="30" rx="7" ry="16" ${F}/><path d="M91 24 H105 M91 30 H105 M91 36 H105 M98 15 V45" stroke-width="1" opacity=".7"/></g>`),

  arepas: svg(`
    ${plato(86, 44)}
    <path d="M24 74 Q20 44 44 30 Q72 18 92 38 Q100 48 96 56 Z" ${F}/>
    <path d="M40 40 l6 -3 M56 30 l7 -1 M74 32 l6 2 M48 50 l6 -2" stroke-width="1.6" opacity=".6"/>
    <path d="M26 72 q8 -10 16 -6 q8 -12 18 -6 q8 -10 18 -6 q6 -8 14 -2" stroke-width="2"/>
    <path d="M30 70 q6 -6 12 -2 M46 66 q8 -8 16 -2 M64 62 q8 -6 14 -2" stroke-width="1.3" opacity=".7"/>
    <path d="M22 76 Q60 92 100 60 Q104 74 92 82 Q60 96 24 82 Z" ${F}/>`),

  patacones: svg(`
    ${plato(86, 46)}
    <ellipse cx="60" cy="74" rx="38" ry="9" ${F}/>
    <path d="M24 66 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 12 0"/>
    <path d="M28 62 L92 62 L88 68 L32 68 Z" ${D} opacity=".3"/>
    <ellipse cx="60" cy="52" rx="38" ry="9" ${F}/>
    <path d="M34 50 l5 3 M48 47 l5 3 M64 47 l5 3 M78 50 l5 3" stroke-width="1.2" opacity=".6"/>
    <path d="M48 42 Q60 28 76 40 Q64 46 48 42 Z" ${F}/><path d="M52 41 Q62 34 72 40" stroke-width="1.2"/>`),

  platos: svg(`
    <ellipse cx="60" cy="68" rx="52" ry="18" ${F}/><ellipse cx="60" cy="68" rx="42" ry="13" stroke-width="1.2" opacity=".6"/>
    <path d="M24 66 Q26 48 44 48 Q60 48 60 66 Z" ${F}/>
    <g ${D} opacity=".55"><circle cx="34" cy="58" r="1.2"/><circle cx="42" cy="54" r="1.2"/><circle cx="50" cy="58" r="1.2"/><circle cx="38" cy="62" r="1.2"/><circle cx="54" cy="62" r="1.2"/></g>
    <g ${D}><circle cx="66" cy="74" r="2.6"/><circle cx="72" cy="77" r="2.6"/><circle cx="60" cy="78" r="2.6"/><circle cx="68" cy="81" r="2.4"/><circle cx="76" cy="72" r="2.4"/></g>
    <path d="M66 56 q6 -4 10 0 q4 4 10 0 M68 62 q6 -4 10 0 q4 4 10 0 M64 50 q6 -4 10 0" stroke-width="1.6"/>
    <g transform="rotate(-25 92 66)"><ellipse cx="92" cy="66" rx="9" ry="4" ${F}/></g><g transform="rotate(-25 82 78)"><ellipse cx="84" cy="80" rx="9" ry="4" ${F}/></g>`),

  parrillas: svg(`
    <rect x="12" y="44" width="96" height="44" rx="8" ${F}/><path d="M108 66 H116" stroke-width="4"/>
    <path d="M20 52 Q32 44 48 50 Q60 54 56 66 Q52 78 36 78 Q18 76 20 52 Z" ${F}/>
    <path d="M26 56 L48 72 M32 52 L54 66 M24 64 L40 76" stroke-width="1.2" opacity=".7"/>
    <rect x="62" y="50" width="38" height="10" rx="5" ${F}/><path d="M70 50 v10 M80 50 v10 M90 50 v10" stroke-width="1" opacity=".6"/>
    <rect x="62" y="64" width="34" height="9" rx="4.5" ${F}/>
    <path d="M66 82 Q72 74 80 78 Q86 82 82 86" ${F}/><path d="M86 84 Q92 76 100 80 Q104 84 100 86" ${F}/>
    <path d="M30 34 q-4 -6 0 -12 q4 -6 0 -12 M60 34 q-4 -6 0 -12 q4 -6 0 -12 M90 34 q-4 -6 0 -12 q4 -6 0 -12" stroke-width="1.6" opacity=".7"/>`),

  arroces: svg(`
    <ellipse cx="60" cy="62" rx="46" ry="22" ${F}/><ellipse cx="60" cy="60" rx="39" ry="16"/>
    <path d="M14 62 L4 60 M106 62 L116 60" stroke-width="4"/>
    <path d="M36 56 Q38 46 48 50 Q50 56 44 58" ${F}/><path d="M66 50 Q70 42 78 48 Q78 54 72 54" ${F}/><path d="M52 68 Q56 60 64 64 Q64 70 58 70" ${F}/>
    <path d="M80 62 L90 58 L92 66 Z" ${F}/><path d="M28 64 L36 62 L36 70 Z" ${F}/>
    <g ${D} opacity=".5"><circle cx="58" cy="54" r="1.4"/><circle cx="46" cy="64" r="1.4"/><circle cx="74" cy="66" r="1.4"/><circle cx="62" cy="60" r="1.4"/></g>
    <path d="M84 46 L96 40 A12 12 0 0 1 98 52 Z" ${F}/>`),

  licores: svg(`
    <path d="M24 92 L24 50 Q24 42 29 38 L29 14 L37 14 L37 38 Q42 42 42 50 L42 92 Z" ${F}/>
    <rect x="28" y="9" width="10" height="5" rx="1.5"/><rect x="24" y="58" width="18" height="16" rx="2" stroke-width="1.4"/>
    <rect x="54" y="42" width="34" height="48" rx="4" ${F}/>
    <path d="M88 52 Q102 52 102 64 Q102 78 88 78"/>
    <path d="M52 44 Q50 34 58 34 Q60 28 68 30 Q74 26 80 31 Q90 30 90 40 Q90 46 86 46 L56 46 Q52 46 52 44 Z" ${F}/>
    <path d="M62 54 V82 M71 54 V82 M80 54 V82" stroke-width="1.2" opacity=".55"/>
    <g ${D} opacity=".6"><circle cx="66" cy="66" r="1.3"/><circle cx="75" cy="72" r="1.2"/><circle cx="64" cy="78" r="1.1"/></g>`),
};

module.exports = ilustraciones;
