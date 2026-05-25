# FleetOS — Guide de Déploiement Demo (Vercel)

## 🚀 Déploiement Vercel en 3 étapes (gratuit)

### Étape 1 — Préparer le dépôt Git

```bash
cd "Logistic App"
git init
git add .
git commit -m "feat: FleetOS v1 — Dashboard + Exploitation + Sécurité"
```

Puis pousser sur GitHub :
```bash
git remote add origin https://github.com/<votre-compte>/fleetos.git
git push -u origin main
```

### Étape 2 — Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com) → **New Project**
2. Importer votre dépôt GitHub `fleetos`
3. Vercel détecte automatiquement Vite → laisser les paramètres par défaut :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Cliquer **Deploy** → URL générée en 30 secondes

### Résultat
Une URL publique du type : `https://fleetos-xxx.vercel.app`  
✅ HTTPS automatique | ✅ CDN mondial | ✅ Gratuit illimité

---

## 🔧 Développement local

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 📦 Structure du projet

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      ← Navigation principale
│   │   └── Header.tsx       ← En-tête avec alertes
│   └── ui/
│       ├── KPICard.tsx      ← Carte indicateur
│       └── Badge.tsx        ← Badge de statut
├── pages/
│   ├── Dashboard.tsx        ← Vue d'ensemble flotte
│   ├── Exploitation.tsx     ← Gestion missions/OT
│   ├── Securite.tsx         ← Scoring conducteurs
│   └── Placeholder.tsx      ← Modules en dev.
├── data/
│   └── mock.ts              ← Données de démonstration
├── App.tsx                  ← Router principal
└── index.css                ← Design system dark
```

---

## 🏗️ Architecture PCF (PowerApps)

Pour déployer en composant PowerApps :

```bash
# Installer les outils PCF
npm install -g microsoft-pcf-tools

# Initialiser le composant PCF
pac pcf init --namespace FleetOS --name FleetOSDashboard --template field

# Copier les fichiers React dans le composant PCF
# puis bundler avec pac pcf push
```

Le composant PCF encapsule l'app React et l'injecte dans un Canvas App ou Model-Driven App.

---

## 📋 Modules disponibles

| Module | Status | Détail |
|--------|--------|--------|
| Dashboard | ✅ Prêt | KPIs, charts, alertes, scores |
| Exploitation | ✅ Prêt | Missions, filtres, détail OT |
| Sécurité | ✅ Prêt | Scoring, radar, alertes |
| Maintenance | 🚧 Sprint 2 | — |
| Contrôle Gestion | 🚧 Sprint 2 | — |
| RH | 🚧 Sprint 3 | — |
| Administratif | 🚧 Sprint 3 | — |
