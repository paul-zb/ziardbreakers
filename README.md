# Site Ziard Breakers

1. Copie tes images dans `assets/images/` : `arnf.jpg`, `rdv.jpg`, `t_shirt.png`.
2. Modifie tes concerts dans `data/concerts.json`.
3. Lance `node build.js` : le site complet est généré dans `docs/`.
4. Publie : Netlify (build `node build.js`, dossier `docs`) ou GitHub Pages (branche main, dossier `/docs`).

Pour modifier le menu ou le pied de page : `src/layout.html`. Pour modifier une page : `src/pages/`.
Le formulaire de contact fonctionne sur Netlify. Sur GitHub Pages, remplace l'attribut `action` du formulaire par une URL Formspree.
