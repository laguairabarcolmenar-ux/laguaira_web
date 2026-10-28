// Regenera las pestañas de la carta y los paneles de "carta completa" de code.html a partir de carta.json.
// Uso: node scripts/generar-carta.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const carta = JSON.parse(fs.readFileSync(path.join(root, 'carta.json'), 'utf8'));
const htmlFile = path.join(root, 'code.html');
let html = fs.readFileSync(htmlFile, 'utf8');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TAB_ACTIVE = 'menu-tab-btn active-tab bg-[#FFD700] text-[#241A00] font-label-md text-label-md font-bold px-space-md py-2.5 rounded-xl transition-all shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.35)] hover:scale-105';
const TAB = 'menu-tab-btn bg-[#1C1815] text-[#E8DFD8] hover:text-[#FFFDF5] hover:border-[#FFD700]/50 border border-white/5 font-label-md text-label-md font-semibold px-space-md py-2.5 rounded-xl transition-all shrink-0 hover:scale-105';

const pestanas = carta.pestanas.map((p, i) => `<button class="${i === 0 ? TAB_ACTIVE : TAB}" data-filter="${esc(p.id)}" type="button">
        ${esc(p.label)}
      </button>`).join('\n');

const fila = p => `<li class="flex items-baseline gap-2 py-2.5 border-b border-white/5 last:border-0">
<div class="min-w-0">
<p class="font-label-lg text-label-lg text-[#FFFDF5] font-bold">${esc(p.nombre)}</p>${p.detalle ? `
<p class="font-body-sm text-body-sm text-[#E8DFD8]/80 mt-0.5">${esc(p.detalle)}</p>` : ''}
</div>
<span class="flex-1 min-w-[1rem] border-b border-dotted border-white/20" aria-hidden="true"></span>
<span class="font-title-md text-title-md text-[#FFD700] font-extrabold whitespace-nowrap">${esc(p.precio)}</span>
</li>`;

const panel = c => `<!-- Panel carta: ${esc(c.titulo)} -->
<div class="dish-item fx-card bg-[#1C1815] p-space-lg rounded-[28px] shadow-xl flex flex-col warm-card-glow border border-[#FFD700]/20" data-category="${esc(c.categoria)}" style="background: linear-gradient(160deg, #1C1815 0%, #14110F 100%);">
<div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-xs">
<h3 class="font-headline-sm text-headline-sm text-[#FFFDF5] font-bold flex items-center gap-2"><span aria-hidden="true">${c.emoji}</span> ${esc(c.titulo)}</h3>${c.nota ? `
<span class="font-label-sm text-label-sm font-bold px-3 py-1 rounded-full bg-[#0D0B0A]/70 border border-white/10 text-[#FFD700]">${esc(c.nota)}</span>` : ''}
</div>
<ul class="flex flex-col">
${c.platos.map(fila).join('\n')}
</ul>
</div>`;

const paneles = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start" id="carta-completa">
${carta.paneles.map(panel).join('\n')}
</div>`;

function between(start, end, content) {
  const a = html.indexOf(start), b = html.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`No encuentro los marcadores ${start} / ${end} en code.html`);
  html = html.slice(0, a + start.length) + '\n' + content + '\n' + html.slice(b);
}
between('<!-- PESTAÑAS:INICIO -->', '<!-- PESTAÑAS:FIN -->', pestanas);
between('<!-- CARTA-COMPLETA:INICIO -->', '<!-- CARTA-COMPLETA:FIN -->', paneles);

const NL = html.includes('\r\n') ? '\r\n' : '\n';
fs.writeFileSync(htmlFile, html.replace(/\r?\n/g, NL));
const total = carta.paneles.reduce((n, c) => n + c.platos.length, 0);
console.log(`Carta generada: ${carta.pestanas.length} pestañas, ${carta.paneles.length} paneles, ${total} platos.`);
