-- ─── Incidents (accidents & incidents logistique) ─────────────────────────────

create table if not exists public.incidents (
  id                text        primary key,
  reference         text        not null unique,
  type              text        not null,   -- accident_vehicule | accident_travail | accident_trajet | incident | presquaccident | materiel
  gravite           text        not null,   -- mortelle | grave | moderee | legere | sans_arret | materiel_seul
  statut            text        not null default 'declare',  -- declare | en_analyse | plan_action | cloture
  date              date        not null,
  heure             time        not null,
  lieu              text        not null,
  vehicule_id       text        references vehicles(id) on delete set null,
  chauffeur_id      text        references drivers(id)  on delete set null,
  description       text        not null,
  temoins           text,
  blesses           text        not null default 'Aucun',
  degats_materiels  text        not null default 'Aucun',
  photos            jsonb       not null default '[]',
  causes_immediates text,
  causes_profondes  text,
  facteurs          jsonb       not null default '[]',
  declare_par       text        not null,
  date_declaration  date        not null,
  created_at        timestamptz not null default now()
);

-- ─── Actions d'un incident ─────────────────────────────────────────────────────

create table if not exists public.incident_actions (
  id           text        primary key,
  incident_id  text        not null references incidents(id) on delete cascade,
  description  text        not null,
  type         text        not null,   -- corrective | preventive
  responsable  text        not null,
  echeance     date        not null,
  statut       text        not null default 'ouverte',  -- ouverte | en_cours | cloturee
  commentaire  text,
  created_at   timestamptz not null default now()
);

-- ─── Index ─────────────────────────────────────────────────────────────────────

create index if not exists incidents_statut_idx      on public.incidents(statut);
create index if not exists incidents_date_idx        on public.incidents(date desc);
create index if not exists incident_actions_inc_idx  on public.incident_actions(incident_id);

-- ─── RLS (même politique que les autres tables) ────────────────────────────────

alter table public.incidents        enable row level security;
alter table public.incident_actions enable row level security;

create policy "Allow all for authenticated" on public.incidents
  for all using (true) with check (true);

create policy "Allow all for authenticated" on public.incident_actions
  for all using (true) with check (true);
