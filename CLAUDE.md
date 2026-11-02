# CLAUDE.md — Portfolio Aj

## Mission

Construire le portfolio personnel d'Aj, data engineer basé à Rodez (France) qui vise un poste de Data Engineer en Suisse.
Le site présente deux choses au même niveau : des projets data/finance construits en public, et un parcours d'ultra-trail.
Cible principale : recruteurs et équipes data en Suisse. Le site doit se lire en 30 secondes et donner envie d'ouvrir un projet.

Référence de structure : https://theacademysf.com/ (hero typographique, bande de cartes projets, calendrier de saison, listes de mots défilantes). On reprend la **structure**, pas le look : l'identité visuelle est décrite dans « Design ». Jamais d'asset, de texte ou de logo de la référence.

## Règles non négociables

1. **Aucune métrique inventée.** Pas de chiffres d'utilisateurs, de gains de temps ou de volumes tant qu'Aj ne les a pas fournis. Un champ vide reste `null` et le composant gère l'absence proprement.
2. **Statut explicite sur chaque projet** : `building` (en cours), `planned` (prévu), `shipped` (livré). Jamais de projet présenté comme livré s'il ne l'est pas.
3. **Aucun nom d'employeur, de client ou de schéma interne.** Tout projet pro est anonymisé (« distributeur B2B », « data warehouse miroir »).
4. **Tout le contenu vit dans `/content`**, jamais en dur dans les composants. Ajouter un projet ou une course = éditer un fichier, sans toucher au code.
5. Les `TODO` dans `/content` sont des trous à combler par Aj : ne pas les remplir avec des suppositions. En production, ne rien rendre plutôt qu'afficher « TODO ».
6. **Aucun secret dans le repo ni dans le bundle client.** Les tokens (GitHub, etc.) ne sont lus qu'au build via variables d'environnement.

## Stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS (tokens déclarés dans la config, pas de valeurs magiques dans les composants)
- `output: 'export'` : site 100 % statique. Les données dynamiques (heatmap) sont récupérées **au build** puis figées en JSON
- Contenu : fichiers TypeScript typés dans `/content` (pas de CMS)
- i18n : FR + EN via `/content/i18n.ts`, routes `/en` et `/fr`. EN par défaut (cible Suisse), bascule visible dans le header
- Polices via `next/font/google`
- Déploiement : Vercel ou Render (static site) + GitHub Action planifiée pour le rebuild quotidien
- Tests visuels : Playwright (screenshots desktop 1440px + mobile 390px)

### Commandes

```bash
npm run dev            # serveur local (utilise /data/*.json existants)
npm run fetch:data     # récupère contributions GitHub → /data/contributions.json
npm run build          # fetch:data + build + export statique
npm run lint           # ESLint + tsc --noEmit
npm run shots          # Playwright : captures desktop/mobile dans /screenshots
```

## Structure

```
/app
  /[locale]
    page.tsx                    # one-page principale
    /projects/[slug]/page.tsx   # page détail projet
  layout.tsx
/components
  Hero.tsx
  ProjectMarquee.tsx      # bande défilante de cartes projet
  ProjectCard.tsx
  ActivityHeatmap.tsx     # heatmap générique (commits ou km)
  SeasonCalendar.tsx      # calendrier de saison sportive
  RaceList.tsx
  PursuitTicker.tsx       # listes de mots défilantes
  WebDetails.tsx          # compteur, badges 88×31, « last updated »
  Contact.tsx
  LocaleSwitch.tsx
/content
  profile.ts  projects.ts  races.ts  pursuits.ts  i18n.ts
/data
  contributions.json      # généré au build, commité en fallback
  training.json           # optionnel, voir « Heatmap course »
/scripts
  fetch-contributions.ts
/public
  /media                  # images et vidéos d'Aj uniquement
  /badges                 # badges 88×31 dessinés pour le site
```

## Contenu initial

### profile.ts

```ts
export const profile = {
  name: "Aj",
  role: { en: "Data Engineer", fr: "Data Engineer" },
  location: "France → Suisse",
  headline: {
    en: "I build data systems and run very long distances.",
    fr: "Je construis des systèmes de données et je cours très longtemps.",
  },
  stack: ["SQL", "MariaDB", "Python", "Power BI", "DAX", "React", "Pandas", "Git", "Sklearn", "TensofFlow"],
  links: { github: "[TODO](https://github.com/0x3CE)", linkedin: "[TODO](https://www.linkedin.com/in/antoine-junot/)", email: "antoine.junotpro@pm.me" },
  githubUsername: "0x3CE",
};
```

Le headline est une proposition : Aj peut le remplacer.

### projects.ts

```ts
type Status = "building" | "planned" | "shipped";

export const projects = [
  { slug: "investment-thesis", title: "Investment Thesis Builder", status: "building",
    oneLiner: { en: "TODO", fr: "TODO" }, stack: [], metrics: null, repo: null, demo: null },
  { slug: "budget-plus", title: "Budget+ Finance", status: "planned",
    oneLiner: { en: "TODO", fr: "TODO" }, stack: [], metrics: null, repo: null, demo: null },
  { slug: "data-analysis", title: "Data Analysis", status: "planned",
    oneLiner: { en: "TODO", fr: "TODO" }, stack: [], metrics: null, repo: null, demo: null },
] satisfies Project[];
```

Format du `oneLiner` : un verbe + un résultat concret, une seule ligne. Tant qu'il n'y a pas de résultat, décrire ce que le projet fait, sans chiffre.
Si `repo` est renseigné, la carte projet affiche une mini-heatmap des 12 dernières semaines de ce repo.

### races.ts

```ts
export const races = [
  { name: "Grand Trail des Templiers", distanceKm: 100, elevationM: null, date: "TODO", time: null, rank: null, status: "finished" },
  { name: "Menton–Nice", distanceKm: 50, elevationM: null, date: "TODO", time: null, rank: null, status: "finished" },
  { name: "Backyard Ultra (TODO nom)", distanceKm: null, elevationM: null, date: "2027-02", time: null, rank: null, status: "upcoming" },
  // TODO : autres courses d'Aj
];
```

La backyard est `upcoming` : elle apparaît dans le calendrier comme objectif, avec son bloc d'entraînement (pic 155 km/semaine, deux simulations) en texte d'accompagnement.

### pursuits.ts

```ts
export const pursuits = {
  en: [
    ["Model a data warehouse", "Ship a finance app", "Write an investment thesis", "Automate a pipeline"],
    ["Run a backyard ultra", "Dive the Red Sea", "Train through winter", "Move to Switzerland"],
  ],
  fr: [ /* traduction équivalente */ ],
};
```

## Heatmap d'activité

### Commits GitHub

- Source : API GraphQL GitHub, `user(login) { contributionsCollection(from, to) { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } }` sur les 365 derniers jours.
- `scripts/fetch-contributions.ts` lit `GITHUB_TOKEN` (fine-grained, lecture seule, aucun scope repo nécessaire pour le calendrier public) et écrit `/data/contributions.json`.
- Si le token est absent ou l'API échoue : le build **ne casse pas**, il garde le dernier JSON commité et log un warning.
- Rebuild quotidien via `.github/workflows/rebuild.yml` (cron `0 5 * * *`) qui déclenche le deploy hook de l'hébergeur.
- Les contributions privées ne comptent que si Aj active « Private contributions » dans son profil GitHub. Ne pas contourner.

### Heatmap course (optionnelle, activée quand `/data/training.json` existe)

- Même composant, autre jeu de données : km courus par jour.
- Source à définir par Aj (export Strava/Garmin en CSV → script de conversion). Ne rien générer tant que le fichier n'existe pas.
- Affichée dans la section sport, sous la heatmap de commits : les deux grilles alignées sur les mêmes semaines. C'est l'élément signature du site : code et kilomètres sur la même année.

### Composant `ActivityHeatmap`

- Props : `days: { date: string; value: number }[]`, `unit: "commits" | "km"`, `palette: "code" | "run"`.
- Grille SVG 53 colonnes × 7 lignes, cases 11px, écart 3px, coins arrondis 2px.
- 5 niveaux calculés par quantiles sur les jours non nuls (pas de seuils fixes).
- Palette `code` : papier → moutarde → teck. Palette `run` : papier → olive → sarcelle. Pas de vert GitHub.
- Tooltip au survol et au focus clavier : « 12 commits le 3 mars 2026 ». Chaque case est focusable dans un conteneur à `role="grid"` avec navigation aux flèches.
- Mobile : les 26 dernières semaines seulement, scroll horizontal pour le reste.
- Légende « moins / plus » sous la grille + total de l'année.

## Design

### Direction : mid-century modern × web personnel des années 2000, exécuté proprement

Base mid-century : papier chaud, couleurs de teck, moutarde, olive et sarcelle, formes organiques (boomerang, starburst atomique, pastilles), typographie ronde et généreuse.
Couche web 2000, **dosée** : des détails, jamais un pastiche. Le site reste moderne dans sa grille, sa lisibilité et ses performances.

Détails web 2000 autorisés (et seulement ceux-là) :
- Compteur de visites style odomètre dans le footer (compteur statique « depuis 2026 » ou compteur réel via un service sans cookie, au choix d'Aj — par défaut : pas de vrai compteur, afficher « last updated » en pixel font)
- Rangée de badges 88×31 dessinés pour le site (« made with SQL », « powered by coffee », « 100k finisher »), en footer
- Boutons légèrement biseautés (bordure claire en haut-gauche, sombre en bas-droite) pour les CTA uniquement
- Pixel font pour les micro-informations (date de mise à jour, compteur, statut de projet)
- Une vraie `<marquee>`-like pour la bande de projets et les pursuits (implémentée en CSS, pas la balise)
- Curseur par défaut : ne pas changer

Interdits : GIF « under construction », fonds étoilés, texte arc-en-ciel, Comic Sans, pop-ups, musique.

### Tokens couleur

| Nom | Hex | Rôle |
|---|---|---|
| paper | `#F1E8D6` | fond principal |
| ink | `#231C15` | texte |
| teak | `#8C4A26` | titres de section, niveau max heatmap code |
| mustard | `#D9A320` | accent principal : CTA, statut `building`, mois actif |
| olive | `#6E7B3B` | sport, heatmap course |
| teal | `#2E6A68` | liens, niveau max heatmap course |
| tomato | `#D8452B` | usage ponctuel : starburst du hero, badge « upcoming » |

Contraste AA vérifié pour chaque couple texte/fond utilisé. Si moutarde sur papier ne passe pas pour du texte, la moutarde reste réservée aux fonds et aplats.

### Typographie

- Titrage : **Fraunces** avec axes `SOFT 100`, `WONK 1`, graisse 600–800 → rondeur mid-century
- Corps : **Instrument Sans** 400/500, 17–18px, interligne 1.55
- Micro-infos web 2000 : **Silkscreen**, 10–12px, jamais pour plus de 4 mots
- Échelle : hero `clamp(3rem, 9vw, 8rem)`, sections `clamp(2rem, 4vw, 3.5rem)`
- Casse normale partout, pas de labels en capitales, pas de flèches ajoutées aux liens

### Formes et mise en page

- Grille 12 colonnes, alignement à gauche, marges larges
- Un starburst atomique (SVG, tomato) accroché au hero, qui tourne très lentement ; c'est le seul élément animé en continu hors bandes défilantes
- Cartes projets : formes pilules / boomerang pour les visuels sans image, bordure 2px ink, pas d'ombre douce
- Séparateurs de section : une ligne ondulée ou une rangée de pastilles, pas de filets fins
- Texture de grain très légère sur le papier (SVG noise, opacité ≤ 4 %)

### Ordre des sections

1. Hero — headline énorme + starburst + CTA « See projects »
2. Projets — bande défilante de cartes
3. Activité — heatmap commits (+ heatmap km si données)
4. Saison — calendrier 12 mois : courses passées, bloc d'entraînement, backyard février 2027
5. Stack — liste simple, pas de barres de compétences
6. Pursuits — deux listes de mots défilantes en sens inverse
7. Contact + footer web 2000 (badges, last updated, lien RSS vers les notes de projet si elles existent)

### Mouvement

- Un seul moment orchestré : apparition du hero au chargement
- Bandes défilantes en pause au survol ; starburst en rotation lente
- `prefers-reduced-motion` : tout s'arrête, les bandes deviennent statiques
- Pas d'animation d'entrée sur chaque section

### Accessibilité et responsive

- Mobile d'abord. La bande de projets devient un carrousel à swipe
- Focus clavier visible (outline teal 2px, offset 2px)
- Vidéos : `muted`, `playsInline`, `loop`, avec poster

## Façon de travailler

1. Avant de coder une section, écrire en 5 lignes max ce qu'elle doit faire et la valider contre ce fichier.
2. Commencer par une page `/styleguide` (couleurs, typo, boutons biseautés, badges, heatmap avec données factices **marquées comme factices**) et la faire valider par Aj avant de construire les sections.
3. Puis section par section dans l'ordre ci-dessus.
4. Après chaque section : `npm run lint`, `npm run shots`, relire les captures desktop et mobile.
5. Pas de dépendance ajoutée sans justification dans le commit.
6. Commits conventionnels (`feat:`, `fix:`, `content:`, `style:`, `data:`).
7. En cas de doute sur un contenu, poser la question plutôt que d'inventer.

## Définition de « terminé »

- [ ] Build statique sans erreur ni warning TypeScript, y compris sans `GITHUB_TOKEN`
- [ ] Heatmap alimentée par de vraies données, rebuild quotidien opérationnel
- [ ] Lighthouse ≥ 95 en performance, accessibilité, SEO
- [ ] Rendu vérifié à 390px et 1440px
- [ ] FR et EN complets, aucun `TODO` visible en production
- [ ] Ajouter un projet ou une course = modifier uniquement `/content`
- [ ] `/styleguide` retiré du build de production
- [ ] Aucun asset, texte ou logo copié de la référence