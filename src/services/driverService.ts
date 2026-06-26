import { supabase } from '../lib/supabase';
import type { Driver } from '../data/mock';

function mapRow(r: Record<string, unknown>): Driver {
  return {
    id:                r.id as string,
    nom:               r.nom as string,
    prenom:            r.prenom as string,
    matricule:         r.matricule as string,
    phone:             r.phone as string,
    status:            r.status as Driver['status'],
    scoreGlobal:       r.score_global as number,
    scoreVitesse:      r.score_vitesse as number,
    scoreFreinage:     r.score_freinage as number,
    scoreFatigue:      r.score_fatigue as number,
    scoreDistraction:  r.score_distraction as number,
    kmTotal:           r.km_total as number,
    missionsTotal:     r.missions_total as number,
    incidentsTotal:    r.incidents_total as number,
    permisExpire:      r.permis_expire as string,
    visiteExpire:      r.visite_expire as string,
    vehiculeId:        r.vehicule_id as string | null,
  };
}

export const driverService = {
  async getAll(): Promise<Driver[]> {
    const { data, error } = await supabase.from('drivers').select('*').order('nom');
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<Driver | null> {
    const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? mapRow(data) : null;
  },

  async update(id: string, fields: Partial<Driver>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.status       !== undefined) mapped.status            = fields.status;
    if (fields.scoreGlobal  !== undefined) mapped.score_global      = fields.scoreGlobal;
    if (fields.vehiculeId   !== undefined) mapped.vehicule_id       = fields.vehiculeId;
    const { error } = await supabase.from('drivers').update(mapped).eq('id', id);
    if (error) throw error;
  },
};
