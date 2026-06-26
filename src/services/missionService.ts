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

  async updateStatus(id: string, status: Mission['status'], progression?: number): Promise<void> {
    const fields: Record<string, unknown> = { status };
    if (progression !== undefined) fields.progression = progression;
    const { error } = await supabase.from('missions').update(fields).eq('id', id);
    if (error) throw error;
  },
};
