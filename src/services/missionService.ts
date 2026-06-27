import { supabase } from '../lib/supabase';
import type { Mission } from '../data/mock';

function mapRow(r: Record<string, unknown>): Mission {
  return {
    id:                    r.id as string,
    reference:             r.reference as string,
    client:                r.client as string,
    chauffeurId:           r.chauffeur_id as string,
    vehiculeId:            r.vehicule_id as string,
    origine:               r.origine as string,
    destination:           r.destination as string,
    dateDepart:            r.date_depart as string,
    dateLivraisonPrevue:   r.date_livraison_prevue as string,
    dateLivraisonReelle:   r.date_livraison_reelle as string | undefined,
    status:                r.status as Mission['status'],
    distance:              r.distance as number,
    chargement:            r.chargement as string,
    poids:                 r.poids as number,
    prixHT:                r.prix_ht as number,
    coutRevient:           r.cout_revient as number,
    progression:           r.progression as number,
    notes:                 r.notes as string | undefined,
  };
}

export type MissionInput = {
  client: string; chauffeurId: string; vehiculeId: string;
  origine: string; destination: string;
  dateDepart: string; dateLivraisonPrevue: string;
  distance?: number; chargement?: string; poids?: number;
  prixHT?: number; coutRevient?: number; notes?: string;
};

export const missionService = {
  async getAll(): Promise<Mission[]> {
    const { data, error } = await supabase.from('missions').select('*').order('date_depart', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<Mission | null> {
    const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  async create(input: MissionInput): Promise<Mission> {
    const id = `m${Date.now()}`;
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    const row = {
      id,
      reference:             `OT-${new Date().getFullYear()}-${num}`,
      client:                input.client,
      chauffeur_id:          input.chauffeurId,
      vehicule_id:           input.vehiculeId,
      origine:               input.origine,
      destination:           input.destination,
      date_depart:           input.dateDepart,
      date_livraison_prevue: input.dateLivraisonPrevue,
      status:                'planifiee',
      distance:              input.distance ?? 0,
      chargement:            input.chargement ?? null,
      poids:                 input.poids ?? null,
      prix_ht:               input.prixHT ?? null,
      cout_revient:          input.coutRevient ?? null,
      progression:           0,
      notes:                 input.notes ?? null,
    };
    const { data, error } = await supabase.from('missions').insert(row).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, fields: Partial<MissionInput & { status: Mission['status']; progression: number }>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.client              !== undefined) mapped.client                = fields.client;
    if (fields.chauffeurId         !== undefined) mapped.chauffeur_id          = fields.chauffeurId;
    if (fields.vehiculeId          !== undefined) mapped.vehicule_id           = fields.vehiculeId;
    if (fields.origine             !== undefined) mapped.origine               = fields.origine;
    if (fields.destination         !== undefined) mapped.destination           = fields.destination;
    if (fields.dateDepart          !== undefined) mapped.date_depart           = fields.dateDepart;
    if (fields.dateLivraisonPrevue !== undefined) mapped.date_livraison_prevue = fields.dateLivraisonPrevue;
    if (fields.distance            !== undefined) mapped.distance              = fields.distance;
    if (fields.chargement          !== undefined) mapped.chargement            = fields.chargement;
    if (fields.poids               !== undefined) mapped.poids                 = fields.poids;
    if (fields.prixHT              !== undefined) mapped.prix_ht               = fields.prixHT;
    if (fields.coutRevient         !== undefined) mapped.cout_revient          = fields.coutRevient;
    if (fields.notes               !== undefined) mapped.notes                 = fields.notes;
    if (fields.status              !== undefined) mapped.status                = fields.status;
    if (fields.progression         !== undefined) mapped.progression           = fields.progression;
    const { error } = await supabase.from('missions').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: Mission['status'], progression?: number): Promise<void> {
    const fields: Record<string, unknown> = { status };
    if (progression !== undefined) fields.progression = progression;
    const { error } = await supabase.from('missions').update(fields).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) throw error;
  },
};
