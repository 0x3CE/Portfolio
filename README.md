# Portfolio Aj

Site statique (Next.js App Router, `output: 'export'`). Toutes les règles de contenu,
de design et de méthode sont dans [CLAUDE.md](CLAUDE.md).

## Commandes

```bash
npm run dev                          # serveur local
npm run fetch:data                   # contributions GitHub → data/contributions.json
npm run build                        # fetch:data + build + export dans out/
INCLUDE_STYLEGUIDE=1 npm run build   # idem, avec /styleguide pour la revue
npm run lint                         # ESLint + tsc --noEmit
npm run shots                        # Playwright : captures 1440px et 390px dans screenshots/
npm run import:strava -- <csv>       # export Strava -> data/training.json
```

`/styleguide` (`app/styleguide/page.dev.tsx`) n'est compilé qu'en `npm run dev` ou avec
`INCLUDE_STYLEGUIDE=1` : il n'existe dans aucun build de production, où qu'il soit déployé.

## Variables d'environnement

Le build n'en exige aucune : sans token, `fetch:data` log un warning et garde
`data/contributions.json` tel qu'il est commité.

| Variable | Rôle |
|---|---|
| `GITHUB_TOKEN` | Token fine-grained, lecture seule. Aucun scope repo n'est nécessaire pour le calendrier public. Lu au build uniquement, jamais exposé au client. Alimente la heatmap **et** les mini-heatmaps des cartes projet. |
| `GITHUB_USERNAME` | Optionnel, surcharge le `githubUsername` de `content/profile.ts`. |
| `DEPLOY_HOOK_URL` | Secret GitHub Actions : l'URL du deploy hook de l'hébergeur, appelée chaque jour à 5h UTC. |

## À remplir par Aj

Tout se passe dans `/content` — aucun composant à toucher.

- `profile.ts` : `githubUsername`, `links.github`, `links.linkedin`, `links.email`.
  Le `headline` est une proposition, il est remplaçable.
- `projects.ts` : les trois `oneLiner` (un verbe + un résultat concret, une ligne, sans chiffre
  tant qu'il n'y en a pas). `repo` au format `owner/name` active la mini-heatmap sur la carte.
- `races.ts` : les dates des Templiers et de Menton–Nice, le nom exact de la backyard,
  et les autres courses.
- `data/training.json` : généré par `npm run fetch:data` depuis Strava (voir ci-dessous).
  Tant que le fichier n'existe pas, la heatmap course ne s'affiche pas. Il peut aussi être
  écrit à la main : `{ "days": [{ "date": "2026-03-01", "value": 24 }] }`.

## Heatmap course (Strava)

L'API Strava est **réservée aux comptes abonnés**. On passe donc par l'export de
données, gratuit pour tout le monde.

1. Strava → Paramètres → Mon compte → « Télécharger ou supprimer votre compte »
   → *Demander votre archive*. Un zip arrive par e-mail (compter quelques heures).
2. Dézipper et repérer `activities.csv`.
3. `npm run import:strava -- ~/Downloads/export_123456/activities.csv`

Le script écrit `data/training.json`, détecte tout seul l'unité (km ou mètres) et le
format de date (anglais ou français), et affiche un récapitulatif à vérifier avant de
committer : total, jours actifs, plus longue sortie.

Types retenus : `Run`, `Trail Run`, `Course à pied`, `Trail`... (constante `RUN_LABELS`
en haut de `scripts/import-strava-csv.ts`).

A relancer manuellement quand tu veux rafraichir la heatmap : contrairement a la
heatmap GitHub, elle ne se met pas a jour toute seule.

`scripts/fetch-strava.ts` et `scripts/strava-authorize.ts` implementent la voie API.
Ils ne sont branches sur aucun script npm et ne servent que si tu prends un abonnement.

## État

- [x] Scaffold, tokens, i18n, heatmap, `/styleguide`
- [x] Sections 1 à 7 (hero, projets, activité, saison, stack, envies, contact + footer)
- [x] Pages détail projet, FR et EN
- [x] Heatmap commits alimentée par de vraies données (`GITHUB_TOKEN` en local)
- [x] Heatmap course depuis l'export Strava, alignée sur les semaines des commits
      (les jours après la fin de l'export restent vides, avec la mention « données jusqu'au … »)
- [ ] Dépôt git + hébergeur + secret `DEPLOY_HOOK_URL` : sans eux, pas de rebuild quotidien
- [ ] Audit Lighthouse
