import { supabase } from '../lib/supabase';
import type { Vehicle } from '../data/mock';

function mapRow(r: Record<string, unknown>): Vehicle {
  return {
    id:               r.id as string,
    immatriculation:  r.immatriculation as string,
    marque:           r.marque as string,
    modele:           r.modele as string,
    annee:            r.annee as number,
    type:             r.type as string,
    chauffeurId:      r.chauffeur_id as string | null,
    status:           r.status as Vehicle['status'],
    kmActuel:         r.km_actuel as number,
    prochaineVidange: r.prochaine_vidange as number,
    prochainCT:       r.prochain_ct as string,
    carburant:        r.carburant as number,
    gps: {
      lat: r.gps_lat as number,
      lng: r.gps_lng as number,
    },
    scoreEtat:        r.score_etat as number,
  };
}

export type VehicleInput = {
  immatriculation: string; marque: string; modele: string;
  annee: number; type: string; status: Vehicle['status'];
  kmActuel?: number; prochaineVidange?: number;
  prochainCT?: string; carburant?: number;
};

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from('vehicles').select('*').order('immatriculation');
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  async create(input: VehicleInput): Promise<Vehicle> {
    const id = `v${Date.now()}`;
    const row = {
      id,
      immatriculation:   input.immatriculation,
      marque:            input.marque,
      modele:            input.modele,
      annee:             input.annee,
      type:              input.type,
      status:            input.status,
      km_actuel:         input.kmActuel ?? 0,
      prochaine_vidange: input.prochaineVidange ?? 0,
      prochain_ct:       input.prochainCT ?? null,
      carburant:         input.carburant ?? null,
      score_etat:        80,
      chauffeur_id:      null,
      gps_lat:           null,
      gps_lng:           null,
    };
    const { data, error } = await supabase.from('vehicles').insert(row).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, fields: Partial<VehicleInput & { chauffeurId: string | null }>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.immatriculation  !== undefined) mapped.immatriculation   = fields.immatriculation;
    if (fields.marque           !== undefined) mapped.marque            = fields.marque;
    if (fields.modele           !== undefined) mapped.modele            = fields.modele;
    if (fields.annee            !== undefined) mapped.annee             = fields.annee;
    if (fields.type             !== undefined) mapped.type              = fields.type;
    if (fields.status           !== undefined) mapped.status            = fields.status;
    if (fields.kmActuel         !== undefined) mapped.km_actuel         = fields.kmActuel;
    if (fields.prochaineVidange !== undefined) mapped.prochaine_vidange = fields.prochaineVidange;
    if (fields.prochainCT       !== undefined) mapped.prochain_ct       = fields.prochainCT;
    if (fields.carburant        !== undefined) mapped.carburant         = fields.carburant;
    if ('chauffeurId'           in fields)     mapped.chauffeur_id      = fields.chauffeurId;
    const { error } = await supabase.from('vehicles').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  },
};
