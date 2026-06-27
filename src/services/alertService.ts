import { supabase } from '../lib/supabase';
import type { Alert } from '../data/mock';

function mapRow(r: Record<string, unknown>): Alert {
  return {
    id:          r.id as string,
    type:        r.type as string,
    level:       r.level as Alert['level'],
    message:     r.message as string,
    vehiculeId:  r.vehicule_id as string | undefined,
    chauffeurId: r.chauffeur_id as string | undefined,
    missionId:   r.mission_id as string | undefined,
    timestamp:   r.timestamp as string,
    lu:          r.lu as boolean,
  };
}

export type AlertInput = {
  type: string; level: Alert['level']; message: string;
  vehiculeId?: string; chauffeurId?: string; missionId?: string;
};

export const alertService = {
  async getAll(): Promise<Alert[]> {
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('alerts').update({ lu: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase.from('alerts').update({ lu: true }).eq('lu', false);
    if (error) throw error;
  },

  async create(input: AlertInput): Promise<Alert> {
    const id = `a${Date.now()}`;
    const row = {
      id,
      type:        input.type,
      level:       input.level,
      message:     input.message,
      vehicule_id: input.vehiculeId ?? null,
      chauffeur_id:input.chauffeurId ?? null,
      mission_id:  input.missionId ?? null,
      timestamp:   new Date().toISOString(),
      lu:          false,
    };
    const { data, error } = await supabase.from('alerts').insert(row).select().single();
    if (error) throw error;
    return mapRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) throw error;
  },

  async deleteAll(): Promise<void> {
    const { error } = await supabase.from('alerts').delete().not('id', 'is', null);
    if (error) throw error;
  },
};
