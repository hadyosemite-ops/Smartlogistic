import { supabase } from '../lib/supabase';
import type { ContratConducteur, Conge, Formation, PaieMensuelle } from '../data/mock';

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
};
