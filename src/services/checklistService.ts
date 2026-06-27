import { supabase } from '../lib/supabase';
import type { ChecklistItem, Inspection, ActionCorrectrice } from '../data/mock';

export type InspectionInput = {
  vehiculeId: string; chauffeurId: string; date: string; inspecteur?: string;
  resultats: Record<string, string>; commentaires: Record<string, string>;
  statut: Inspection['statut']; tauxConformite: number;
};

export type ActionInput = {
  inspectionId: string; vehiculeId: string; chauffeurId: string;
  point: string; categorie: string; priorite: ActionCorrectrice['priorite'];
  responsable?: string; dateEcheance?: string;
  statut: ActionCorrectrice['statut']; commentaire?: string;
};

export const checklistService = {
  async getItems(): Promise<ChecklistItem[]> {
    const { data, error } = await supabase.from('checklist_items').select('*').order('categorie_num').order('id');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:           r.id,
      categorie:    r.categorie,
      categorieNum: r.categorie_num,
      point:        r.point,
      critique:     r.critique,
    }));
  },

  async getInspections(): Promise<Inspection[]> {
    const { data, error } = await supabase.from('inspections').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:              r.id,
      vehiculeId:      r.vehicule_id,
      chauffeurId:     r.chauffeur_id,
      date:            r.date,
      inspecteur:      r.inspecteur,
      resultats:       r.resultats ?? {},
      commentaires:    r.commentaires ?? {},
      statut:          r.statut,
      tauxConformite:  r.taux_conformite,
    }));
  },

  async getActions(): Promise<ActionCorrectrice[]> {
    const { data, error } = await supabase.from('actions_correctrices').select('*').order('date_echeance');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:            r.id,
      inspectionId:  r.inspection_id,
      vehiculeId:    r.vehicule_id,
      chauffeurId:   r.chauffeur_id,
      point:         r.point,
      categorie:     r.categorie,
      priorite:      r.priorite,
      responsable:   r.responsable,
      dateEcheance:  r.date_echeance,
      statut:        r.statut,
      commentaire:   r.commentaire ?? undefined,
    }));
  },

  // ─── Inspections ──────────────────────────────────────────────────────────────

  async createInspection(input: InspectionInput): Promise<Inspection> {
    const id = `insp${Date.now()}`;
    const row = {
      id,
      vehicule_id:     input.vehiculeId,
      chauffeur_id:    input.chauffeurId,
      date:            input.date,
      inspecteur:      input.inspecteur ?? null,
      resultats:       input.resultats,
      commentaires:    input.commentaires,
      statut:          input.statut,
      taux_conformite: input.tauxConformite,
    };
    const { data, error } = await supabase.from('inspections').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, vehiculeId: data.vehicule_id, chauffeurId: data.chauffeur_id, date: data.date, inspecteur: data.inspecteur, resultats: data.resultats ?? {}, commentaires: data.commentaires ?? {}, statut: data.statut, tauxConformite: data.taux_conformite };
  },

  async updateInspection(id: string, fields: Partial<InspectionInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.statut         !== undefined) mapped.statut          = fields.statut;
    if (fields.tauxConformite !== undefined) mapped.taux_conformite = fields.tauxConformite;
    if (fields.resultats      !== undefined) mapped.resultats       = fields.resultats;
    if (fields.commentaires   !== undefined) mapped.commentaires    = fields.commentaires;
    if (fields.inspecteur     !== undefined) mapped.inspecteur      = fields.inspecteur;
    const { error } = await supabase.from('inspections').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteInspection(id: string): Promise<void> {
    // delete related actions first
    await supabase.from('actions_correctrices').delete().eq('inspection_id', id);
    const { error } = await supabase.from('inspections').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Actions correctrices ─────────────────────────────────────────────────────

  async createAction(input: ActionInput): Promise<ActionCorrectrice> {
    const id = `ac${Date.now()}`;
    const row = {
      id,
      inspection_id: input.inspectionId,
      vehicule_id:   input.vehiculeId,
      chauffeur_id:  input.chauffeurId,
      point:         input.point,
      categorie:     input.categorie,
      priorite:      input.priorite,
      responsable:   input.responsable ?? null,
      date_echeance: input.dateEcheance ?? null,
      statut:        input.statut,
      commentaire:   input.commentaire ?? null,
    };
    const { data, error } = await supabase.from('actions_correctrices').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, inspectionId: data.inspection_id, vehiculeId: data.vehicule_id, chauffeurId: data.chauffeur_id, point: data.point, categorie: data.categorie, priorite: data.priorite, responsable: data.responsable, dateEcheance: data.date_echeance, statut: data.statut, commentaire: data.commentaire ?? undefined };
  },

  async updateAction(id: string, fields: Partial<ActionInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.priorite     !== undefined) mapped.priorite     = fields.priorite;
    if (fields.statut       !== undefined) mapped.statut       = fields.statut;
    if (fields.responsable  !== undefined) mapped.responsable  = fields.responsable;
    if (fields.dateEcheance !== undefined) mapped.date_echeance = fields.dateEcheance;
    if (fields.commentaire  !== undefined) mapped.commentaire  = fields.commentaire;
    if (fields.point        !== undefined) mapped.point        = fields.point;
    if (fields.categorie    !== undefined) mapped.categorie    = fields.categorie;
    const { error } = await supabase.from('actions_correctrices').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteAction(id: string): Promise<void> {
    const { error } = await supabase.from('actions_correctrices').delete().eq('id', id);
    if (error) throw error;
  },
};
