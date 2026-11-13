// Assemble les pages dans docs/ : node build.js
const fs = require('fs');
const OUT = 'docs', SRC = 'src';
const layout = fs.readFileSync(`${SRC}/layout.html`, 'utf8');

const concerts = JSON.parse(fs.readFileSync('data/concerts.json', 'utf8'))
  .sort((a, b) => a.date.localeCompare(b.date));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const today = new Date().toISOString().split('T')[0];

const list = concerts.map((c, index) => {
  const isPast = c.date < today;
  // On applique l'inversion visuelle à toute la liste pour un tri décroissant global
  const flexOrder = 1000 - index;
  const pastClass = isPast ? ' class="past"' : '';
  
  return `<li style="order: ${flexOrder}" data-date="${c.date}"${pastClass}><time datetime="${c.date}">${fmt(c.date)}</time>` +
  `<span class="where"><strong>${esc(c.ville)}</strong> ${esc(c.lieu)}</span></li>`;
}).join('\n');

const json = JSON.stringify(concerts).replace(/</g, '\\u003c');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
fs.cpSync('assets', `${OUT}/assets`, { recursive: true });

for (const f of fs.readdirSync(`${SRC}/pages`)) {
  const src = fs.readFileSync(`${SRC}/pages/${f}`, 'utf8');
  const m = src.match(/^<!--\s*title:\s*(.*?)\s*\|\s*description:\s*(.*?)\s*-->/);
  const [title, desc] = m ? [m[1], m[2]] : [f, ''];
  const content = src.replace(/^<!--.*?-->/, '').replace('{{concerts}}', () => list);
  const html = layout
    .replace('{{fulltitle}}', f === 'index.html' ? 'Ziard Breakers – Punk rock à Lille' : `${title} – Ziard Breakers`)
    .replace('{{description}}', esc(desc))
    .replace('{{page}}', f.replace('.html', ''))
    .replace(`href="${f}"`, `href="${f}" aria-current="page"`)
    .replace('{{json}}', () => json)
    .replace('{{content}}', () => content);
  fs.writeFileSync(`${OUT}/${f}`, html);
}
console.log('Site généré dans docs/');