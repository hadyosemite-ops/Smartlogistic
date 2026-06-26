-- ============================================================
-- Logistic App — Schéma Supabase
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────

create type mission_status   as enum ('planifiee','en_cours','livree','incident','retard');
create type alert_level      as enum ('critique','warning','info');
create type driver_status    as enum ('actif','repos','conge','indisponible');
create type vehicle_status   as enum ('actif','maintenance','indisponible');
create type intervention_type   as enum ('preventive','corrective','ct','pneus','carrosserie');
create type intervention_status as enum ('planifiee','en_cours','terminee');
create type type_contrat     as enum ('CDI','CDD','interim');
create type statut_conge     as enum ('approuve','en_attente','refuse');
create type type_conge       as enum ('conge_annuel','maladie','sans_solde','formation');
create type type_document    as enum ('carte_grise','assurance','vignette','autorisation','controle_technique');
create type statut_document  as enum ('valide','expire_bientot','expire');
create type contrat_type     as enum ('spot','cadre','exclusif');
create type contrat_statut   as enum ('actif','en_negociation','expire');
create type facture_statut   as enum ('payee','en_attente','retard','litige');
create type check_statut     as enum ('conforme','non_conforme','na');
create type action_priorite  as enum ('critique','haute','normale');
create type action_statut    as enum ('ouverte','en_cours','cloturee');
create type inspection_statut as enum ('conforme','non_conforme');
create type urgence_level    as enum ('critique','warning','ok');

-- ─── DRIVERS ─────────────────────────────────────────────────

create table drivers (
  id               text primary key,
  nom              text not null,
  prenom           text not null,
  matricule        text not null unique,
  phone            text,
  status           driver_status not null default 'actif',
  score_global     int  not null default 0,
  score_vitesse    int  not null default 0,
  score_freinage   int  not null default 0,
  score_fatigue    int  not null default 0,
  score_distraction int not null default 0,
  km_total         int  not null default 0,
  missions_total   int  not null default 0,
  incidents_total  int  not null default 0,
  permis_expire    date,
  visite_expire    date,
  vehicule_id      text,
  created_at       timestamptz default now()
);

-- ─── VEHICLES ────────────────────────────────────────────────

create table vehicles (
  id                  text primary key,
  immatriculation     text not null unique,
  marque              text not null,
  modele              text not null,
  annee               int  not null,
  type                text not null,
  chauffeur_id        text references drivers(id),
  status              vehicle_status not null default 'actif',
  km_actuel           int  not null default 0,
  prochaine_vidange   int  not null default 0,
  prochain_ct         date,
  carburant           numeric(5,2),
  gps_lat             numeric(10,6),
  gps_lng             numeric(10,6),
  score_etat          int  not null default 0,
  created_at          timestamptz default now()
);

-- fk driver -> vehicle
alter table drivers add constraint fk_driver_vehicle
  foreign key (vehicule_id) references vehicles(id);

-- ─── MISSIONS ────────────────────────────────────────────────

create table missions (
  id                      text primary key,
  reference               text not null unique,
  client                  text not null,
  chauffeur_id            text references drivers(id),
  vehicule_id             text references vehicles(id),
  origine                 text not null,
  destination             text not null,
  date_depart             timestamptz not null,
  date_livraison_prevue   timestamptz not null,
  date_livraison_reelle   timestamptz,
  status                  mission_status not null default 'planifiee',
  distance                int  not null default 0,
  chargement              text,
  poids                   numeric(6,2),
  prix_ht                 numeric(10,2),
  cout_revient            numeric(10,2),
  progression             int  not null default 0,
  notes                   text,
  created_at              timestamptz default now()
);

-- ─── ALERTS ──────────────────────────────────────────────────

create table alerts (
  id           text primary key,
  type         text not null,
  level        alert_level not null,
  message      text not null,
  vehicule_id  text references vehicles(id),
  chauffeur_id text references drivers(id),
  mission_id   text references missions(id),
  timestamp    timestamptz not null,
  lu           boolean not null default false,
  created_at   timestamptz default now()
);

-- ─── INTERVENTIONS (Maintenance) ─────────────────────────────

create table interventions (
  id                text primary key,
  vehicule_id       text not null references vehicles(id),
  type              intervention_type not null,
  libelle           text not null,
  date              date not null,
  km_intervention   int,
  cout_pieces       numeric(10,2) default 0,
  cout_main_oeuvre  numeric(10,2) default 0,
  garage            text,
  status            intervention_status not null default 'planifiee',
  notes             text,
  created_at        timestamptz default now()
);

create table maintenance_alerts (
  id           uuid primary key default uuid_generate_v4(),
  vehicule_id  text not null references vehicles(id),
  type         text not null,
  message      text not null,
  echeance     text not null,
  urgence      urgence_level not null,
  created_at   timestamptz default now()
);

create table maintenance_cost_by_month (
  id          uuid primary key default uuid_generate_v4(),
  month       text not null,
  preventive  numeric(10,2) default 0,
  corrective  numeric(10,2) default 0,
  pneus       numeric(10,2) default 0,
  total       numeric(10,2) default 0
);

-- ─── CONTRÔLE DE GESTION ─────────────────────────────────────

create table voyage_costs (
  id                uuid primary key default uuid_generate_v4(),
  mission_id        text not null references missions(id),
  carburant         numeric(10,2) default 0,
  salaire_chauffeur numeric(10,2) default 0,
  peages            numeric(10,2) default 0,
  amortissement     numeric(10,2) default 0,
  assurance         numeric(10,2) default 0,
  divers            numeric(10,2) default 0,
  total             numeric(10,2) default 0
);

create table client_revenue (
  id           uuid primary key default uuid_generate_v4(),
  client       text not null unique,
  ca           numeric(12,2) default 0,
  cout_revient numeric(12,2) default 0,
  marge        numeric(12,2) default 0,
  marge_pct    numeric(5,2)  default 0,
  missions     int  default 0,
  km           int  default 0
);

create table route_perf (
  id          uuid primary key default uuid_generate_v4(),
  route       text not null,
  ca          numeric(12,2) default 0,
  cout_km     numeric(6,2)  default 0,
  marge_pct   numeric(5,2)  default 0,
  missions    int  default 0
);

create table financial_by_month (
  id          uuid primary key default uuid_generate_v4(),
  month       text not null,
  ca          numeric(12,2) default 0,
  couts       numeric(12,2) default 0,
  marge       numeric(12,2) default 0,
  carburant   numeric(12,2) default 0,
  maintenance numeric(12,2) default 0,
  salaires    numeric(12,2) default 0
);

-- ─── RH ──────────────────────────────────────────────────────

create table contrats_conducteurs (
  id                uuid primary key default uuid_generate_v4(),
  chauffeur_id      text not null references drivers(id),
  type              type_contrat not null,
  date_embauche     date not null,
  date_fin_contrat  date,
  salaire_base      numeric(10,2) default 0,
  prime_km          numeric(6,4)  default 0,
  prime_rendement   numeric(10,2) default 0,
  mutuelle          boolean default false,
  anciennete        int default 0
);

create table conges (
  id           text primary key,
  chauffeur_id text not null references drivers(id),
  type         type_conge not null,
  date_debut   date not null,
  date_fin     date not null,
  jours        int  not null,
  statut       statut_conge not null default 'en_attente',
  motif        text
);

create table formations (
  id           text primary key,
  chauffeur_id text not null references drivers(id),
  intitule     text not null,
  organisme    text,
  date         date not null,
  duree_jours  int  default 1,
  certificat   boolean default false,
  expiration   date
);

create table paie_mensuelle (
  id                uuid primary key default uuid_generate_v4(),
  chauffeur_id      text not null references drivers(id),
  mois              text not null,
  salaire_base      numeric(10,2) default 0,
  prime_km          numeric(10,2) default 0,
  prime_rendement   numeric(10,2) default 0,
  heures_supp       numeric(10,2) default 0,
  retenues          numeric(10,2) default 0,
  net_a_payer       numeric(10,2) default 0
);

-- ─── ADMINISTRATIF ───────────────────────────────────────────

create table documents_vehicules (
  id               text primary key,
  vehicule_id      text not null references vehicles(id),
  type             type_document not null,
  libelle          text not null,
  organisme        text,
  date_emission    date,
  date_expiration  date,
  statut           statut_document not null,
  montant          numeric(10,2),
  reference        text
);

create table contrats_clients (
  id                  text primary key,
  client              text not null,
  type                contrat_type not null,
  date_debut          date not null,
  date_fin            date not null,
  tarif_km            numeric(6,2)  default 0,
  volume_mensuel      int  default 0,
  ca_annuel_estime    numeric(12,2) default 0,
  statut              contrat_statut not null,
  contact             text,
  conditions          text
);

create table factures (
  id             text primary key,
  reference      text not null unique,
  client         text not null,
  mission_ids    text[] default '{}',
  date_emission  date not null,
  date_echeance  date not null,
  montant_ht     numeric(10,2) default 0,
  tva            numeric(10,2) default 0,
  montant_ttc    numeric(10,2) default 0,
  statut         facture_statut not null
);

-- ─── CHECKLIST ───────────────────────────────────────────────

create table checklist_items (
  id            text primary key,
  categorie     text not null,
  categorie_num int  not null,
  point         text not null,
  critique      boolean default false
);

create table inspections (
  id               text primary key,
  vehicule_id      text not null references vehicles(id),
  chauffeur_id     text not null references drivers(id),
  date             timestamptz not null,
  inspecteur       text,
  resultats        jsonb default '{}',
  commentaires     jsonb default '{}',
  statut           inspection_statut not null,
  taux_conformite  numeric(5,2) default 0,
  created_at       timestamptz default now()
);

create table actions_correctrices (
  id             text primary key,
  inspection_id  text not null references inspections(id),
  vehicule_id    text not null references vehicles(id),
  chauffeur_id   text not null references drivers(id),
  point          text not null,
  categorie      text not null,
  priorite       action_priorite not null,
  responsable    text,
  date_echeance  date,
  statut         action_statut not null default 'ouverte',
  commentaire    text
);

-- ─── QSE ─────────────────────────────────────────────────────

create table qse_data (
  id                          uuid primary key default uuid_generate_v4(),
  mois                        text not null unique,
  accident_site               int default 0,
  accident_trajet             int default 0,
  accident_client             int default 0,
  incident_env_site           int default 0,
  incident_env_trajet         int default 0,
  incident_env_client         int default 0,
  jours_arret                 int default 0,
  reclamations_clients        int default 0,
  remontees_chauffeurs        int default 0,
  taux_traitement_remontees   numeric(5,2) default 0,
  taux_traitement_pas         numeric(5,2) default 0
);

-- ─── CHART DATA ───────────────────────────────────────────────

create table activity_data (
  id       uuid primary key default uuid_generate_v4(),
  day      text not null,
  missions int default 0,
  livrees  int default 0,
  km       int default 0
);

create table fuel_data (
  id     uuid primary key default uuid_generate_v4(),
  month  text not null,
  litres int  default 0,
  cout   numeric(10,2) default 0
);

create table incident_data (
  id          uuid primary key default uuid_generate_v4(),
  month       text not null,
  accidents   int default 0,
  infractions int default 0,
  pannes      int default 0
);

create table conformite_trend (
  id          uuid primary key default uuid_generate_v4(),
  mois        text not null,
  taux        numeric(5,2) default 0,
  inspections int default 0
);

-- ─── ROW LEVEL SECURITY (optionnel — activer si auth Supabase) ──
-- alter table drivers enable row level security;
-- Ajouter les policies si tu actives l'authentification
