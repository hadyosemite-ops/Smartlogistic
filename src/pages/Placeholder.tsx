import { type LucideIcon, Wrench, BarChart3, Users, FileText } from 'lucide-react';
import Header from '../components/layout/Header';

const moduleInfo: Record<string, { icon: LucideIcon; title: string; subtitle: string; features: string[]; color: string }> = {
  maintenance: {
    icon: Wrench, color: '#ffb300',
    title: 'Module Maintenance',
    subtitle: 'Gestion préventive, prédictive et corrective des véhicules',
    features: [
      'Carnet de bord digital par véhicule',
      'Alertes maintenance préventive (km/date/heures)',
      'Maintenance prédictive IA via OBD-II',
      'Gestion des ordres de réparation',
      'Suivi pneus, carburant, immobilisations',
      'Tableau de bord coût/km et MTBF',
    ],
  },
  controle: {
    icon: BarChart3, color: '#00e676',
    title: 'Contrôle de Gestion',
    subtitle: 'Coût de revient, rentabilité et pilotage financier de la flotte',
    features: [
      'Coût de revient par voyage (carburant + chauffeur + péages + amort.)',
      'Rentabilité par client / route / véhicule',
      'Tableau de bord financier flotte',
      'Gestion des péages et dépenses',
      'Budget vs Réel mensuel',
      'Export comptable Sage / Odoo',
    ],
  },
  rh: {
    icon: Users, color: '#00d4ff',
    title: 'Ressources Humaines',
    subtitle: 'Gestion du personnel roulant et conformité sociale',
    features: [
      'Dossier conducteur digital complet',
      'Alertes expiration documents (permis, visite médicale)',
      'Planning conducteurs et gestion absences',
      'Suivi temps de travail et heures supplémentaires',
      'Paie préparatoire automatisée',
      'Formations et habilitations (FIMO/FCO, ADR)',
    ],
  },
  administratif: {
    icon: FileText, color: '#7bacc8',
    title: 'Module Administratif',
    subtitle: 'Documents, conformité réglementaire et gestion clients',
    features: [
      'Lettre de voiture digitale (LDV / CMR)',
      'Signature électronique et archivage cloud',
      'POD (Proof of Delivery) mobile',
      'Gestion des clients et contrats',
      'Chronotachygraphe digital et télétransmission',
      'Gestion des assurances et sinistres',
    ],
  },
};

interface PlaceholderProps {
  module: 'maintenance' | 'controle' | 'rh' | 'administratif';
}

export default function Placeholder({ module }: PlaceholderProps) {
  const info = moduleInfo[module];
  const Icon = info.icon;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title={info.title} subtitle={info.subtitle} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${info.color}18`, border: `2px solid ${info.color}30`, boxShadow: `0 0 40px ${info.color}20` }}>
            <Icon size={36} style={{ color: info.color }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#e8f4fd' }}>{info.title}</h2>
          <p className="text-sm mb-8" style={{ color: '#4a7a9b' }}>{info.subtitle}</p>

          <div className="glass-card p-6 text-left mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: info.color }}>
              Fonctionnalités planifiées
            </p>
            <ul className="space-y-2">
              {info.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#7bacc8' }}>
                  <span style={{ color: info.color }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${info.color}12`, border: `1px solid ${info.color}30`, color: info.color }}>
            🚧 Module en développement — Sprint prochain
          </div>
        </div>
      </div>
    </div>
  );
}
