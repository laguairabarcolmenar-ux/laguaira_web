// Fotos en WebP (pesan mucho menos). Los .jpg se conservan para el PDF, los flyers y las vistas previas de WhatsApp/Instagram.
//  - node scripts/webp.js        → crea img/**/*.webp a partir de cada .jpg (solo los nuevos o cambiados)
//  - require('./webp').usarWebp(html) → cambia src="img/....jpg" por .webp cuando existe la versión WebP
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
function usarWebp(html) {
  return html.replace(/(src=")(img\/[^"]+)\.jpe?g"/g, (m, a, f) => fs.existsSync(path.join(root, f + '.webp')) ? `${a}${f}.webp"` : m);
}
module.exports = { usarWebp };
if (require.main === module) (async () => {
  const sharp = require(path.join(root, 'tools', 'node_modules', 'sharp'));
  const jpgs = []; (function rec(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) rec(p); else if (/\.jpe?g$/i.test(e.name)) jpgs.push(p); } })(path.join(root, 'img'));
  let antes = 0, despues = 0;
  for (const j of jpgs) {
    const w = j.replace(/\.jpe?g$/i, '.webp');
    if (!fs.existsSync(w) || fs.statSync(w).mtimeMs < fs.statSync(j).mtimeMs)
      await sharp(j).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(w);
    antes += fs.statSync(j).size; despues += fs.statSync(w).size;
  }
  console.log(`${jpgs.length} fotos: ${(antes / 1048576).toFixed(1)} MB en JPG → ${(despues / 1048576).toFixed(1)} MB en WebP`);
})().catch(e => { console.error(e); process.exit(1); });
