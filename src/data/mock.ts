// ─── Types ───────────────────────────────────────────────────────────────────

export type MissionStatus = 'planifiee' | 'en_cours' | 'livree' | 'incident' | 'retard';
export type AlertLevel    = 'critique' | 'warning' | 'info';
export type DriverStatus  = 'actif' | 'repos' | 'conge' | 'indisponible';

export interface Driver {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  phone: string;
  status: DriverStatus;
  scoreGlobal: number;       // 0-100
  scoreVitesse: number;
  scoreFreinage: number;
  scoreFatigue: number;
  scoreDistraction: number;
  kmTotal: number;
  missionsTotal: number;
  incidentsTotal: number;
  permisExpire: string;
  visiteExpire: string;
  vehiculeId: string | null;
}

export interface Vehicle {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  chauffeurId: string | null;
  status: 'actif' | 'maintenance' | 'indisponible';
  kmActuel: number;
  prochaineVidange: number;
  prochainCT: string;
  carburant: number; // L/100km moyen
  gps: { lat: number; lng: number };
  scoreEtat: number; // 0-100
}

export interface Mission {
  id: string;
  reference: string;
  client: string;
  chauffeurId: string;
  vehiculeId: string;
  origine: string;
  destination: string;
  dateDepart: string;
  dateLivraisonPrevue: string;
  dateLivraisonReelle?: string;
  status: MissionStatus;
  distance: number; // km
  chargement: string;
  poids: number; // tonnes
  prixHT: number;
  coutRevient: number;
  progression: number; // 0-100
  notes?: string;
}

export interface Alert {
  id: string;
  type: string;
  level: AlertLevel;
  message: string;
  vehiculeId?: string;
  chauffeurId?: string;
  missionId?: string;
  timestamp: string;
  lu: boolean;
}

export interface KPIData {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number; // % vs mois précédent
  trendUp?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const drivers: Driver[] = [
  {
    id: 'd1', nom: 'BENALI', prenom: 'Karim', matricule: 'C-0012', phone: '+212 661 234 567',
    status: 'actif', scoreGlobal: 91, scoreVitesse: 94, scoreFreinage: 89, scoreFatigue: 93, scoreDistraction: 88,
    kmTotal: 142500, missionsTotal: 387, incidentsTotal: 2,
    permisExpire: '2026-09-15', visiteExpire: '2025-12-10', vehiculeId: 'v1'
  },
  {
    id: 'd2', nom: 'IDRISSI', prenom: 'Mourad', matricule: 'C-0024', phone: '+212 662 345 678',
    status: 'actif', scoreGlobal: 84, scoreVitesse: 82, scoreFreinage: 86, scoreFatigue: 81, scoreDistraction: 87,
    kmTotal: 98200, missionsTotal: 264, incidentsTotal: 5,
    permisExpire: '2027-03-20', visiteExpire: '2026-02-28', vehiculeId: 'v2'
  },
  {
    id: 'd3', nom: 'OUAZZANI', prenom: 'Hassan', matricule: 'C-0031', phone: '+212 663 456 789',
    status: 'actif', scoreGlobal: 76, scoreVitesse: 71, scoreFreinage: 79, scoreFatigue: 74, scoreDistraction: 80,
    kmTotal: 187300, missionsTotal: 512, incidentsTotal: 11,
    permisExpire: '2025-11-05', visiteExpire: '2026-04-15', vehiculeId: 'v3'
  },
  {
    id: 'd4', nom: 'TAZI', prenom: 'Abdellah', matricule: 'C-0044', phone: '+212 664 567 890',
    status: 'repos', scoreGlobal: 88, scoreVitesse: 90, scoreFreinage: 87, scoreFatigue: 85, scoreDistraction: 90,
    kmTotal: 65800, missionsTotal: 178, incidentsTotal: 3,
    permisExpire: '2028-06-30', visiteExpire: '2026-08-20', vehiculeId: 'v4'
  },
  {
    id: 'd5', nom: 'CHERKAOUI', prenom: 'Youssef', matricule: 'C-0057', phone: '+212 665 678 901',
    status: 'actif', scoreGlobal: 62, scoreVitesse: 58, scoreFreinage: 65, scoreFatigue: 60, scoreDistraction: 65,
    kmTotal: 231000, missionsTotal: 621, incidentsTotal: 24,
    permisExpire: '2026-01-15', visiteExpire: '2025-09-30', vehiculeId: 'v5'
  },
  {
    id: 'd6', nom: 'MANSOURI', prenom: 'Rachid', matricule: 'C-0063', phone: '+212 666 789 012',
    status: 'conge', scoreGlobal: 79, scoreVitesse: 80, scoreFreinage: 76, scoreFatigue: 82, scoreDistraction: 78,
    kmTotal: 54300, missionsTotal: 145, incidentsTotal: 6,
    permisExpire: '2027-11-22', visiteExpire: '2026-06-10', vehiculeId: null
  },
  {
    id: 'd7', nom: 'ALAMI', prenom: 'Nabil', matricule: 'C-0071', phone: '+212 667 890 123',
    status: 'actif', scoreGlobal: 95, scoreVitesse: 97, scoreFreinage: 94, scoreFatigue: 96, scoreDistraction: 93,
    kmTotal: 78900, missionsTotal: 210, incidentsTotal: 0,
    permisExpire: '2029-04-18', visiteExpire: '2026-10-05', vehiculeId: 'v6'
  },
  {
    id: 'd8', nom: 'BERRADA', prenom: 'Omar', matricule: 'C-0082', phone: '+212 668 901 234',
    status: 'actif', scoreGlobal: 71, scoreVitesse: 68, scoreFreinage: 73, scoreFatigue: 70, scoreDistraction: 73,
    kmTotal: 115600, missionsTotal: 308, incidentsTotal: 14,
    permisExpire: '2026-07-09', visiteExpire: '2026-01-18', vehiculeId: 'v7'
  },
];

export const vehicles: Vehicle[] = [
  { id: 'v1', immatriculation: '12345-A-7', marque: 'Mercedes', modele: 'Actros 1845', annee: 2021, type: 'Semi-remorque', chauffeurId: 'd1', status: 'actif', kmActuel: 142500, prochaineVidange: 145000, prochainCT: '2026-03-15', carburant: 28.4, gps: { lat: 33.9716, lng: -6.8498 }, scoreEtat: 88 },
  { id: 'v2', immatriculation: '54321-B-3', marque: 'Volvo', modele: 'FH 500', annee: 2020, type: 'Semi-remorque', chauffeurId: 'd2', status: 'actif', kmActuel: 98200, prochaineVidange: 100000, prochainCT: '2026-06-20', carburant: 31.2, gps: { lat: 33.5731, lng: -7.5898 }, scoreEtat: 81 },
  { id: 'v3', immatriculation: '67890-C-5', marque: 'MAN', modele: 'TGX 18.510', annee: 2019, type: 'Semi-remorque', chauffeurId: 'd3', status: 'actif', kmActuel: 187300, prochaineVidange: 190000, prochainCT: '2025-11-30', carburant: 33.8, gps: { lat: 32.2994, lng: -9.2372 }, scoreEtat: 65 },
  { id: 'v4', immatriculation: '11223-D-9', marque: 'Scania', modele: 'R 450', annee: 2022, type: 'Porteur', chauffeurId: 'd4', status: 'actif', kmActuel: 65800, prochaineVidange: 70000, prochainCT: '2027-02-10', carburant: 27.1, gps: { lat: 34.0209, lng: -5.0026 }, scoreEtat: 94 },
  { id: 'v5', immatriculation: '44556-E-2', marque: 'DAF', modele: 'XF 480', annee: 2018, type: 'Semi-remorque', chauffeurId: 'd5', status: 'actif', kmActuel: 231000, prochaineVidange: 235000, prochainCT: '2025-08-25', carburant: 36.5, gps: { lat: 35.7595, lng: -5.8340 }, scoreEtat: 54 },
  { id: 'v6', immatriculation: '77889-F-1', marque: 'Mercedes', modele: 'Actros 1840', annee: 2023, type: 'Semi-remorque', chauffeurId: 'd7', status: 'actif', kmActuel: 78900, prochaineVidange: 80000, prochainCT: '2027-05-15', carburant: 26.8, gps: { lat: 31.6295, lng: -7.9811 }, scoreEtat: 97 },
  { id: 'v7', immatriculation: '99001-G-4', marque: 'Renault', modele: 'T 460', annee: 2020, type: 'Porteur', chauffeurId: 'd8', status: 'actif', kmActuel: 115600, prochaineVidange: 120000, prochainCT: '2026-09-08', carburant: 29.7, gps: { lat: 30.4278, lng: -9.5981 }, scoreEtat: 76 },
  { id: 'v8', immatriculation: '33445-H-6', marque: 'Iveco', modele: 'Stralis 460', annee: 2017, type: 'Semi-remorque', chauffeurId: null, status: 'maintenance', kmActuel: 298700, prochaineVidange: 300000, prochainCT: '2025-10-12', carburant: 38.2, gps: { lat: 33.9716, lng: -6.8498 }, scoreEtat: 42 },
];

export const missions: Mission[] = [
  { id: 'm1', reference: 'OT-2025-0847', client: 'Marjane Distribution', chauffeurId: 'd1', vehiculeId: 'v1', origine: 'Casablanca', destination: 'Marrakech', dateDepart: '2025-05-25 06:00', dateLivraisonPrevue: '2025-05-25 14:00', status: 'en_cours', distance: 238, chargement: 'Produits alimentaires', poids: 18.5, prixHT: 4800, coutRevient: 2950, progression: 65, notes: 'Livraison prioritaire - entrepôt fermé après 15h' },
  { id: 'm2', reference: 'OT-2025-0848', client: 'SONACOS', chauffeurId: 'd2', vehiculeId: 'v2', origine: 'Casablanca', destination: 'Agadir', dateDepart: '2025-05-25 04:30', dateLivraisonPrevue: '2025-05-25 13:00', status: 'retard', distance: 462, chargement: 'Matériaux de construction', poids: 24.0, prixHT: 8200, coutRevient: 5100, progression: 45, notes: 'Retard dû à un contrôle routier à Tiznit' },
  { id: 'm3', reference: 'OT-2025-0849', client: 'Label\'Vie', chauffeurId: 'd7', vehiculeId: 'v6', origine: 'Rabat', destination: 'Fès', dateDepart: '2025-05-25 08:00', dateLivraisonPrevue: '2025-05-25 11:30', status: 'livree', distance: 189, chargement: 'Produits frais', poids: 12.0, prixHT: 3600, coutRevient: 2100, progression: 100, dateLivraisonReelle: '2025-05-25 11:15' },
  { id: 'm4', reference: 'OT-2025-0850', client: 'Ciment du Maroc', chauffeurId: 'd3', vehiculeId: 'v3', origine: 'Safi', destination: 'Casablanca', dateDepart: '2025-05-25 05:00', dateLivraisonPrevue: '2025-05-25 10:00', status: 'incident', distance: 315, chargement: 'Ciment en vrac', poids: 26.0, prixHT: 5900, coutRevient: 3800, progression: 30, notes: 'Crevaison signalée à hauteur de Settat - assistance en route' },
  { id: 'm5', reference: 'OT-2025-0851', client: 'Coca-Cola Maroc', chauffeurId: 'd8', vehiculeId: 'v7', origine: 'Meknès', destination: 'Oujda', dateDepart: '2025-05-25 07:00', dateLivraisonPrevue: '2025-05-25 14:30', status: 'en_cours', distance: 387, chargement: 'Boissons', poids: 20.0, prixHT: 7100, coutRevient: 4400, progression: 52 },
  { id: 'm6', reference: 'OT-2025-0852', client: 'OCP Logistics', chauffeurId: 'd4', vehiculeId: 'v4', origine: 'Khouribga', destination: 'Jorf Lasfar', dateDepart: '2025-05-26 06:00', dateLivraisonPrevue: '2025-05-26 09:00', status: 'planifiee', distance: 142, chargement: 'Phosphates', poids: 28.0, prixHT: 3200, coutRevient: 1900, progression: 0 },
  { id: 'm7', reference: 'OT-2025-0845', client: 'Marjane Distribution', chauffeurId: 'd1', vehiculeId: 'v1', origine: 'Marrakech', destination: 'Casablanca', dateDepart: '2025-05-24 16:00', dateLivraisonPrevue: '2025-05-24 23:00', status: 'livree', distance: 238, chargement: 'Retour vide', poids: 0, prixHT: 2400, coutRevient: 1200, progression: 100, dateLivraisonReelle: '2025-05-24 22:45' },
  { id: 'm8', reference: 'OT-2025-0846', client: 'INWI', chauffeurId: 'd5', vehiculeId: 'v5', origine: 'Tanger', destination: 'Casablanca', dateDepart: '2025-05-24 22:00', dateLivraisonPrevue: '2025-05-25 07:00', status: 'livree', distance: 338, chargement: 'Équipements télécoms', poids: 8.5, prixHT: 6800, coutRevient: 3200, progression: 100, dateLivraisonReelle: '2025-05-25 07:22' },
];

export const alerts: Alert[] = [
  { id: 'a1', type: 'INCIDENT', level: 'critique', message: 'Crevaison signalée — OT-2025-0850 immobilisé RN1 Settat', vehiculeId: 'v3', chauffeurId: 'd3', missionId: 'm4', timestamp: '2025-05-25 07:42', lu: false },
  { id: 'a2', type: 'RETARD', level: 'warning', message: 'Retard 45 min estimé — OT-2025-0848 (Agadir)', vehiculeId: 'v2', chauffeurId: 'd2', missionId: 'm2', timestamp: '2025-05-25 08:15', lu: false },
  { id: 'a3', type: 'VITESSE', level: 'warning', message: 'Excès de vitesse 112 km/h — Cherkaoui Youssef (N9)', vehiculeId: 'v5', chauffeurId: 'd5', timestamp: '2025-05-25 06:58', lu: false },
  { id: 'a4', type: 'MAINTENANCE', level: 'warning', message: 'Vidange dans 1 500 km — V6 Mercedes Actros (v6)', vehiculeId: 'v6', timestamp: '2025-05-25 07:00', lu: true },
  { id: 'a5', type: 'DOCUMENT', level: 'warning', message: 'Visite technique expirée dans 8 jours — 67890-C-5', vehiculeId: 'v3', timestamp: '2025-05-25 07:00', lu: false },
  { id: 'a6', type: 'FATIGUE', level: 'critique', message: 'Détection somnolence — Cherkaoui Youssef (A5 Tanger)', vehiculeId: 'v5', chauffeurId: 'd5', timestamp: '2025-05-25 07:31', lu: false },
  { id: 'a7', type: 'CARBURANT', level: 'info', message: 'Consommation anormale +18% — 44556-E-2 (DAF XF)', vehiculeId: 'v5', timestamp: '2025-05-25 06:00', lu: true },
  { id: 'a8', type: 'DOCUMENT', level: 'warning', message: 'Permis conducteur expire dans 3 mois — Cherkaoui Youssef', chauffeurId: 'd5', timestamp: '2025-05-25 07:00', lu: true },
];

// ─── Chart data ───────────────────────────────────────────────────────────────

export const activityData = [
  { day: 'Lun', missions: 12, livrees: 11, km: 3840 },
  { day: 'Mar', missions: 14, livrees: 13, km: 4210 },
  { day: 'Mer', missions: 11, livrees: 10, km: 3560 },
  { day: 'Jeu', missions: 16, livrees: 14, km: 4980 },
  { day: 'Ven', missions: 15, livrees: 15, km: 4650 },
  { day: 'Sam', missions: 9,  livrees: 9,  km: 2870 },
  { day: 'Dim', missions: 6,  livrees: 5,  km: 1920 },
];

export const fuelData = [
  { month: 'Nov', litres: 18420, cout: 27630 },
  { month: 'Déc', litres: 17850, cout: 26775 },
  { month: 'Jan', litres: 19200, cout: 28800 },
  { month: 'Fév', litres: 16900, cout: 25350 },
  { month: 'Mar', litres: 20100, cout: 30150 },
  { month: 'Avr', litres: 21300, cout: 31950 },
  { month: 'Mai', litres: 19800, cout: 29700 },
];

export const incidentData = [
  { month: 'Nov', accidents: 1, infractions: 4, pannes: 3 },
  { month: 'Déc', accidents: 0, infractions: 6, pannes: 2 },
  { month: 'Jan', accidents: 2, infractions: 3, pannes: 5 },
  { month: 'Fév', accidents: 0, infractions: 2, pannes: 1 },
  { month: 'Mar', accidents: 1, infractions: 5, pannes: 4 },
  { month: 'Avr', accidents: 0, infractions: 3, pannes: 2 },
  { month: 'Mai', accidents: 0, infractions: 2, pannes: 1 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getDriver = (id: string) => drivers.find(d => d.id === id);
export const getVehicle = (id: string) => vehicles.find(v => v.id === id);

export const statusLabel: Record<MissionStatus, string> = {
  planifiee: 'Planifiée',
  en_cours:  'En cours',
  livree:    'Livrée',
  incident:  'Incident',
  retard:    'Retard',
};

export const statusColor: Record<MissionStatus, string> = {
  planifiee: 'text-[#7bacc8] bg-[#7bacc815] border-[#7bacc840]',
  en_cours:  'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  livree:    'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  incident:  'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
  retard:    'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
};

export const alertLevelColor: Record<AlertLevel, string> = {
  critique: 'text-[#ff4444] bg-[#ff444415] border-[#ff444440]',
  warning:  'text-[#ffb300] bg-[#ffb30015] border-[#ffb30040]',
  info:     'text-[#7bacc8] bg-[#7bacc815] border-[#7bacc840]',
};
