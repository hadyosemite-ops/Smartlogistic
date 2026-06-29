import { supabase } from '../lib/supabase';

// ─── Types (mirrored from Securite.tsx) ──────────────────────────────────────

export type IncidentType    = 'accident_vehicule' | 'accident_travail' | 'accident_trajet' | 'incident' | 'presquaccident' | 'materiel';
export type IncidentGravite = 'mortelle' | 'grave' | 'moderee' | 'legere' | 'sans_arret' | 'materiel_seul';
export type IncidentStatut  = 'declare' | 'en_analyse' | 'plan_action' | 'cloture';

export interface IncidentAction {
  id: string;
  incidentId: string;
  description: string;
  type: 'corrective' | 'preventive';
  responsable: string;
  echeance: string;
  statut: 'ouverte' | 'en_cours' | 'cloturee';
  commentaire?: string;
}

export interface IncidentRow {
  id: string;
  reference: string;
  type: IncidentType;
  gravite: IncidentGravite;
  statut: IncidentStatut;
  date: string;
  heure: string;
  lieu: string;
  vehiculeId?: string;
  chauffeurId?: string;
  description: string;
  temoins: string;
  blesses: string;
  degatsMateriels: string;
  photos: string[];
  causesImmédiates: string;
  causesProfondees: string;
  facteurs: string[];
  actions: IncidentAction[];
  declarePar: string;
  dateDeclaration: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function rowToIncident(r: Record<string, unknown>, actions: IncidentAction[] = []): IncidentRow {
  return {
    id:               r.id as string,
    reference:        r.reference as string,
    type:             r.type as IncidentType,
    gravite:          r.gravite as IncidentGravite,
    statut:           r.statut as IncidentStatut,
    date:             r.date as string,
    heure:            (r.heure as string).slice(0, 5),
    lieu:             r.lieu as string,
    vehiculeId:       r.vehicule_id as string | undefined,
    chauffeurId:      r.chauffeur_id as string | undefined,
    description:      r.description as string,
    temoins:          (r.temoins as string) ?? '',
    blesses:          (r.blesses as string) ?? 'Aucun',
    degatsMateriels:  (r.degats_materiels as string) ?? 'Aucun',
    photos:           (r.photos as string[]) ?? [],
    causesImmédiates: (r.causes_immediates as string) ?? '',
    causesProfondees: (r.causes_profondes as string) ?? '',
    facteurs:         (r.facteurs as string[]) ?? [],
    actions,
    declarePar:       r.declare_par as string,
    dateDeclaration:  r.date_declaration as string,
  };
}

function rowToAction(r: Record<string, unknown>): IncidentAction {
  return {
    id:          r.id as string,
    incidentId:  r.incident_id as string,
    description: r.description as string,
    type:        r.type as 'corrective' | 'preventive',
    responsable: r.responsable as string,
    echeance:    r.echeance as string,
    statut:      r.statut as IncidentAction['statut'],
    commentaire: r.commentaire as string | undefined,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const incidentService = {

  // Récupère tous les incidents avec leurs actions
  async getAll(): Promise<IncidentRow[]> {
    const { data: incs, error: e1 } = await supabase
      .from('incidents')
      .select('*')
      .order('date', { ascending: false });
    if (e1) throw e1;

    const { data: acts, error: e2 } = await supabase
      .from('incident_actions')
      .select('*')
      .order('created_at');
    if (e2) throw e2;

    const actionsMap: Record<string, IncidentAction[]> = {};
    (acts ?? []).forEach(r => {
      const a = rowToAction(r as Record<string, unknown>);
      if (!actionsMap[a.incidentId]) actionsMap[a.incidentId] = [];
      actionsMap[a.incidentId].push(a);
    });

    return (incs ?? []).map(r => rowToIncident(r as Record<string, unknown>, actionsMap[r.id] ?? []));
  },

  // Crée un incident
  async create(inc: Omit<IncidentRow, 'actions'>): Promise<IncidentRow> {
    const row = {
      id:                inc.id,
      reference:         inc.reference,
      type:              inc.type,
      gravite:           inc.gravite,
      statut:            inc.statut,
      date:              inc.date,
      heure:             inc.heure,
      lieu:              inc.lieu,
      vehicule_id:       inc.vehiculeId ?? null,
      chauffeur_id:      inc.chauffeurId ?? null,
      description:       inc.description,
      temoins:           inc.temoins || null,
      blesses:           inc.blesses,
      degats_materiels:  inc.degatsMateriels,
      photos:            inc.photos,
      causes_immediates: inc.causesImmédiates || null,
      causes_profondes:  inc.causesProfondees || null,
      facteurs:          inc.facteurs,
      declare_par:       inc.declarePar,
      date_declaration:  inc.dateDeclaration,
    };
    const { data, error } = await supabase.from('incidents').insert(row).select().single();
    if (error) throw error;
    return rowToIncident(data as Record<string, unknown>, []);
  },

  // Met à jour un incident (analyse + statut)
  async update(id: string, fields: Partial<Omit<IncidentRow, 'id' | 'reference' | 'actions'>>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.statut            !== undefined) mapped.statut            = fields.statut;
    if (fields.gravite           !== undefined) mapped.gravite           = fields.gravite;
    if (fields.causesImmédiates  !== undefined) mapped.causes_immediates = fields.causesImmédiates;
    if (fields.causesProfondees  !== undefined) mapped.causes_profondes  = fields.causesProfondees;
    if (fields.facteurs          !== undefined) mapped.facteurs          = fields.facteurs;
    if (fields.photos            !== undefined) mapped.photos            = fields.photos;
    const { error } = await supabase.from('incidents').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // incident_actions supprimées en cascade
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Actions ───────────────────────────────────────────────────────────────

  async createAction(incidentId: string, action: Omit<IncidentAction, 'id' | 'incidentId'>): Promise<IncidentAction> {
    const id = `ia_${Date.now()}`;
    const row = {
      id, incident_id: incidentId,
      description:  action.description,
      type:         action.type,
      responsable:  action.responsable,
      echeance:     action.echeance,
      statut:       action.statut,
      commentaire:  action.commentaire ?? null,
    };
    const { data, error } = await supabase.from('incident_actions').insert(row).select().single();
    if (error) throw error;
    return rowToAction(data as Record<string, unknown>);
  },

  async updateActionStatut(id: string, statut: IncidentAction['statut']): Promise<void> {
    const { error } = await supabase.from('incident_actions').update({ statut }).eq('id', id);
    if (error) throw error;
  },

  async deleteAction(id: string): Promise<void> {
    const { error } = await supabase.from('incident_actions').delete().eq('id', id);
    if (error) throw error;
  },
};
