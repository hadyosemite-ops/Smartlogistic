import { supabase } from '../lib/supabase';
import type { ChecklistItem, Inspection, ActionCorrectrice } from '../data/mock';

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
};
