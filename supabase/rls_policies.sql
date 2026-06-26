-- ============================================================
-- Logistic App — RLS Policies (lecture publique anon)
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

do $$
declare
  t text;
  tables text[] := array[
    'drivers','vehicles','missions','alerts','interventions',
    'maintenance_alerts','maintenance_cost_by_month',
    'voyage_costs','client_revenue','route_perf','financial_by_month',
    'contrats_conducteurs','conges','formations','paie_mensuelle',
    'documents_vehicules','contrats_clients','factures',
    'checklist_items','inspections','actions_correctrices',
    'qse_data','activity_data','fuel_data','incident_data','conformite_trend'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anon_read_%s" on %I', t, t);
    execute format(
      'create policy "anon_read_%s" on %I for select using (true)',
      t, t
    );
  end loop;
end $$;
