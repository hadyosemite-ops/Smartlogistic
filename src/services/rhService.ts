import { supabase } from '../lib/supabase';
import type { ContratConducteur, Conge, Formation, PaieMensuelle } from '../data/mock';

export type CongeInput = {
  chauffeurId: string; type: Conge['type'];
  dateDebut: string; dateFin: string; jours: number;
  statut: Conge['statut']; motif?: string;
};

export type FormationInput = {
  chauffeurId: string; intitule: string; organisme?: string;
  date: string; dureeJours?: number; certificat?: boolean; expiration?: string;
};

export type PaieInput = {
  chauffeurId: string; mois: string;
  salaireBase: number; primeKm?: number; primeRendement?: number;
  heuresSupp?: number; retenues?: number; netAPayer: number;
};

export const rhService = {
  async getContrats(): Promise<ContratConducteur[]> {
    const { data, error } = await supabase.from('contrats_conducteurs').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      chauffeurId:      r.chauffeur_id,
      type:             r.type,
      dateEmbauche:     r.date_embauche,
      dateFinContrat:   r.date_fin_contrat ?? undefined,
      salaireBase:      r.salaire_base,
      primeKm:          r.prime_km,
      primeRendement:   r.prime_rendement,
      mutuelle:         r.mutuelle,
      anciennete:       r.anciennete,
    }));
  },

  async getConges(): Promise<Conge[]> {
    const { data, error } = await supabase.from('conges').select('*').order('date_debut', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:          r.id,
      chauffeurId: r.chauffeur_id,
      type:        r.type,
      dateDebut:   r.date_debut,
      dateFin:     r.date_fin,
      jours:       r.jours,
      statut:      r.statut,
      motif:       r.motif ?? undefined,
    }));
  },

  async getFormations(): Promise<Formation[]> {
    const { data, error } = await supabase.from('formations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:          r.id,
      chauffeurId: r.chauffeur_id,
      intitule:    r.intitule,
      organisme:   r.organisme,
      date:        r.date,
      dureeJours:  r.duree_jours,
      certificat:  r.certificat,
      expiration:  r.expiration ?? undefined,
    }));
  },

  async getPaieMensuelle(): Promise<PaieMensuelle[]> {
    const { data, error } = await supabase.from('paie_mensuelle').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      chauffeurId:    r.chauffeur_id,
      mois:           r.mois,
      salaireBase:    r.salaire_base,
      primeKm:        r.prime_km,
      primeRendement: r.prime_rendement,
      heuresSupp:     r.heures_supp,
      retenues:       r.retenues,
      netAPayer:      r.net_a_payer,
    }));
  },

  // ─── Congés ───────────────────────────────────────────────────────────────────

  async createConge(input: CongeInput): Promise<Conge> {
    const id = `cg${Date.now()}`;
    const row = {
      id,
      chauffeur_id: input.chauffeurId,
      type:         input.type,
      date_debut:   input.dateDebut,
      date_fin:     input.dateFin,
      jours:        input.jours,
      statut:       input.statut,
      motif:        input.motif ?? null,
    };
    const { data, error } = await supabase.from('conges').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, chauffeurId: data.chauffeur_id, type: data.type, dateDebut: data.date_debut, dateFin: data.date_fin, jours: data.jours, statut: data.statut, motif: data.motif ?? undefined };
  },

  async updateConge(id: string, fields: Partial<CongeInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.type       !== undefined) mapped.type        = fields.type;
    if (fields.dateDebut  !== undefined) mapped.date_debut  = fields.dateDebut;
    if (fields.dateFin    !== undefined) mapped.date_fin    = fields.dateFin;
    if (fields.jours      !== undefined) mapped.jours       = fields.jours;
    if (fields.statut     !== undefined) mapped.statut      = fields.statut;
    if (fields.motif      !== undefined) mapped.motif       = fields.motif;
    const { error } = await supabase.from('conges').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteConge(id: string): Promise<void> {
    const { error } = await supabase.from('conges').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Formations ───────────────────────────────────────────────────────────────

  async createFormation(input: FormationInput): Promise<Formation> {
    const id = `fm${Date.now()}`;
    const row = {
      id,
      chauffeur_id: input.chauffeurId,
      intitule:     input.intitule,
      organisme:    input.organisme ?? null,
      date:         input.date,
      duree_jours:  input.dureeJours ?? 1,
      certificat:   input.certificat ?? false,
      expiration:   input.expiration ?? null,
    };
    const { data, error } = await supabase.from('formations').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, chauffeurId: data.chauffeur_id, intitule: data.intitule, organisme: data.organisme, date: data.date, dureeJours: data.duree_jours, certificat: data.certificat, expiration: data.expiration ?? undefined };
  },

  async updateFormation(id: string, fields: Partial<FormationInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.intitule   !== undefined) mapped.intitule    = fields.intitule;
    if (fields.organisme  !== undefined) mapped.organisme   = fields.organisme;
    if (fields.date       !== undefined) mapped.date        = fields.date;
    if (fields.dureeJours !== undefined) mapped.duree_jours = fields.dureeJours;
    if (fields.certificat !== undefined) mapped.certificat  = fields.certificat;
    if (fields.expiration !== undefined) mapped.expiration  = fields.expiration;
    const { error } = await supabase.from('formations').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteFormation(id: string): Promise<void> {
    const { error } = await supabase.from('formations').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Paie ─────────────────────────────────────────────────────────────────────

  async createPaie(input: PaieInput): Promise<void> {
    const row = {
      chauffeur_id:    input.chauffeurId,
      mois:            input.mois,
      salaire_base:    input.salaireBase,
      prime_km:        input.primeKm ?? 0,
      prime_rendement: input.primeRendement ?? 0,
      heures_supp:     input.heuresSupp ?? 0,
      retenues:        input.retenues ?? 0,
      net_a_payer:     input.netAPayer,
    };
    const { error } = await supabase.from('paie_mensuelle').insert(row);
    if (error) throw error;
  },

  async deletePaie(chauffeurId: string, mois: string): Promise<void> {
    const { error } = await supabase.from('paie_mensuelle').delete().eq('chauffeur_id', chauffeurId).eq('mois', mois);
    if (error) throw error;
  },
};
