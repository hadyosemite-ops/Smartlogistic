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

  async update(id: string, fields: Partial<Pick<Vehicle, 'status' | 'kmActuel'>>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.status   !== undefined) mapped.status    = fields.status;
    if (fields.kmActuel !== undefined) mapped.km_actuel = fields.kmActuel;
    const { error } = await supabase.from('vehicles').update(mapped).eq('id', id);
    if (error) throw error;
  },
};
