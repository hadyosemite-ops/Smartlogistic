import { supabase } from '../lib/supabase';
import type { Intervention, MaintenanceAlert } from '../data/mock';

function mapIntervention(r: Record<string, unknown>): Intervention {
  return {
    id:               r.id as string,
    vehiculeId:       r.vehicule_id as string,
    type:             r.type as Intervention['type'],
    libelle:          r.libelle as string,
    date:             r.date as string,
    kmIntervention:   r.km_intervention as number,
    coutPieces:       r.cout_pieces as number,
    coutMainOeuvre:   r.cout_main_oeuvre as number,
    garage:           r.garage as string,
    status:           r.status as Intervention['status'],
    notes:            r.notes as string | undefined,
  };
}

function mapMaintenanceAlert(r: Record<string, unknown>): MaintenanceAlert {
  return {
    vehiculeId: r.vehicule_id as string,
    type:       r.type as string,
    message:    r.message as string,
    echeance:   r.echeance as string,
    urgence:    r.urgence as MaintenanceAlert['urgence'],
  };
}

export const maintenanceService = {
  async getInterventions(): Promise<Intervention[]> {
    const { data, error } = await supabase.from('interventions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapIntervention);
  },

  async getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    const { data, error } = await supabase.from('maintenance_alerts').select('*');
    if (error) throw error;
    return (data ?? []).map(mapMaintenanceAlert);
  },

  async getCostByMonth() {
    const { data, error } = await supabase.from('maintenance_cost_by_month').select('*');
    if (error) throw error;
    return data ?? [];
  },
};
