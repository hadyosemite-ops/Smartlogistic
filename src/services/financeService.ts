import { supabase } from '../lib/supabase';
import type { VoyageCost, ClientRevenue, RoutePerf } from '../data/mock';

export const financeService = {
  async getVoyageCosts(): Promise<VoyageCost[]> {
    const { data, error } = await supabase.from('voyage_costs').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      missionId:        r.mission_id,
      carburant:        r.carburant,
      salaireChauffeur: r.salaire_chauffeur,
      peages:           r.peages,
      amortissement:    r.amortissement,
      assurance:        r.assurance,
      divers:           r.divers,
      total:            r.total,
    }));
  },

  async getClientRevenue(): Promise<ClientRevenue[]> {
    const { data, error } = await supabase.from('client_revenue').select('*').order('ca', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      client:      r.client,
      ca:          r.ca,
      coutRevient: r.cout_revient,
      marge:       r.marge,
      margePct:    r.marge_pct,
      missions:    r.missions,
      km:          r.km,
    }));
  },

  async getRoutePerf(): Promise<RoutePerf[]> {
    const { data, error } = await supabase.from('route_perf').select('*').order('ca', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      route:    r.route,
      ca:       r.ca,
      coutKm:   r.cout_km,
      margePct: r.marge_pct,
      missions: r.missions,
    }));
  },

  async getFinancialByMonth() {
    const { data, error } = await supabase.from('financial_by_month').select('*');
    if (error) throw error;
    return data ?? [];
  },
};
