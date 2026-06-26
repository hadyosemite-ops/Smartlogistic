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
};
