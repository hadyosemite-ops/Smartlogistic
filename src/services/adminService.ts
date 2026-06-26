import { supabase } from '../lib/supabase';
import type { DocumentVehicule, ContratClient, Facture } from '../data/mock';

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
};
