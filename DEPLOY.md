# FleetOS — Guide de Déploiement Production

## Prérequis

- Node.js 18+
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Un dépôt GitHub pour le code

---

## Étape 1 — Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New Project**
2. Choisir un nom (ex. `fleetos`), un mot de passe DB, une région (EU West)
3. Attendre ~1 minute que le projet soit prêt

---

## Étape 2 — Créer le schéma de base de données

Dans le dashboard Supabase → **SQL Editor** → **New Query** :

1. Copier le contenu de `supabase/schema.sql`
2. Cliquer **Run** — toutes les tables et énumérations sont créées

---

## Étape 3 — Insérer les données initiales

Toujours dans le SQL Editor :

1. Copier le contenu de `supabase/seed.sql`
2. Cliquer **Run** — 8 conducteurs, 8 véhicules, 8 missions, alertes, maintenances, etc.

> **Note** : Le seed.sql n'est à exécuter qu'une seule fois. Si vous re-exécutez, supprimez d'abord les données avec `TRUNCATE ... CASCADE` ou utilisez `ON CONFLICT DO NOTHING`.

---

## Étape 4 — Récupérer les variables d'environnement

Dans le dashboard Supabase → **Project Settings** → **API** :

| Variable | Où la trouver |
|----------|---------------|
| `VITE_SUPABASE_URL` | « Project URL » (ex. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | « anon » key dans « Project API keys » |

Copier ces deux valeurs — elles seront nécessaires aux étapes suivantes.

---

## Étape 5 — Configurer l'environnement local

```bash
# À la racine du projet
cp .env.example .env
```

Éditer `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...votre-clé-anon
```

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Étape 6 — Déployer sur Vercel

### 6a. Pousser le code sur GitHub

```bash
git add .
git commit -m "feat: migration Supabase production"
git push
```

### 6b. Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com) → **New Project**
2. Importer votre dépôt GitHub
3. Vercel détecte Vite automatiquement — laisser les paramètres par défaut :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### 6c. Ajouter les variables d'environnement

Dans Vercel → **Settings** → **Environment Variables** :

```
VITE_SUPABASE_URL     = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...votre-clé-anon
```

4. Cliquer **Deploy** → URL disponible en ~30 secondes

---

## Architecture

```
src/
├── lib/
│   └── supabase.ts          ← Client Supabase (URL + clé depuis .env)
├── services/
│   ├── driverService.ts     ← getAll / getById / update
│   ├── vehicleService.ts
│   ├── missionService.ts
│   ├── alertService.ts
│   ├── maintenanceService.ts
│   ├── financeService.ts
│   ├── rhService.ts
│   ├── adminService.ts
│   ├── checklistService.ts
│   └── chartService.ts
├── hooks/
│   ├── useData.ts           ← Hook générique { data, loading, error, refetch }
│   └── useFleetData.ts      ← useDrivers, useMissions, useAlerts... (28 hooks)
├── components/ui/
│   └── DataState.tsx        ← Spinner / message d'erreur pendant le chargement
├── pages/
│   ├── Dashboard.tsx        ✅ Migré
│   ├── Exploitation.tsx     ✅ Migré
│   ├── Maintenance.tsx      ✅ Migré
│   ├── ControleGestion.tsx  ✅ Migré
│   ├── RH.tsx               ✅ Migré
│   ├── Administratif.tsx    ✅ Migré
│   ├── Securite.tsx         ✅ Migré
│   └── Checklist.tsx        ✅ Migré
├── data/
│   └── mock.ts              ← Types TypeScript uniquement (données supprimées)
└── supabase/
    ├── schema.sql           ← DDL complet (enums + ~20 tables)
    └── seed.sql             ← Données initiales complètes
```

---

## Modules

| Module | Backend | Statut |
|--------|---------|--------|
| Dashboard | Supabase | ✅ Production |
| Exploitation | Supabase | ✅ Production |
| Maintenance | Supabase | ✅ Production |
| Contrôle Gestion | Supabase | ✅ Production |
| RH | Supabase | ✅ Production |
| Administratif | Supabase | ✅ Production |
| Sécurité | Supabase | ✅ Production |
| Check-list | Supabase | ✅ Production |

---

## Sécurité (Row Level Security)

Par défaut Supabase expose les tables via l'API REST avec la clé `anon`. Pour une application multi-utilisateurs, activer RLS dans Supabase → **Authentication** → **Policies** et créer des politiques par rôle.

Pour une démo interne sans authentification, la configuration actuelle (RLS désactivé) est suffisante.

---

## Développement local sans Supabase

L'app affichera un spinner et une erreur de connexion si les variables `.env` sont absentes ou incorrectes. Pour développer hors-ligne, vous pouvez temporairement remettre les imports depuis `data/mock.ts` dans les pages concernées.
