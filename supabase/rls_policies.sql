-- ============================================================
-- Logistic App — RLS Policies (accès complet anon)
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================
-- Chaque table est traitée indépendamment avec gestion d'erreur
-- pour éviter qu'une table manquante bloque tout le script.
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
      -- Active RLS
      execute format('alter table public.%I enable row level security', t);

      -- SELECT
      execute format('drop policy if exists "anon_read_%s" on public.%I', t, t);
      execute format(
        'create policy "anon_read_%s" on public.%I for select using (true)', t, t
      );

      -- INSERT
      execute format('drop policy if exists "anon_insert_%s" on public.%I', t, t);
      execute format(
        'create policy "anon_insert_%s" on public.%I for insert with check (true)', t, t
      );

      -- UPDATE
      execute format('drop policy if exists "anon_update_%s" on public.%I', t, t);
      execute format(
        'create policy "anon_update_%s" on public.%I for update using (true) with check (true)', t, t
      );

      -- DELETE
      execute format('drop policy if exists "anon_delete_%s" on public.%I', t, t);
      execute format(
        'create policy "anon_delete_%s" on public.%I for delete using (true)', t, t
      );

      raise notice 'RLS OK: %', t;
    exception when others then
      raise notice 'SKIP % — %', t, sqlerrm;
    end;
  end loop;
end $$;
