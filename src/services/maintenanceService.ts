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

export type InterventionInput = {
  vehiculeId: string;
  type: Intervention['type'];
  libelle: string;
  date: string;
  kmIntervention?: number;
  coutPieces?: number;
  coutMainOeuvre?: number;
  garage?: string;
  status: Intervention['status'];
  notes?: string;
};

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

  async createIntervention(input: InterventionInput): Promise<Intervention> {
    const id = `i${Date.now()}`;
    const row = {
      id,
      vehicule_id:      input.vehiculeId,
      type:             input.type,
      libelle:          input.libelle,
      date:             input.date,
      km_intervention:  input.kmIntervention ?? null,
      cout_pieces:      input.coutPieces ?? 0,
      cout_main_oeuvre: input.coutMainOeuvre ?? 0,
      garage:           input.garage ?? null,
      status:           input.status,
      notes:            input.notes ?? null,
    };
    const { data, error } = await supabase.from('interventions').insert(row).select().single();
    if (error) throw error;
    return mapIntervention(data);
  },

  async updateIntervention(id: string, fields: Partial<InterventionInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.vehiculeId      !== undefined) mapped.vehicule_id      = fields.vehiculeId;
    if (fields.type            !== undefined) mapped.type             = fields.type;
    if (fields.libelle         !== undefined) mapped.libelle          = fields.libelle;
    if (fields.date            !== undefined) mapped.date             = fields.date;
    if (fields.kmIntervention  !== undefined) mapped.km_intervention  = fields.kmIntervention;
    if (fields.coutPieces      !== undefined) mapped.cout_pieces      = fields.coutPieces;
    if (fields.coutMainOeuvre  !== undefined) mapped.cout_main_oeuvre = fields.coutMainOeuvre;
    if (fields.garage          !== undefined) mapped.garage           = fields.garage;
    if (fields.status          !== undefined) mapped.status           = fields.status;
    if (fields.notes           !== undefined) mapped.notes            = fields.notes;
    const { error } = await supabase.from('interventions').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteIntervention(id: string): Promise<void> {
    const { error } = await supabase.from('interventions').delete().eq('id', id);
    if (error) throw error;
  },
};
