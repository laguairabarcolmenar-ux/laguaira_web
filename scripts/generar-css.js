// Genera css/estilos.css con solo las clases de Tailwind que usa code.html (antes se generaban en el navegador de cada visitante).
// Uso: node scripts/generar-css.js   (requiere una vez: cd tools && npm install)
const { execFileSync } = require('child_process');
const path = require('path'), fs = require('fs');
const tools = path.join(__dirname, '..', 'tools');
const cli = path.join(tools, 'node_modules', 'tailwindcss', 'lib', 'cli.js');
if (!fs.existsSync(cli)) { console.warn('Aviso: falta tools/node_modules (cd tools && npm install). css/estilos.css NO se ha regenerado.'); return; }
execFileSync(process.execPath, [cli, '-c', 'tailwind.config.js', '-i', 'entrada.css', '-o', '../css/estilos.css', '--minify'], { cwd: tools, stdio: 'inherit' });
console.log('css/estilos.css generado:', fs.statSync(path.join(tools, '..', 'css', 'estilos.css')).size, 'bytes');
