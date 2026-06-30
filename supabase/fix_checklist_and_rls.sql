-- ============================================================
-- FIX 1 : RLS — accès complet anon sur les tables principales
-- ============================================================

do $$
declare
  t    text;
  tbls text[] := array[
    'drivers', 'vehicles', 'missions', 'alerts', 'interventions',
    'contrats_conducteurs', 'conges', 'formations', 'paie_mensuelle',
    'documents_vehicules', 'contrats_clients', 'factures',
    'checklist_items', 'inspections', 'actions_correctrices',
    'incidents', 'incident_actions'
  ];
begin
  foreach t in array tbls loop
    begin
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "anon_read_%s"   on public.%I', t, t);
      execute format('drop policy if exists "anon_insert_%s" on public.%I', t, t);
      execute format('drop policy if exists "anon_update_%s" on public.%I', t, t);
      execute format('drop policy if exists "anon_delete_%s" on public.%I', t, t);
      execute format('create policy "anon_read_%s"   on public.%I for select using (true)', t, t);
      execute format('create policy "anon_insert_%s" on public.%I for insert with check (true)', t, t);
      execute format('create policy "anon_update_%s" on public.%I for update using (true) with check (true)', t, t);
      execute format('create policy "anon_delete_%s" on public.%I for delete using (true)', t, t);
      raise notice 'RLS OK: %', t;
    exception when others then
      raise notice 'SKIP % — %', t, sqlerrm;
    end;
  end loop;
end $$;

-- ============================================================
-- FIX 2 : Checklist items — insert si la table est vide
-- ============================================================

do $$
begin
  if (select count(*) from public.checklist_items) = 0 then

    insert into checklist_items (id, categorie, categorie_num, point, critique) values
    ('cl01','Documents réglementaires',1,'Carte grise valide',true),
    ('cl02','Documents réglementaires',1,'Assurance véhicule valide',true),
    ('cl03','Documents réglementaires',1,'Contrôle technique valide',true),
    ('cl04','Documents réglementaires',1,'Vignette valide',false),
    ('cl05','Documents réglementaires',1,'Carte verte / autorisation transport',true),
    ('cl06','Documents réglementaires',1,'Permis conducteur valide',true),
    ('cl07','Documents réglementaires',1,'Visite médicale valide',true),
    ('cl08','Documents réglementaires',1,'Carte professionnelle disponible',false),
    ('cl09','Conducteur & sécurité',2,'Port de la ceinture obligatoire',true),
    ('cl10','Conducteur & sécurité',2,'Téléphone interdit (même kit mains-libres)',true),
    ('cl11','Conducteur & sécurité',2,'Aucun passager non autorisé',true),
    ('cl12','Conducteur & sécurité',2,'Respect des temps de conduite et de repos',true),
    ('cl13','Conducteur & sécurité',2,'Aucune conduite sous alcool / stupéfiants',true),
    ('cl14','Conducteur & sécurité',2,'Connaissance des règles HSE site client',false),
    ('cl15','EPI obligatoires',3,'Chaussures de sécurité',true),
    ('cl16','EPI obligatoires',3,'Casque EN397',true),
    ('cl17','EPI obligatoires',3,'Gilet haute visibilité',true),
    ('cl18','EPI obligatoires',3,'Lunettes de protection EN166',false),
    ('cl19','EPI obligatoires',3,'Gants de protection',false),
    ('cl20','EPI obligatoires',3,'Masque respiratoire (si nécessaire)',false),
    ('cl21','Tracteur',4,'Ralentisseur hydraulique fonctionnel',true),
    ('cl22','Tracteur',4,'Boîte automatique opérationnelle',false),
    ('cl23','Tracteur',4,'Éclairage complet (phares, feux AR, clignotants, réfléchissants)',true),
    ('cl24','Tracteur',4,'Klaxon de recul fonctionnel',false),
    ('cl25','Tracteur',4,'Pare-brise sans fissure',true),
    ('cl26','Tracteur',4,'Rétroviseurs conformes',true),
    ('cl27','Tracteur',4,'Extincteur 2 kg valide',true),
    ('cl28','Tracteur',4,'Trousse de secours disponible',false),
    ('cl29','Tracteur',4,'Âge < 10 ans, norme EURO VI, puissance ≥ 400 ch',false),
    ('cl30','Tracteur',4,'Boîtier IVMS (GPS) fonctionnel + clé conducteur',true),
    ('cl31','Tracteur',4,'Freinage ABS, ESP, ASR, ESC et ralentisseur opérationnels',true),
    ('cl32','Tracteur',4,'Régulateur de vitesse adaptatif fonctionnel',false),
    ('cl33','Benne / Remorque',5,'Structure sans fissure',true),
    ('cl34','Benne / Remorque',5,'Système de bâchage fonctionnel (bâchage obligatoire)',true),
    ('cl35','Benne / Remorque',5,'Bandes réfléchissantes présentes',false),
    ('cl36','Benne / Remorque',5,'Protections anti-encastrement (latérale & arrière)',true),
    ('cl37','Benne / Remorque',5,'Cales de roues disponibles',false),
    ('cl38','Benne / Remorque',5,'Dispositif d''attache et verrouillage tracteur-attelage sécurisé',true),
    ('cl39','Benne / Remorque',5,'Âge < 15 ans, alliages légers, structure intègre',false),
    ('cl40','Benne / Remorque',5,'Ouverture automatique porte arrière opérationnelle',false),
    ('cl41','Benne / Remorque',5,'Vérins et dispositif de levage contrôlés',true),
    ('cl42','Benne / Remorque',5,'Garde-boue et bavettes présents',false),
    ('cl43','Benne / Remorque',5,'Étanchéité : réservoirs sans fuites, bouchons installés',true),
    ('cl44','Benne / Remorque',5,'Autocollants angles morts & avertissement présents',false),
    ('cl45','Pneumatiques',6,'Pression conforme aux préconisations',true),
    ('cl46','Pneumatiques',6,'Aucune coupure critique (> 25 mm)',true),
    ('cl47','Pneumatiques',6,'Aucune hernie visible',true),
    ('cl48','Pneumatiques',6,'Sculpture conforme (> seuil légal)',true),
    ('cl49','Pneumatiques',6,'Aucun pneu rechapé',false),
    ('cl50','Pneumatiques',6,'Indicateurs de desserrage d''écrous présents',false),
    ('cl51','Pneumatiques',6,'Ceintures 3 points + pochette réfléchissante (port obligatoire)',true),
    ('cl52','Pneumatiques',6,'Pare-brise feuilleté sans fissure ni obstruction',true),
    ('cl53','Pneumatiques',6,'Rétroviseurs en bon état (grand angle, antéviseur, portière)',true),
    ('cl54','Pneumatiques',6,'Patins de pédales antidérapants, appuie-têtes ajustables',false),
    ('cl55','Environnement & urgence',7,'Kit antipollution disponible',true),
    ('cl56','Environnement & urgence',7,'Absence de fuite hydraulique / carburant',true),
    ('cl57','Environnement & urgence',7,'Plan d''urgence disponible dans la cabine',false),
    ('cl58','Environnement & urgence',7,'Numéros d''urgence affichés',false),
    ('cl59','Environnement & urgence',7,'Cônes et triangles de pré-signalisation (×2)',true),
    ('cl60','Environnement & urgence',7,'Trousse premiers secours + lampe torche + HV',false),
    ('cl61','Environnement & urgence',7,'Trousse à outils de bord complète',false);

    raise notice 'checklist_items : 61 points insérés';
  else
    raise notice 'checklist_items : déjà renseignée (% lignes)', (select count(*) from public.checklist_items);
  end if;
end $$;
