(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Menu mobile
  const burger = $('.burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', menu.classList.toggle('open'));
  });

  // Concerts (liste issue de data/concerts.json, intégrée au build)
  const concerts = JSON.parse($('#concerts').textContent);
  const day = s => new Date(s + 'T00:00:00');
  const fr = s => day(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  // Fichier .ics pour ajouter un concert à son agenda
  const ics = c => {
    const p = s => s.replace(/-/g, '');
    const end = day(c.date); end.setDate(end.getDate() + 1);
    const e = end.getFullYear() + String(end.getMonth() + 1).padStart(2, '0') + String(end.getDate()).padStart(2, '0');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ziard Breakers//FR', 'BEGIN:VEVENT',
      `UID:${p(c.date)}-${encodeURIComponent(c.lieu)}@ziardbreakers`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${p(c.date)}`, `DTEND;VALUE=DATE:${e}`,
      `SUMMARY:Ziard Breakers – ${c.lieu}`, `LOCATION:${c.lieu}\\, ${c.ville}`, 'END:VEVENT', 'END:VCALENDAR'];
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  };
  const agenda = c => `<a class="ics" href="${ics(c)}" download="ziard-breakers-${c.date}.ics">Ajouter à l'agenda</a>`;

  // Boîte « Prochain concert »
  const next = concerts.find(c => day(c.date) >= today);
  $$('[data-next-show]').forEach(box => {
    box.innerHTML = next
      ? `<h2>Prochain concert</h2><p class="big-date">${fr(next.date)}</p>
         <p class="venue">${esc(next.lieu)}</p><p>${esc(next.ville)}</p>
         ${next.url ? `<a class="btn light" href="${esc(next.url)}">Infos et billetterie</a>` : ''}
         ${agenda(next)}`
      : `<h2>Prochain concert</h2><p>Aucune date à venir pour le moment. Reste connecté.</p>`;
  });

  // Liste complète : dates passées grisées, prochaine date repérée
  let found = false;
  $$('.shows li').forEach((li, i) => {
    const c = concerts[i];
    if (day(c.date) < today) { li.classList.add('past'); return; }
    if (!found) { li.classList.add('next'); found = true; }
    li.insertAdjacentHTML('beforeend', agenda(c));
  });
})();
