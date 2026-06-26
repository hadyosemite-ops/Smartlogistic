import { supabase } from '../lib/supabase';
import type { QSEMensuel } from '../data/mock';

export const chartService = {
  async getActivityData() {
    const { data, error } = await supabase.from('activity_data').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({ day: r.day, missions: r.missions, livrees: r.livrees, km: r.km }));
  },

  async getFuelData() {
    const { data, error } = await supabase.from('fuel_data').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({ month: r.month, litres: r.litres, cout: r.cout }));
  },

  async getIncidentData() {
    const { data, error } = await supabase.from('incident_data').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({ month: r.month, accidents: r.accidents, infractions: r.infractions, pannes: r.pannes }));
  },

  async getConformiteTrend() {
    const { data, error } = await supabase.from('conformite_trend').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({ mois: r.mois, taux: r.taux, inspections: r.inspections }));
  },

  async getQseData(): Promise<QSEMensuel[]> {
    const { data, error } = await supabase.from('qse_data').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      mois:                      r.mois,
      accidentSite:              r.accident_site,
      accidentTrajet:            r.accident_trajet,
      accidentClient:            r.accident_client,
      incidentEnvSite:           r.incident_env_site,
      incidentEnvTrajet:         r.incident_env_trajet,
      incidentEnvClient:         r.incident_env_client,
      joursArret:                r.jours_arret,
      reclamationsClients:       r.reclamations_clients,
      remonteesChauffeuts:       r.remontees_chauffeurs,
      tauxTraitementRemontees:   r.taux_traitement_remontees,
      tauxTraitementPAS:         r.taux_traitement_pas,
    }));
  },
};
