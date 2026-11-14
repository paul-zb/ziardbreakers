// Assemble les pages dans docs/ : node build.js
const fs = require('fs');
const OUT = 'docs', SRC = 'src';
const layout = fs.readFileSync(`${SRC}/layout.html`, 'utf8');
const concerts = JSON.parse(fs.readFileSync('data/concerts.json', 'utf8'))
  .sort((a, b) => a.date.localeCompare(b.date));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const list = concerts.map(c =>
  `<li data-date="${c.date}"><time datetime="${c.date}">${fmt(c.date)}</time>` +
  `<span class="where"><strong>${esc(c.ville)}</strong> ${esc(c.lieu)}</span></li>`).join('\n');
const json = JSON.stringify(concerts).replace(/</g, '\\u003c');

// Parutions presse : data/presse.json (les plus récentes d'abord)
const presse = JSON.parse(fs.readFileSync('data/presse.json', 'utf8'))
  .sort((a, b) => b.date.localeCompare(a.date));
const safeUrl = u => /^https?:\/\//.test(u) ? u : '#';
const card = p =>
  `<li><a class="news-card" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">` +
  `<span class="news-meta"><time datetime="${p.date}">${fmt(p.date)}</time> · ${esc(p.source)}</span>` +
  `<span class="news-title">${esc(p.titre)}</span>` +
  (p.resume ? `<span class="news-sum">${esc(p.resume)}</span>` : '') +
  `</a></li>`;
const pressHome = presse.slice(0, 3).map(card).join('\n');
const pressAll = presse.map(card).join('\n');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
fs.cpSync('assets', `${OUT}/assets`, { recursive: true });

for (const f of fs.readdirSync(`${SRC}/pages`)) {
  const src = fs.readFileSync(`${SRC}/pages/${f}`, 'utf8');
  const m = src.match(/^<!--\s*title:\s*(.*?)\s*\|\s*description:\s*(.*?)\s*-->/);
  const [title, desc] = m ? [m[1], m[2]] : [f, ''];
  const content = src.replace(/^<!--.*?-->/, '')
    .replace('{{concerts}}', () => list)
    .replace('{{presse}}', () => pressHome)
    .replace('{{presse_all}}', () => pressAll);
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