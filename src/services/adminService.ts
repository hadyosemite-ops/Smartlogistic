import { supabase } from '../lib/supabase';
import type { DocumentVehicule, ContratClient, Facture } from '../data/mock';

export type DocumentInput = {
  vehiculeId: string; type: DocumentVehicule['type']; libelle: string;
  organisme?: string; dateEmission?: string; dateExpiration?: string;
  statut: DocumentVehicule['statut']; montant?: number; reference?: string;
};

export type ContratClientInput = {
  client: string; type: ContratClient['type'];
  dateDebut: string; dateFin: string;
  tarifKm?: number; volumeMensuel?: number; caAnnuelEstime?: number;
  statut: ContratClient['statut']; contact?: string; conditions?: string;
};

export type FactureInput = {
  client: string; missionIds?: string[];
  dateEmission: string; dateEcheance: string;
  montantHT: number; tva: number; montantTTC: number;
  statut: Facture['statut'];
};

export const adminService = {
  async getDocuments(): Promise<DocumentVehicule[]> {
    const { data, error } = await supabase.from('documents_vehicules').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:              r.id,
      vehiculeId:      r.vehicule_id,
      type:            r.type,
      libelle:         r.libelle,
      organisme:       r.organisme,
      dateEmission:    r.date_emission,
      dateExpiration:  r.date_expiration,
      statut:          r.statut,
      montant:         r.montant ?? undefined,
      reference:       r.reference ?? undefined,
    }));
  },

  async getContrats(): Promise<ContratClient[]> {
    const { data, error } = await supabase.from('contrats_clients').select('*').order('client');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:               r.id,
      client:           r.client,
      type:             r.type,
      dateDebut:        r.date_debut,
      dateFin:          r.date_fin,
      tarifKm:          r.tarif_km,
      volumeMensuel:    r.volume_mensuel,
      caAnnuelEstime:   r.ca_annuel_estime,
      statut:           r.statut,
      contact:          r.contact,
      conditions:       r.conditions ?? undefined,
    }));
  },

  async getFactures(): Promise<Facture[]> {
    const { data, error } = await supabase.from('factures').select('*').order('date_emission', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id:            r.id,
      reference:     r.reference,
      client:        r.client,
      missionIds:    r.mission_ids ?? [],
      dateEmission:  r.date_emission,
      dateEcheance:  r.date_echeance,
      montantHT:     r.montant_ht,
      tva:           r.tva,
      montantTTC:    r.montant_ttc,
      statut:        r.statut,
    }));
  },

  // ─── Documents ────────────────────────────────────────────────────────────────

  async createDocument(input: DocumentInput): Promise<DocumentVehicule> {
    const id = `dv${Date.now()}`;
    const row = {
      id, vehicule_id: input.vehiculeId, type: input.type, libelle: input.libelle,
      organisme: input.organisme ?? null, date_emission: input.dateEmission ?? null,
      date_expiration: input.dateExpiration ?? null, statut: input.statut,
      montant: input.montant ?? null, reference: input.reference ?? null,
    };
    const { data, error } = await supabase.from('documents_vehicules').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, vehiculeId: data.vehicule_id, type: data.type, libelle: data.libelle, organisme: data.organisme, dateEmission: data.date_emission, dateExpiration: data.date_expiration, statut: data.statut, montant: data.montant ?? undefined, reference: data.reference ?? undefined };
  },

  async updateDocument(id: string, fields: Partial<DocumentInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.type           !== undefined) mapped.type            = fields.type;
    if (fields.libelle        !== undefined) mapped.libelle         = fields.libelle;
    if (fields.organisme      !== undefined) mapped.organisme       = fields.organisme;
    if (fields.dateEmission   !== undefined) mapped.date_emission   = fields.dateEmission;
    if (fields.dateExpiration !== undefined) mapped.date_expiration = fields.dateExpiration;
    if (fields.statut         !== undefined) mapped.statut          = fields.statut;
    if (fields.montant        !== undefined) mapped.montant         = fields.montant;
    if (fields.reference      !== undefined) mapped.reference       = fields.reference;
    const { error } = await supabase.from('documents_vehicules').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from('documents_vehicules').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Contrats clients ─────────────────────────────────────────────────────────

  async createContrat(input: ContratClientInput): Promise<ContratClient> {
    const id = `cc${Date.now()}`;
    const row = {
      id, client: input.client, type: input.type,
      date_debut: input.dateDebut, date_fin: input.dateFin,
      tarif_km: input.tarifKm ?? 0, volume_mensuel: input.volumeMensuel ?? 0,
      ca_annuel_estime: input.caAnnuelEstime ?? 0, statut: input.statut,
      contact: input.contact ?? null, conditions: input.conditions ?? null,
    };
    const { data, error } = await supabase.from('contrats_clients').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, client: data.client, type: data.type, dateDebut: data.date_debut, dateFin: data.date_fin, tarifKm: data.tarif_km, volumeMensuel: data.volume_mensuel, caAnnuelEstime: data.ca_annuel_estime, statut: data.statut, contact: data.contact, conditions: data.conditions ?? undefined };
  },

  async updateContrat(id: string, fields: Partial<ContratClientInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.client          !== undefined) mapped.client           = fields.client;
    if (fields.type            !== undefined) mapped.type             = fields.type;
    if (fields.dateDebut       !== undefined) mapped.date_debut       = fields.dateDebut;
    if (fields.dateFin         !== undefined) mapped.date_fin         = fields.dateFin;
    if (fields.tarifKm         !== undefined) mapped.tarif_km         = fields.tarifKm;
    if (fields.volumeMensuel   !== undefined) mapped.volume_mensuel   = fields.volumeMensuel;
    if (fields.caAnnuelEstime  !== undefined) mapped.ca_annuel_estime = fields.caAnnuelEstime;
    if (fields.statut          !== undefined) mapped.statut           = fields.statut;
    if (fields.contact         !== undefined) mapped.contact          = fields.contact;
    if (fields.conditions      !== undefined) mapped.conditions       = fields.conditions;
    const { error } = await supabase.from('contrats_clients').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteContrat(id: string): Promise<void> {
    const { error } = await supabase.from('contrats_clients').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Factures ─────────────────────────────────────────────────────────────────

  async createFacture(input: FactureInput): Promise<Facture> {
    const id = `f${Date.now()}`;
    const ref = `FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const row = {
      id, reference: ref, client: input.client,
      mission_ids: input.missionIds ?? [],
      date_emission: input.dateEmission, date_echeance: input.dateEcheance,
      montant_ht: input.montantHT, tva: input.tva, montant_ttc: input.montantTTC,
      statut: input.statut,
    };
    const { data, error } = await supabase.from('factures').insert(row).select().single();
    if (error) throw error;
    return { id: data.id, reference: data.reference, client: data.client, missionIds: data.mission_ids ?? [], dateEmission: data.date_emission, dateEcheance: data.date_echeance, montantHT: data.montant_ht, tva: data.tva, montantTTC: data.montant_ttc, statut: data.statut };
  },

  async updateFacture(id: string, fields: Partial<FactureInput>): Promise<void> {
    const mapped: Record<string, unknown> = {};
    if (fields.client        !== undefined) mapped.client         = fields.client;
    if (fields.dateEmission  !== undefined) mapped.date_emission  = fields.dateEmission;
    if (fields.dateEcheance  !== undefined) mapped.date_echeance  = fields.dateEcheance;
    if (fields.montantHT     !== undefined) mapped.montant_ht     = fields.montantHT;
    if (fields.tva           !== undefined) mapped.tva            = fields.tva;
    if (fields.montantTTC    !== undefined) mapped.montant_ttc    = fields.montantTTC;
    if (fields.statut        !== undefined) mapped.statut         = fields.statut;
    const { error } = await supabase.from('factures').update(mapped).eq('id', id);
    if (error) throw error;
  },

  async deleteFacture(id: string): Promise<void> {
    const { error } = await supabase.from('factures').delete().eq('id', id);
    if (error) throw error;
  },
};
