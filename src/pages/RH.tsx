import { useState } from 'react';
import {
  Users, FileText, Calendar, DollarSign,
  X, ChevronRight,
  AlertTriangle, Award, Phone
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import {
  drivers, contratsConducteurs, conges, formations, paieMensuelle,
  type TypeContrat, type StatutConge, type TypeConge
} from '../data/mock';

// ─── Labels & Colors ──────────────────────────────────────────────────────────

const contratColor: Record<TypeContrat, string> = {
  CDI:    'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  CDD:    'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  interim:'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
};

const congeTypeLabel: Record<TypeConge, string> = {
  conge_annuel: 'Congé annuel',
  maladie:      'Maladie',
  sans_solde:   'Sans solde',
  formation:    'Formation',
};
const congeTypeColor: Record<TypeConge, string> = {
  conge_annuel: 'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  maladie:      'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
  sans_solde:   'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
  formation:    'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
};
const congeStatutColor: Record<StatutConge, string> = {
  approuve:   'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  en_attente: 'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  refuse:     'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
};
const statusDriverColor: Record<string, string> = {
  actif:        'text-[#00e676] bg-[#00e67610] border-[#00e67640]',
  repos:        'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]',
  conge:        'text-[#00d4ff] bg-[#00d4ff10] border-[#00d4ff40]',
  indisponible: 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]',
};

// ─── Driver Detail Panel ──────────────────────────────────────────────────────

function DriverPanel({ driverId, onClose }: { driverId: string; onClose: () => void }) {
  const { c } = useTheme();
  const driver   = drivers.find(d => d.id === driverId);
  const contrat  = contratsConducteurs.find(ct => ct.chauffeurId === driverId);
  const paie     = paieMensuelle.find(p => p.chauffeurId === driverId);
  const driverFormations = formations.filter(f => f.chauffeurId === driverId);
  const driverConges     = conges.filter(cg => cg.chauffeurId === driverId);

  if (!driver) return null;

  const scoreColor = driver.scoreGlobal >= 80 ? '#00e676' : driver.scoreGlobal >= 65 ? '#ffb300' : '#ff4444';

  const permisDate = new Date(driver.permisExpire);
  const visiteDate = new Date(driver.visiteExpire);
  const today      = new Date('2025-05-25');
  const permisJours = Math.round((permisDate.getTime() - today.getTime()) / 86400000);
  const visiteJours = Math.round((visiteDate.getTime() - today.getTime()) / 86400000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto p-6"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}`, borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: `${scoreColor}20`, border: `2px solid ${scoreColor}50`, color: scoreColor }}>
                {driver.prenom[0]}{driver.nom[0]}
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: c.textPrimary }}>
                  {driver.prenom} {driver.nom}
                </p>
                <p className="text-xs" style={{ color: c.textMuted }}>{driver.matricule}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusDriverColor[driver.status]}`}>
                {driver.status}
              </span>
              {contrat && <Badge label={contrat.type} className={contratColor[contrat.type]} />}
            </div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Score sécurité */}
        <div className="px-4 py-4 rounded-xl mb-5"
          style={{ background: `${scoreColor}0a`, border: `1px solid ${scoreColor}25` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: c.textSecondary }}>Score sécurité</span>
            <span className="text-2xl font-black" style={{ color: scoreColor }}>{driver.scoreGlobal}/100</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: c.border }}>
            <div className="h-full rounded-full"
              style={{ width: `${driver.scoreGlobal}%`, background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Vitesse',      v: driver.scoreVitesse },
              { label: 'Freinage',     v: driver.scoreFreinage },
              { label: 'Fatigue',      v: driver.scoreFatigue },
              { label: 'Distraction', v: driver.scoreDistraction },
            ].map(({ label, v }) => {
              const clr = v >= 80 ? '#00e676' : v >= 65 ? '#ffb300' : '#ff4444';
              return (
                <div key={label} className="text-center">
                  <div className="text-sm font-bold" style={{ color: clr }}>{v}</div>
                  <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contrat & stats */}
        {contrat && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>Contrat</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Type contrat',   value: contrat.type,                                        color: c.textPrimary },
                { label: 'Ancienneté',     value: `${contrat.anciennete} an(s)`,                       color: c.textPrimary },
                { label: 'Salaire base',   value: `${contrat.salaireBase.toLocaleString()} MAD`,       color: c.accent },
                { label: 'Prime km',       value: `${contrat.primeKm} MAD/km`,                         color: '#00e676' },
                { label: 'Date embauche',  value: contrat.dateEmbauche,                                color: c.textSecondary },
                { label: 'Mutuelle',       value: contrat.mutuelle ? '✓ Incluse' : '✗ Non souscrite',  color: contrat.mutuelle ? '#00e676' : '#ff4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-3 py-2 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>Documents</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Permis de conduire', date: driver.permisExpire, jours: permisJours },
              { label: 'Visite médicale',    date: driver.visiteExpire, jours: visiteJours },
            ].map(({ label, date, jours }) => {
              const clr = jours < 0 ? '#ff4444' : jours < 60 ? '#ffb300' : '#00e676';
              return (
                <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: `${clr}08`, border: `1px solid ${clr}22` }}>
                  <span className="text-xs" style={{ color: c.textSecondary }}>{label}</span>
                  <div className="text-right">
                    <div className="text-xs font-semibold" style={{ color: clr }}>{date}</div>
                    <div className="text-xs" style={{ color: clr }}>
                      {jours < 0 ? `Expiré depuis ${Math.abs(jours)}j` : `dans ${jours} jours`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paie */}
        {paie && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              Paie — {paie.mois}
            </h4>
            <div className="space-y-1.5">
              {[
                { label: 'Salaire de base',   value: paie.salaireBase,      color: c.textSecondary },
                { label: 'Prime km',          value: paie.primeKm,          color: '#00e676' },
                { label: 'Prime rendement',   value: paie.primeRendement,   color: '#00e676' },
                { label: 'Heures supp.',      value: paie.heuresSupp,       color: c.accent },
                { label: 'Retenues (CNSS…)',  value: -paie.retenues,        color: '#ff4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-xs px-3 py-1.5 rounded"
                  style={{ background: c.bgElevated }}>
                  <span style={{ color: c.textSecondary }}>{label}</span>
                  <span className="font-semibold" style={{ color }}>
                    {value >= 0 ? '+' : ''}{value.toLocaleString()} MAD
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm px-3 py-2 rounded-lg font-bold mt-1"
                style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)' }}>
                <span style={{ color: c.textSecondary }}>NET À PAYER</span>
                <span style={{ color: '#00e676' }}>{paie.netAPayer.toLocaleString()} MAD</span>
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          <Phone size={14} style={{ color: c.textMuted }} />
          <span className="text-xs" style={{ color: c.textSecondary }}>{driver.phone}</span>
        </div>

        {/* Formations */}
        {driverFormations.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              Formations ({driverFormations.length})
            </h4>
            <div className="space-y-2">
              {driverFormations.map(f => (
                <div key={f.id} className="px-3 py-2.5 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-medium" style={{ color: c.textPrimary }}>{f.intitule}</p>
                    {f.certificat && (
                      <Award size={12} style={{ color: '#ffb300', flexShrink: 0, marginLeft: 4 }} />
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                    {f.organisme} · {f.date} · {f.dureeJours}j
                  </p>
                  {f.expiration && (
                    <p className="text-xs mt-0.5" style={{ color: '#ffb300' }}>
                      Certificat valide jusqu'au {f.expiration}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Congés */}
        {driverConges.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              Congés & absences
            </h4>
            <div className="space-y-2">
              {driverConges.map(cg => (
                <div key={cg.id} className="px-3 py-2.5 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <Badge label={congeTypeLabel[cg.type]} className={congeTypeColor[cg.type]} />
                    <Badge label={cg.statut} className={congeStatutColor[cg.statut]} />
                  </div>
                  <p className="text-xs" style={{ color: c.textSecondary }}>
                    {cg.dateDebut} → {cg.dateFin} · <strong>{cg.jours} jour(s)</strong>
                  </p>
                  {cg.motif && <p className="text-xs mt-0.5 italic" style={{ color: c.textMuted }}>{cg.motif}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabRH = 'conducteurs' | 'conges' | 'formations' | 'paie';

export default function RH() {
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState<TabRH>('conducteurs');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // KPIs
  const actifs          = drivers.filter(d => d.status === 'actif').length;
  const enConge         = drivers.filter(d => d.status === 'conge').length;
  const enAttente       = conges.filter(cg => cg.statut === 'en_attente').length;
  const today           = new Date('2025-05-25');
  const docsExpirant    = drivers.filter(d => {
    const permis = Math.round((new Date(d.permisExpire).getTime() - today.getTime()) / 86400000);
    const visite = Math.round((new Date(d.visiteExpire).getTime() - today.getTime()) / 86400000);
    return permis < 90 || visite < 90;
  }).length;
  const masseSalariale  = paieMensuelle.reduce((s, p) => s + p.netAPayer, 0);

  // Paie bar chart data
  const paieChartData = paieMensuelle.map(p => {
    const d = drivers.find(x => x.id === p.chauffeurId);
    return {
      name:    d ? `${d.prenom[0]}. ${d.nom}` : p.chauffeurId,
      Base:    p.salaireBase,
      Primes:  p.primeKm + p.primeRendement + p.heuresSupp,
      Retenues:-p.retenues,
    };
  });

  const tooltipStyle = { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Ressources Humaines" subtitle="Gestion conducteurs — contrats, congés, formations, paie" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Conducteurs actifs" value={actifs}
            icon={Users} iconColor="#00e676" iconBg={c.successBg}
            trendLabel={`${drivers.length} total · ${enConge} en congé`} glowClass="glow-success" />
          <KPICard label="Demandes congés" value={enAttente}
            icon={Calendar} iconColor="#ffb300" iconBg={c.warningBg}
            trendLabel="en attente d'approbation" glowClass={enAttente > 0 ? 'glow-warning' : ''} />
          <KPICard label="Documents à renouveler" value={docsExpirant}
            icon={FileText} iconColor="#ff4444" iconBg={c.dangerBg}
            trendLabel="permis ou visite méd. < 90j" glowClass={docsExpirant > 0 ? 'glow-danger' : ''} />
          <KPICard label="Masse salariale (Mai)" value={`${(masseSalariale/1000).toFixed(0)}K`} unit="MAD"
            icon={DollarSign} iconColor={c.accent} iconBg={c.accentBg}
            trendLabel="net à payer — 8 conducteurs" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          {([
            { key: 'conducteurs', label: '👤 Conducteurs' },
            { key: 'conges',      label: '🏖️ Congés' },
            { key: 'formations',  label: '🎓 Formations' },
            { key: 'paie',        label: '💰 Paie' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t.key ? c.accentBg : 'transparent',
                color:      activeTab === t.key ? c.accent : c.textMuted,
                border:     `1px solid ${activeTab === t.key ? c.accentBorder : 'transparent'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1 : CONDUCTEURS ══ */}
        {activeTab === 'conducteurs' && (
          <div className="space-y-4">
            {docsExpirant > 0 && (
              <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.25)' }}>
                <AlertTriangle size={16} style={{ color: '#ffb300', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: '#ffcc44' }}>
                  <strong>{docsExpirant} conducteur(s)</strong> avec permis ou visite médicale expirant dans moins de 90 jours
                </span>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Liste des conducteurs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Statut', 'Contrat', 'Score séc.', 'Ancienneté', 'Permis', 'Visite méd.', 'Km total', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(d => {
                      const contrat      = contratsConducteurs.find(ct => ct.chauffeurId === d.id);
                      const scoreColor   = d.scoreGlobal >= 80 ? '#00e676' : d.scoreGlobal >= 65 ? '#ffb300' : '#ff4444';
                      const permisJours  = Math.round((new Date(d.permisExpire).getTime() - today.getTime()) / 86400000);
                      const visiteJours  = Math.round((new Date(d.visiteExpire).getTime() - today.getTime()) / 86400000);
                      const permisClr    = permisJours < 0 ? '#ff4444' : permisJours < 60 ? '#ffb300' : '#00e676';
                      const visiteClr    = visiteJours < 0 ? '#ff4444' : visiteJours < 60 ? '#ffb300' : '#00e676';
                      return (
                        <tr key={d.id} className="table-row-hover cursor-pointer"
                          style={{ borderBottom: `1px solid ${c.borderFaint}` }}
                          onClick={() => setSelectedDriver(d.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: `${scoreColor}20`, color: scoreColor }}>
                                {d.prenom[0]}{d.nom[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium" style={{ color: c.textPrimary }}>
                                  {d.prenom} {d.nom}
                                </div>
                                <div className="text-xs" style={{ color: c.textMuted }}>{d.matricule}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusDriverColor[d.status]}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {contrat && <Badge label={contrat.type} className={contratColor[contrat.type]} />}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 rounded-full" style={{ background: c.border }}>
                                <div className="h-full rounded-full"
                                  style={{ width: `${d.scoreGlobal}%`, background: scoreColor }} />
                              </div>
                              <span className="text-sm font-bold" style={{ color: scoreColor }}>{d.scoreGlobal}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>
                            {contrat ? `${contrat.anciennete} an(s)` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: permisClr }}>
                            {d.permisExpire}
                            {permisJours < 90 && (
                              <div style={{ color: permisClr }}>
                                {permisJours < 0 ? `Expiré ${Math.abs(permisJours)}j` : `dans ${permisJours}j`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: visiteClr }}>
                            {d.visiteExpire}
                            {visiteJours < 90 && (
                              <div style={{ color: visiteClr }}>
                                {visiteJours < 0 ? `Expiré ${Math.abs(visiteJours)}j` : `dans ${visiteJours}j`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: c.textSecondary }}>
                            {d.kmTotal.toLocaleString()} km
                          </td>
                          <td className="px-4 py-3">
                            <button className="flex items-center gap-1 text-xs" style={{ color: c.accent }}>
                              Voir <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2 : CONGÉS ══ */}
        {activeTab === 'conges' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Approuvés',    count: conges.filter(cg=>cg.statut==='approuve').length,   color: '#00e676' },
                { label: 'En attente',   count: conges.filter(cg=>cg.statut==='en_attente').length,  color: '#ffb300' },
                { label: 'Refusés',      count: conges.filter(cg=>cg.statut==='refuse').length,      color: '#ff4444' },
              ].map(({ label, count, color }) => (
                <div key={label} className="glass-card p-4 text-center"
                  style={{ borderColor: `${color}30` }}>
                  <div className="text-3xl font-black mb-1" style={{ color }}>{count}</div>
                  <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Demandes de congés</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Type', 'Période', 'Durée', 'Motif', 'Statut'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conges.map(cg => {
                      const d = drivers.find(x => x.id === cg.chauffeurId);
                      return (
                        <tr key={cg.id} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium" style={{ color: c.textPrimary }}>
                              {d ? `${d.prenom} ${d.nom}` : '—'}
                            </div>
                            <div className="text-xs" style={{ color: c.textMuted }}>{d?.matricule}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={congeTypeLabel[cg.type]} className={congeTypeColor[cg.type]} />
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>
                            {cg.dateDebut} → {cg.dateFin}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold" style={{ color: c.textPrimary }}>
                            {cg.jours}j
                          </td>
                          <td className="px-4 py-3 text-xs italic" style={{ color: c.textMuted }}>
                            {cg.motif || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={cg.statut} className={congeStatutColor[cg.statut]} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3 : FORMATIONS ══ */}
        {activeTab === 'formations' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {drivers.map(d => {
                const driverForms = formations.filter(f => f.chauffeurId === d.id);
                const certified   = driverForms.filter(f => f.certificat).length;
                return (
                  <div key={d.id} className="glass-card p-4 cursor-pointer transition-all"
                    onClick={() => setSelectedDriver(d.id)}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: c.accentBg, color: c.accent }}>
                        {d.prenom[0]}{d.nom[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.textPrimary }}>
                          {d.prenom} {d.nom}
                        </div>
                        <div className="text-xs" style={{ color: c.textMuted }}>{d.matricule}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                      <span style={{ color: c.textMuted }}>Formations</span>
                      <span className="font-bold" style={{ color: c.accent }}>{driverForms.length}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                      <span style={{ color: c.textMuted }}>Certifiées</span>
                      <div className="flex items-center gap-1">
                        <Award size={12} style={{ color: '#ffb300' }} />
                        <span className="font-bold" style={{ color: '#ffb300' }}>{certified}</span>
                      </div>
                    </div>
                    {driverForms.length === 0 && (
                      <p className="text-xs italic" style={{ color: c.textFaint }}>Aucune formation enregistrée</p>
                    )}
                    {driverForms.slice(0, 2).map(f => (
                      <div key={f.id} className="text-xs mb-1 truncate" style={{ color: c.textMuted }}>
                        · {f.intitule}
                      </div>
                    ))}
                    <div className="flex items-center justify-end mt-2 text-xs" style={{ color: c.textMuted }}>
                      Voir fiche <ChevronRight size={12} className="ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tableau formations */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  Toutes les formations ({formations.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Formation', 'Organisme', 'Date', 'Durée', 'Certificat', 'Expiration'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map(f => {
                      const d = drivers.find(x => x.id === f.chauffeurId);
                      const expJours = f.expiration
                        ? Math.round((new Date(f.expiration).getTime() - today.getTime()) / 86400000)
                        : null;
                      const expClr = expJours === null ? c.textMuted : expJours < 0 ? '#ff4444' : expJours < 180 ? '#ffb300' : '#00e676';
                      return (
                        <tr key={f.id} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: c.textPrimary }}>
                            {d ? `${d.prenom} ${d.nom}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>{f.intitule}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textMuted }}>{f.organisme}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{f.date}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{f.dureeJours}j</td>
                          <td className="px-4 py-3">
                            {f.certificat
                              ? <span className="flex items-center gap-1 text-xs" style={{ color: '#ffb300' }}><Award size={12} /> Oui</span>
                              : <span className="text-xs" style={{ color: c.textFaint }}>Non</span>}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: expClr }}>
                            {f.expiration ?? '—'}
                            {expJours !== null && expJours < 365 && (
                              <div>{expJours < 0 ? `Expiré ${Math.abs(expJours)}j` : `dans ${expJours}j`}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 4 : PAIE ══ */}
        {activeTab === 'paie' && (
          <div className="space-y-4">

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                Détail paie — Mai 2025 (MAD)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={paieChartData} margin={{ top: 5, right: 10, left: -5, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                  <XAxis dataKey="name" tick={{ fill: c.textMuted, fontSize: 10, angle: -20, textAnchor: 'end' }}
                    axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: c.textSecondary }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                  <Bar dataKey="Base"    name="Salaire base" stackId="a" fill="#00d4ff" fillOpacity={0.85} />
                  <Bar dataKey="Primes"  name="Primes & HS"  stackId="a" fill="#00e676" fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table paie */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Bulletin de paie — Mai 2025</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Base', 'Prime km', 'Prime rend.', 'Heures supp.', 'Retenues', 'Net à payer'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paieMensuelle.map(p => {
                      const d = drivers.find(x => x.id === p.chauffeurId);
                      return (
                        <tr key={p.chauffeurId} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium" style={{ color: c.textPrimary }}>
                              {d ? `${d.prenom} ${d.nom}` : '—'}
                            </div>
                            <div className="text-xs" style={{ color: c.textMuted }}>{d?.matricule}</div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>{p.salaireBase.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#00e676' }}>{p.primeKm.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#00e676' }}>{p.primeRendement.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.accent }}>{p.heuresSupp.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#ff4444' }}>-{p.retenues.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold" style={{ color: '#00e676' }}>
                              {p.netAPayer.toLocaleString()} MAD
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer total */}
              <div className="px-5 py-3 flex justify-between items-center"
                style={{ borderTop: `1px solid ${c.border}`, background: c.bgElevated }}>
                <div className="flex gap-6">
                  {[
                    { label: 'Total brut', value: paieMensuelle.reduce((s,p)=>s+p.salaireBase+p.primeKm+p.primeRendement+p.heuresSupp, 0), color: c.textSecondary },
                    { label: 'Total retenues', value: paieMensuelle.reduce((s,p)=>s+p.retenues, 0), color: '#ff4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                      <div className="text-sm font-semibold" style={{ color }}>{value.toLocaleString()} MAD</div>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: c.textMuted }}>Masse salariale nette</div>
                  <div className="text-lg font-black" style={{ color: '#00e676' }}>
                    {masseSalariale.toLocaleString()} MAD
                  </div>
                </div>
              </div>
            </div>

            {/* Stats masse salariale */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Salaires de base',   value: paieMensuelle.reduce((s,p)=>s+p.salaireBase,0),                              color: c.accent },
                { label: 'Primes & HS',        value: paieMensuelle.reduce((s,p)=>s+p.primeKm+p.primeRendement+p.heuresSupp,0),    color: '#00e676' },
                { label: 'Retenues CNSS/IR',   value: paieMensuelle.reduce((s,p)=>s+p.retenues,0),                                  color: '#ff4444' },
              ].map(item => {
                const totalBrut = paieMensuelle.reduce((s,p)=>s+p.salaireBase+p.primeKm+p.primeRendement+p.heuresSupp,0);
                const pct = Math.round((item.value / totalBrut) * 100);
                return (
                  <div key={item.label} className="glass-card p-4">
                    <div className="text-lg font-black mb-1" style={{ color: item.color }}>
                      {item.value.toLocaleString()} MAD
                    </div>
                    <div className="text-xs mb-2" style={{ color: c.textMuted }}>{item.label}</div>
                    <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: item.color }}>{pct}% du brut</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {selectedDriver && (
        <DriverPanel driverId={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}
    </div>
  );
}
