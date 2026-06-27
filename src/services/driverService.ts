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

export type DriverInput = {
  nom: string; prenom: string; matricule: string; phone?: string;
  status: Driver['status'];
  permisExpire?: string; visiteExpire?: string;
  scoreGlobal?: number; scoreVitesse?: number; scoreFreinage?: number;
  scoreFatigue?: number; scoreDistraction?: number;
};

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

  async create(input: DriverInput): Promise<Driver> {
    const id = `d${Date.now()}`;
    const row = {
      id,
      nom:               input.nom,
      prenom:            input.prenom,
      matricule:         input.matricule,
      phone:             input.phone ?? null,
      status:            input.status,
      score_global:      input.scoreGlobal ?? 80,
      score_vitesse:     input.scoreVitesse ?? 80,
      score_freinage:    input.scoreFreinage ?? 80,
      score_fatigue:     input.scoreFatigue ?? 80,
      score_distraction: input.scoreDistraction ?? 80,
      km_total:          0,
      missions_total:    0,
      incidents_total:   0,
      permis_expire:     input.permisExpire ?? null,
      visite_expire:     input.visiteExpire ?? null,
      vehicule_id:       null,
    };
    const { data, error } = await supabase.from('drivers').insert(row).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, fields: Partial<Driver & DriverInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.nom              !== undefined) mapped.nom               = fields.nom;
    if (fields.prenom           !== undefined) mapped.prenom            = fields.prenom;
    if (fields.matricule        !== undefined) mapped.matricule         = fields.matricule;
    if (fields.phone            !== undefined) mapped.phone             = fields.phone;
    if (fields.status           !== undefined) mapped.status            = fields.status;
    if (fields.scoreGlobal      !== undefined) mapped.score_global      = fields.scoreGlobal;
    if (fields.scoreVitesse     !== undefined) mapped.score_vitesse     = fields.scoreVitesse;
    if (fields.scoreFreinage    !== undefined) mapped.score_freinage    = fields.scoreFreinage;
    if (fields.scoreFatigue     !== undefined) mapped.score_fatigue     = fields.scoreFatigue;
    if (fields.scoreDistraction !== undefined) mapped.score_distraction = fields.scoreDistraction;
    if (fields.permisExpire     !== undefined) mapped.permis_expire     = fields.permisExpire;
    if (fields.visiteExpire     !== undefined) mapped.visite_expire     = fields.visiteExpire;
    if (fields.vehiculeId       !== undefined) mapped.vehicule_id       = fields.vehiculeId;
    const { error } = await supabase.from('drivers').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('drivers').delete().eq('id', id);
    if (error) throw error;
  },
};
