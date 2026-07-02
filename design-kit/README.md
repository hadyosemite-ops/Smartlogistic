# FleetOS Design Kit

Design graphique extrait de l'app **Logistic App** (FleetOS), prêt à réutiliser dans une autre app. Style : tableau de bord "cockpit" sombre, effet verre (glassmorphism), accent cyan, thème clair/sombre.

## Fichiers

- **tokens.css** — le seul fichier obligatoire. CSS pur (variables + classes utilitaires : cartes, boutons, badges, champs, tableaux). Fonctionne avec ou sans framework.
- **theme.ts** — les mêmes tokens en objets JS/TS, pour les apps qui préfèrent `style={{ background: c.bgCard }}` plutôt que des classes CSS.
- **ThemeProvider.example.tsx** — exemple de contexte React pour brancher `theme.ts` (optionnel, à adapter).

## Intégration rapide (n'importe quel framework)

1. Copier `tokens.css` dans le projet et l'importer une fois globalement (`import './tokens.css'` ou `<link>`).
2. Mettre `data-theme="dark"` (ou `"light"`) sur la balise `<html>`. Un bouton peut basculer cet attribut pour changer de thème.
3. Utiliser les classes : `glass-card`, `btn btn-primary` / `btn-secondary` / `btn-danger`, `badge badge-success` / `badge-warning` / `badge-danger` / `badge-accent`, `input`, `field-label`, `modal-backdrop` / `modal-panel`.

## Intégration React (comme dans l'app d'origine)

Utiliser `theme.ts` + `ThemeProvider.example.tsx`, puis dans chaque composant :
```tsx
const { c } = useTheme();
<div className="glass-card p-5" style={{ color: c.textPrimary }}>...</div>
```

## Langage visuel — principes

- **Fond** : bleu-nuit quasi noir (`#020817`) en sombre, bleu très clair (`#eef4fb`) en clair.
- **Cartes** : fond semi-transparent + `backdrop-filter: blur()` (effet verre), coins arrondis 16px, bordure fine bleutée.
- **Accent** : cyan `#00d4ff` (sombre) / bleu `#0088cc` (clair) — utilisé pour boutons principaux, liens actifs, icônes clés. Le bouton principal est un dégradé `linear-gradient(135deg, #00d4ff, #0077aa)`.
- **Couleurs sémantiques** : vert `#00e676` (succès/actif), orange `#ffb300` (avertissement), rouge `#ff4444` (danger/critique) — chacune avec une variante `-bg` (fond translucide 10%) et `-border` pour badges/alertes.
- **Typographie** : Inter (300 à 900), texte principal très clair sur fond sombre, texte secondaire/muted en bleu-gris pour la hiérarchie.
- **Rayons** : 8px (petits éléments), 12–16px (cartes/modales), 9999px (badges/pills).
- **Composants clés reconnaissables** : KPI cards avec icône dans un carré arrondi + valeur en gros chiffre, tableaux avec en-têtes majuscules discrets et hover sur les lignes, formulaires en grille 2 colonnes avec labels majuscules `text-xs font-semibold uppercase`, modales centrées sur fond noir flouté.

## Aperçu

Ouvrir `preview.html` dans un navigateur pour voir tous les composants du kit rendus (cartes, boutons, badges, champs, tableau, switch de thème).
