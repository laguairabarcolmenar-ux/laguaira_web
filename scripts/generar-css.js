// Genera css/estilos.css con solo las clases de Tailwind que usa code.html (antes se generaban en el navegador de cada visitante).
// Uso: node scripts/generar-css.js   (requiere una vez: cd tools && npm install)
const { execFileSync } = require('child_process');
const path = require('path'), fs = require('fs');
const tools = path.join(__dirname, '..', 'tools');
const cli = path.join(tools, 'node_modules', 'tailwindcss', 'lib', 'cli.js');
if (!fs.existsSync(cli)) { console.warn('Aviso: falta tools/node_modules (cd tools && npm install). css/estilos.css NO se ha regenerado.'); return; }
execFileSync(process.execPath, [cli, '-c', 'tailwind.config.js', '-i', 'entrada.css', '-o', '../css/estilos.css', '--minify'], { cwd: tools, stdio: 'inherit' });
console.log('css/estilos.css generado:', fs.statSync(path.join(tools, '..', 'css', 'estilos.css')).size, 'bytes');

// Iconos: en vez de descargar la fuente completa de Material Symbols (~5 MB), se pide solo con los iconos que usa code.html (~10 KB).
// Si añades un icono nuevo en code.html, basta con volver a ejecutar este script (o generar-carta.js).
{
  const f = path.join(tools, '..', 'code.html');
  let h = fs.readFileSync(f, 'utf8');
  const iconos = new Set(['check']); // 'check' también lo pone el JS del botón "Pedir"
  for (const m of h.matchAll(/material-symbols-outlined[^"]*"[^>]*>\s*([a-z0-9_]+)\s*</g)) iconos.add(m[1]);
  const link = `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&amp;icon_names=${[...iconos].sort().join(',')}&amp;display=block" rel="stylesheet"/>`;
  const re = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined[^"]*" rel="stylesheet"\/>/g;
  const n = (h.match(re) || []).length;
  if (n) { let primero = true; h = h.replace(re, () => primero ? (primero = false, link) : ''); fs.writeFileSync(f, h); }
  console.log(`Iconos: ${iconos.size} (${n} enlace(s) de fuente sustituidos por uno solo)`);
}
