import { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck, TrendingDown, TrendingUp, Bell, Eye, X, Activity,
  ClipboardCheck, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Minus, AlertTriangle,
  BarChart3, Calendar, Filter, ShieldAlert, Leaf, ScanLine, Trash2, Pencil,
  Camera, Search,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend,
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import { useTheme } from '../context/ThemeContext';
import {
  type Driver, type CheckStatut, type ActionStatut, type ActionPriorite,
  type Inspection, type ActionCorrectrice, type Alert, type Vehicle, type ChecklistItem,
} from '../data/mock';
import DataState from '../components/ui/DataState';
import {
  useDrivers, useAlerts, useVehicles,
  useChecklistItems, useInspections, useActions,
  useConformiteTrend, useQseData,
} from '../hooks/useFleetData';
import { checklistService } from '../services/checklistService';
import { driverService } from '../services/driverService';
import { alertService } from '../services/alertService';
import { incidentService } from '../services/incidentService';

// ─── Scoring helpers ──────────────────────────────────────────────────────────

const alertTypeIcon: Record<string, string> = {
  INCIDENT: '🚨', RETARD: '⏱️', VITESSE: '⚡', MAINTENANCE: '🔧',
  DOCUMENT: '📄', FATIGUE: '😴', CARBURANT: '⛽',
};

const scoreColor = (s: number) =>
  s >= 90 ? '#00e676' : s >= 75 ? '#00d4ff' : s >= 60 ? '#ffb300' : '#ff4444';

const scoreGrade = (s: number) =>
  s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : 'D';

// ─── Checklist helpers ────────────────────────────────────────────────────────

const prioriteColor = (p: ActionPriorite) =>
  p === 'critique' ? '#ff4444' : p === 'haute' ? '#ffb300' : '#00d4ff';

const statutColor = (s: ActionStatut) =>
  s === 'cloturee' ? '#00e676' : s === 'en_cours' ? '#ffb300' : '#4a7a9b';

const statutLabel = (s: ActionStatut) =>
  s === 'cloturee' ? 'Clôturée' : s === 'en_cours' ? 'En cours' : 'Ouverte';

const groupBy = <T,>(arr: T[], key: (item: T) => string) =>
  arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

const CHECKLIST_CATEGORIES = [
  'Documents réglementaires', 'Conducteur & sécurité', 'EPI obligatoires',
  'Tracteur', 'Benne / Remorque', 'Pneumatiques', 'Environnement & urgence',
];

function buildRadarData(insp: Inspection[], checklistItems: ChecklistItem[]) {
  return CHECKLIST_CATEGORIES.map(cat => {
    const items = checklistItems.filter(i => i.categorie === cat);
    let conformes = 0, total = 0;
    insp.forEach(ins => {
      items.forEach(item => {
        const r = ins.resultats[item.id];
        if (r === 'conforme' || r === 'non_conforme') { total++; if (r === 'conforme') conformes++; }
      });
    });
    return {
      subject: cat.replace('Benne / Remorque', 'Benne').replace('Environnement & urgence', 'Environ.').replace('Documents réglementaires', 'Docs').replace('Conducteur & sécurité', 'Conducteur').replace('EPI obligatoires', 'EPI').replace('Pneumatiques', 'Pneus'),
      taux: total > 0 ? Math.round((conformes / total) * 100) : 100,
    };
  });
}

function buildCatBarData(insp: Inspection[], checklistItems: ChecklistItem[]) {
  return CHECKLIST_CATEGORIES.map(cat => {
    const items = checklistItems.filter(i => i.categorie === cat);
    let conformes = 0, nonConformes = 0;
    insp.forEach(ins => {
      items.forEach(item => {
        const r = ins.resultats[item.id];
        if (r === 'conforme') conformes++;
        else if (r === 'non_conforme') nonConformes++;
      });
    });
    const total = conformes + nonConformes;
    return {
      cat: cat.replace('Documents réglementaires', 'Documents').replace('Conducteur & sécurité', 'Conducteur').replace('EPI obligatoires', 'EPI').replace('Benne / Remorque', 'Benne').replace('Environnement & urgence', 'Urgence').replace('Pneumatiques', 'Pneus'),
      taux: total > 0 ? Math.round((conformes / total) * 100) : 100,
      nc: nonConformes,
    };
  });
}

// ─── Driver detail panel ──────────────────────────────────────────────────────

function DriverPanel({ driver, onClose, alerts }: {
  driver: Driver; onClose: () => void; alerts: Alert[];
}) {
  const { c } = useTheme();
  const radarData = [
    { subject: 'Vitesse',     A: driver.scoreVitesse },
    { subject: 'Freinage',    A: driver.scoreFreinage },
    { subject: 'Fatigue',     A: driver.scoreFatigue },
    { subject: 'Distraction', A: driver.scoreDistraction },
    { subject: 'Global',      A: driver.scoreGlobal },
  ];
  const driverAlerts = alerts.filter(a => a.chauffeurId === driver.id);
  const color = scoreColor(driver.scoreGlobal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-md h-full overflow-y-auto p-6"
        style={{ border: `1px solid ${c.borderStrong}`, borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
              {driver.prenom[0]}{driver.nom[0]}
            </div>
            <div>
              <div className="font-semibold" style={{ color: c.textPrimary }}>{driver.prenom} {driver.nom}</div>
              <div className="text-xs" style={{ color: c.textMuted }}>{driver.matricule}</div>
              <div className="text-xs mt-0.5" style={{ color: driver.status === 'actif' ? '#00e676' : '#ffb300' }}>
                ● {driver.status === 'actif' ? 'En service' : driver.status === 'repos' ? 'En repos' : 'Congé'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        <div className="px-4 py-4 rounded-xl mb-5 text-center"
          style={{ background: `${color}0a`, border: `1px solid ${color}25` }}>
          <div className="text-5xl font-black" style={{ color }}>{driver.scoreGlobal}</div>
          <div className="text-sm font-medium mt-1" style={{ color: c.textSecondary }}>Score Global de Sécurité</div>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: `${color}20`, color }}>
            Grade {scoreGrade(driver.scoreGlobal)}
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-semibold mb-3" style={{ color: c.textMuted }}>ANALYSE COMPORTEMENTALE</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={c.gridStroke} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: c.textMuted, fontSize: 11 }} />
              <Radar name={driver.prenom} dataKey="A" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { label: 'Vitesse & Accélération', value: driver.scoreVitesse },
            { label: 'Freinage', value: driver.scoreFreinage },
            { label: 'Gestion fatigue', value: driver.scoreFatigue },
            { label: 'Distraction', value: driver.scoreDistraction },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: c.textSecondary }}>{label}</span>
                <span className="font-semibold" style={{ color: scoreColor(value) }}>{value}/100</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: c.border }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${value}%`, background: scoreColor(value) }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Km parcourus', value: driver.kmTotal.toLocaleString() },
            { label: 'Missions', value: driver.missionsTotal },
            { label: 'Incidents', value: driver.incidentsTotal },
          ].map(({ label, value }) => (
            <div key={label} className="px-3 py-2 rounded-lg text-center"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <div className="text-base font-bold" style={{ color: c.textPrimary }}>{value}</div>
              <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>DOCUMENTS</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.textSecondary }}>Permis de conduire</span>
              <span style={{ color: '#00d4ff' }}>Exp. {driver.permisExpire}</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.textSecondary }}>Visite médicale</span>
              <span style={{ color: '#ffb300' }}>Exp. {driver.visiteExpire}</span>
            </div>
          </div>
        </div>

        {driverAlerts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>ALERTES RÉCENTES</h4>
            <div className="space-y-2">
              {driverAlerts.map(a => (
                <div key={a.id} className="px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', color: '#ff8888' }}>
                  {alertTypeIcon[a.type] || '⚠️'} {a.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inspection Form ──────────────────────────────────────────────────────────

function InspectionForm({ onClose, onSubmit, vehicles, drivers, checklistItems }: {
  onClose: () => void;
  onSubmit: (insp: Inspection, actions: ActionCorrectrice[]) => void;
  vehicles: Vehicle[]; drivers: Driver[]; checklistItems: ChecklistItem[];
}) {
  const { c } = useTheme();
  const [vehiculeId, setVehiculeId] = useState('');
  const [chauffeurId, setChauffeurId] = useState('');
  const [inspecteur, setInspecteur] = useState('Chef de Parc');
  const [resultats, setResultats] = useState<Record<string, CheckStatut>>({});
  const [commentaires, setCommentaires] = useState<Record<string, string>>({});
  const [openCat, setOpenCat] = useState<string | null>(CHECKLIST_CATEGORIES[0]);
  const [step, setStep] = useState<'info' | 'checklist' | 'recap'>('info');

  const grouped = groupBy(checklistItems, i => i.categorie);

  const setStatut = (id: string, s: CheckStatut) => setResultats(prev => ({ ...prev, [id]: s }));
  const setComment = (id: string, val: string) => setCommentaires(prev => ({ ...prev, [id]: val }));

  const catProgress = (cat: string) => {
    const items = grouped[cat] || [];
    return {
      filled: items.filter(i => resultats[i.id]).length,
      total: items.length,
      nc: items.filter(i => resultats[i.id] === 'non_conforme').length,
    };
  };

  const totalFilled = checklistItems.filter(i => resultats[i.id]).length;
  const totalNC = checklistItems.filter(i => resultats[i.id] === 'non_conforme').length;
  const taux = Math.round(
    (checklistItems.filter(i => resultats[i.id] === 'conforme').length /
      Math.max(checklistItems.filter(i => resultats[i.id] !== 'na').length, 1)) * 100
  );

  const handleSubmit = () => {
    const id = `insp${Date.now()}`;
    const newInsp: Inspection = {
      id, vehiculeId, chauffeurId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      inspecteur, resultats, commentaires,
      statut: totalNC > 0 ? 'non_conforme' : 'conforme',
      tauxConformite: taux,
    };
    const newActions: ActionCorrectrice[] = checklistItems
      .filter(i => resultats[i.id] === 'non_conforme')
      .map((item, idx) => {
        const priorite: ActionPriorite = item.critique ? 'critique' : item.categorieNum <= 2 ? 'haute' : 'normale';
        const delay = priorite === 'critique' ? 3 : priorite === 'haute' ? 7 : 14;
        const echeance = new Date(Date.now() + delay * 86400000).toISOString().slice(0, 10);
        const responsable = item.categorieNum === 1 ? 'Responsable Administratif' : item.categorieNum <= 3 ? 'Responsable HSE' : 'Chef de Parc';
        return {
          id: `ac_new_${idx}`,
          inspectionId: id, vehiculeId, chauffeurId,
          point: item.point, categorie: item.categorie,
          priorite, responsable, dateEcheance: echeance,
          statut: 'ouverte' as ActionStatut,
          commentaire: commentaires[item.id] || '',
        };
      });
    onSubmit(newInsp, newActions);
  };

  const vehicule = vehicles.find(v => v.id === vehiculeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4"
        style={{ border: `1px solid ${c.borderStrong}`, borderRadius: 16 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <div className="font-semibold" style={{ color: c.textPrimary }}>Nouvelle Inspection Véhicule</div>
            <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>Check-list Power Hydrlub — Tracteur & Benne — Réf. RH-PH-001</div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {(['info', 'checklist', 'recap'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
                style={{
                  background: step === s || (s === 'info' && step !== 'info') || (s === 'checklist' && step === 'recap') ? '#00d4ff' : c.border,
                  color: step === s || (s === 'info' && step !== 'info') || (s === 'checklist' && step === 'recap') ? '#020817' : c.textMuted,
                }}>
                {i + 1}
              </div>
              <div className="text-xs ml-1.5 mr-4" style={{ color: step === s ? c.textPrimary : c.textMuted }}>
                {s === 'info' ? 'Identification' : s === 'checklist' ? 'Contrôle' : 'Récapitulatif'}
              </div>
              {i < 2 && <div className="w-8 h-px mr-4" style={{ background: c.border }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>VÉHICULE</label>
                <select value={vehiculeId} onChange={e => setVehiculeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque} {v.modele}</option>)}
                </select>
              </div>
              {vehicule && (
                <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <span style={{ color: c.textSecondary }}>KM actuel :</span> <span style={{ color: c.textPrimary }}>{vehicule.kmActuel.toLocaleString()} km</span>
                  <span className="mx-3" style={{ color: c.border }}>|</span>
                  <span style={{ color: c.textSecondary }}>État :</span> <span style={{ color: vehicule.scoreEtat >= 80 ? '#00e676' : vehicule.scoreEtat >= 60 ? '#ffb300' : '#ff4444' }}>{vehicule.scoreEtat}/100</span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>CONDUCTEUR</label>
                <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                  <option value="">Sélectionner un conducteur...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.prenom} {d.nom} — {d.matricule}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>INSPECTEUR</label>
                <input value={inspecteur} onChange={e => setInspecteur(e.target.value)}
                  placeholder="Nom de l'inspecteur..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div className="px-3 py-3 rounded-lg text-xs" style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)' }}>
                <div className="font-semibold mb-1" style={{ color: '#ffb300' }}>⚠️ Points critiques bloquants</div>
                <div style={{ color: c.textSecondary }}>{checklistItems.filter(i => i.critique).length} points critiques sur {checklistItems.length} — une non-conformité critique entraîne l'immobilisation immédiate du véhicule.</div>
              </div>
            </div>
          )}

          {step === 'checklist' && (
            <div className="space-y-2">
              {CHECKLIST_CATEGORIES.map(cat => {
                const { filled, total, nc } = catProgress(cat);
                const isOpen = openCat === cat;
                const items = grouped[cat] || [];
                return (
                  <div key={cat} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${nc > 0 ? 'rgba(255,68,68,0.3)' : filled === total ? 'rgba(0,230,118,0.25)' : c.border}` }}>
                    <button className="w-full flex items-center gap-3 px-4 py-3"
                      style={{ background: isOpen ? 'rgba(0,212,255,0.06)' : c.bgElevated }}
                      onClick={() => setOpenCat(isOpen ? null : cat)}>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>{cat}</div>
                        <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                          {filled}/{total} renseignés{nc > 0 && <> · <span style={{ color: '#ff4444' }}>{nc} NC</span></>}
                        </div>
                      </div>
                      {filled === total && nc === 0 && <CheckCircle2 size={15} style={{ color: '#00e676' }} />}
                      {nc > 0 && <AlertTriangle size={15} style={{ color: '#ff4444' }} />}
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(filled / total) * 100}%`, background: nc > 0 ? '#ff4444' : filled === total ? '#00e676' : '#00d4ff' }} />
                      </div>
                      {isOpen ? <ChevronUp size={14} style={{ color: c.textMuted }} /> : <ChevronDown size={14} style={{ color: c.textMuted }} />}
                    </button>
                    {isOpen && (
                      <div className="divide-y" style={{ borderColor: `${c.border}26` }}>
                        {items.map(item => {
                          const r = resultats[item.id];
                          return (
                            <div key={item.id} className="px-4 py-3"
                              style={{ background: r === 'non_conforme' ? 'rgba(255,68,68,0.04)' : 'transparent' }}>
                              <div className="flex items-start gap-3">
                                {item.critique && (
                                  <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                                    style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>CRIT.</span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm" style={{ color: c.textPrimary }}>{item.point}</div>
                                  <div className="flex gap-2 mt-2">
                                    {(['conforme', 'non_conforme', 'na'] as CheckStatut[]).map(s => (
                                      <button key={s} onClick={() => setStatut(item.id, s)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                          background: r === s ? (s === 'conforme' ? 'rgba(0,230,118,0.15)' : s === 'non_conforme' ? 'rgba(255,68,68,0.15)' : 'rgba(74,122,155,0.15)') : c.bgElevated,
                                          border: `1px solid ${r === s ? (s === 'conforme' ? 'rgba(0,230,118,0.5)' : s === 'non_conforme' ? 'rgba(255,68,68,0.5)' : 'rgba(74,122,155,0.4)') : c.border}`,
                                          color: r === s ? (s === 'conforme' ? '#00e676' : s === 'non_conforme' ? '#ff4444' : '#7bacc8') : c.textMuted,
                                        }}>
                                        {s === 'conforme' ? <CheckCircle2 size={12} /> : s === 'non_conforme' ? <XCircle size={12} /> : <Minus size={12} />}
                                        {s === 'conforme' ? 'Conforme' : s === 'non_conforme' ? 'Non conforme' : 'N/A'}
                                      </button>
                                    ))}
                                  </div>
                                  {r === 'non_conforme' && (
                                    <input value={commentaires[item.id] || ''} onChange={e => setComment(item.id, e.target.value)}
                                      placeholder="Commentaire / description du défaut..."
                                      className="mt-2 w-full px-3 py-2 rounded-lg text-xs"
                                      style={{ background: c.bgInput, border: '1px solid rgba(255,68,68,0.3)', color: c.textPrimary }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 'recap' && (
            <div className="space-y-4">
              <div className="text-center py-5 rounded-xl"
                style={{ background: taux >= 95 ? 'rgba(0,230,118,0.08)' : taux >= 80 ? 'rgba(255,179,0,0.08)' : 'rgba(255,68,68,0.08)', border: `1px solid ${taux >= 95 ? 'rgba(0,230,118,0.25)' : taux >= 80 ? 'rgba(255,179,0,0.25)' : 'rgba(255,68,68,0.25)'}` }}>
                <div className="text-5xl font-black" style={{ color: taux >= 95 ? '#00e676' : taux >= 80 ? '#ffb300' : '#ff4444' }}>{taux}%</div>
                <div className="text-sm mt-1" style={{ color: c.textSecondary }}>Taux de conformité</div>
                <div className="text-xs mt-2" style={{ color: c.textMuted }}>{totalFilled} points renseignés · {totalNC} non-conformité{totalNC > 1 ? 's' : ''}</div>
              </div>
              {totalNC > 0 ? (
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>NON-CONFORMITÉS — {totalNC} ACTIONS GÉNÉRÉES</div>
                  <div className="space-y-2">
                    {checklistItems.filter(i => resultats[i.id] === 'non_conforme').map(item => (
                      <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                        style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
                        <XCircle size={14} style={{ color: '#ff4444', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div className="text-xs font-medium" style={{ color: '#ff8888' }}>{item.point}</div>
                          <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                            {item.categorie} · <span style={{ color: item.critique ? '#ff4444' : '#ffb300' }}>{item.critique ? 'CRITIQUE' : 'HAUTE'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl"
                  style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.25)' }}>
                  <CheckCircle2 size={22} style={{ color: '#00e676' }} />
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#00e676' }}>Véhicule 100% conforme</div>
                    <div className="text-xs mt-0.5" style={{ color: c.textSecondary }}>Aucune non-conformité — autorisation de départ validée.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
          {step !== 'info'
            ? <button onClick={() => setStep(step === 'recap' ? 'checklist' : 'info')} className="px-4 py-2 rounded-lg text-sm" style={{ background: c.bgElevated, color: c.textSecondary }}>← Retour</button>
            : <div />}
          {step === 'info' && (
            <button onClick={() => setStep('checklist')} disabled={!vehiculeId || !chauffeurId}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: vehiculeId && chauffeurId ? 'linear-gradient(135deg,#00d4ff,#0077aa)' : c.bgElevated, color: vehiculeId && chauffeurId ? '#020817' : c.textMuted }}>
              Démarrer l'inspection →
            </button>
          )}
          {step === 'checklist' && (
            <button onClick={() => setStep('recap')} disabled={totalFilled < checklistItems.length * 0.8}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: totalFilled >= checklistItems.length * 0.8 ? 'linear-gradient(135deg,#00d4ff,#0077aa)' : c.bgElevated, color: totalFilled >= checklistItems.length * 0.8 ? '#020817' : c.textMuted }}>
              Voir le récapitulatif → <span className="ml-1 text-xs opacity-70">({totalFilled}/{checklistItems.length})</span>
            </button>
          )}
          {step === 'recap' && (
            <button onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: totalNC > 0 ? 'linear-gradient(135deg,#ff4444,#cc2222)' : 'linear-gradient(135deg,#00e676,#00a854)', color: '#fff' }}>
              {totalNC > 0 ? `⚠️ Valider & créer ${totalNC} action${totalNC > 1 ? 's' : ''}` : '✓ Valider l\'inspection'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Action Row ───────────────────────────────────────────────────────────────

function ActionRow({ action, vehicles, drivers, onDelete }: {
  action: ActionCorrectrice; vehicles: Vehicle[]; drivers: Driver[];
  onDelete?: (id: string) => void;
}) {
  const { c } = useTheme();
  const v = vehicles.find(x => x.id === action.vehiculeId);
  const d = drivers.find(x => x.id === action.chauffeurId);
  const pColor = prioriteColor(action.priorite);
  const sColor = statutColor(action.statut);
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: pColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>{action.point}</div>
        <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
          {action.categorie}{v && <> · <span style={{ color: c.textSecondary }}>{v.immatriculation}</span></>}{d && <> · {d.prenom} {d.nom}</>}
        </div>
        {action.commentaire && <div className="text-xs mt-0.5 italic truncate" style={{ color: c.textMuted }}>{action.commentaire}</div>}
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs px-2 py-0.5 rounded-full mb-1 inline-block"
          style={{ background: `${pColor}15`, color: pColor, border: `1px solid ${pColor}40` }}>{action.priorite}</div>
        <div className="block text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${sColor}15`, color: sColor, border: `1px solid ${sColor}40` }}>{statutLabel(action.statut)}</div>
      </div>
      <div className="text-right text-xs flex-shrink-0" style={{ color: c.textMuted, minWidth: 72 }}>
        <Calendar size={11} className="inline mr-1" />{action.dateEcheance}
        <div className="mt-1" style={{ color: c.textFaint }}>{action.responsable?.split(' ').slice(-1)[0]}</div>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(action.id)} style={{ color: '#ff4444', flexShrink: 0 }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Driver Edit Modal ────────────────────────────────────────────────────────

function DriverEditModal({ driver, onSaved, onClose }: {
  driver: Driver; onSaved: (d: Driver) => void; onClose: () => void;
}) {
  const { c } = useTheme();
  const [status, setStatus]   = useState<Driver['status']>(driver.status);
  const [scoreG, setScoreG]   = useState(driver.scoreGlobal);
  const [scoreV, setScoreV]   = useState(driver.scoreVitesse);
  const [scoreF, setScoreF]   = useState(driver.scoreFreinage);
  const [scoreFt, setScoreFt] = useState(driver.scoreFatigue);
  const [scoreD, setScoreD]   = useState(driver.scoreDistraction);
  const [permis, setPermis]   = useState(driver.permisExpire);
  const [visite, setVisite]   = useState(driver.visiteExpire);
  const [saving, setSaving]   = useState(false);

  const scoreRows: [string, number, (v: number) => void][] = [
    ['Score global',            scoreG,  setScoreG],
    ['Vitesse & accélération',  scoreV,  setScoreV],
    ['Freinage',                scoreF,  setScoreF],
    ['Gestion fatigue',         scoreFt, setScoreFt],
    ['Distraction',             scoreD,  setScoreD],
  ];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await driverService.update(driver.id, {
        status, scoreGlobal: scoreG, scoreVitesse: scoreV,
        scoreFreinage: scoreF, scoreFatigue: scoreFt, scoreDistraction: scoreD,
        permisExpire: permis, visiteExpire: visite,
      });
      onSaved({ ...driver, status, scoreGlobal: scoreG, scoreVitesse: scoreV, scoreFreinage: scoreF, scoreFatigue: scoreFt, scoreDistraction: scoreD, permisExpire: permis, visiteExpire: visite });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-md p-6 mx-4 rounded-2xl"
        style={{ border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold" style={{ color: c.textPrimary }}>Modifier — {driver.prenom} {driver.nom}</h3>
            <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{driver.matricule}</div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>STATUT</label>
            <select value={status} onChange={e => setStatus(e.target.value as Driver['status'])}
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
              <option value="actif">Actif</option>
              <option value="repos">Repos</option>
              <option value="conge">Congé</option>
            </select>
          </div>
          {scoreRows.map(([label, val, set]) => (
            <div key={label}>
              <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: c.textMuted }}>
                <span>{label.toUpperCase()}</span>
                <span style={{ color: scoreColor(val) }}>{val}/100</span>
              </label>
              <input type="range" min={0} max={100} value={val}
                onChange={e => set(+e.target.value)} className="w-full accent-cyan-400" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>EXP. PERMIS</label>
              <input type="date" value={permis} onChange={e => setPermis(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>VISITE MÉD.</label>
              <input type="date" value={visite} onChange={e => setVisite(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textSecondary, border: `1px solid ${c.border}` }}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Incident Types & Helpers ─────────────────────────────────────────────────

type IncidentType    = 'accident_vehicule' | 'accident_travail' | 'accident_trajet' | 'incident' | 'presquaccident' | 'materiel';
type IncidentGravite = 'mortelle' | 'grave' | 'moderee' | 'legere' | 'sans_arret' | 'materiel_seul';
type IncidentStatut  = 'declare' | 'en_analyse' | 'plan_action' | 'cloture';

interface IncidentAction {
  id: string;
  description: string;
  type: 'corrective' | 'preventive';
  responsable: string;
  echeance: string;
  statut: 'ouverte' | 'en_cours' | 'cloturee';
  commentaire?: string;
}

interface Incident {
  id: string; reference: string;
  type: IncidentType; gravite: IncidentGravite; statut: IncidentStatut;
  date: string; heure: string; lieu: string;
  vehiculeId?: string; chauffeurId?: string;
  description: string; temoins: string; blesses: string; degatsMateriels: string;
  photos: string[];
  causesImmédiates: string; causesProfondees: string; facteurs: string[];
  actions: IncidentAction[];
  declarePar: string; dateDeclaration: string;
}

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  accident_vehicule: 'Accident Véhicule', accident_travail: 'Accident du Travail',
  accident_trajet: 'Accident de Trajet', incident: 'Incident',
  presquaccident: 'Presque-Accident', materiel: 'Dégât Matériel',
};
const INCIDENT_GRAVITE_LABELS: Record<IncidentGravite, string> = {
  mortelle: 'Mortelle', grave: 'Grave', moderee: 'Modérée',
  legere: 'Légère', sans_arret: 'Sans arrêt', materiel_seul: 'Matériel seulement',
};
const INCIDENT_STATUT_LABELS: Record<IncidentStatut, string> = {
  declare: 'Déclaré', en_analyse: 'En analyse', plan_action: 'Plan d\'action', cloture: 'Clôturé',
};

const graviteColor = (g: IncidentGravite) =>
  g === 'mortelle' ? '#ff0000' : g === 'grave' ? '#ff4444' : g === 'moderee' ? '#ff8844' :
  g === 'legere' ? '#ffb300' : g === 'sans_arret' ? '#00d4ff' : '#7bacc8';

const statutIncidentColor = (s: IncidentStatut) =>
  s === 'declare' ? '#ff8844' : s === 'en_analyse' ? '#ffb300' : s === 'plan_action' ? '#00d4ff' : '#00e676';

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc001', reference: 'INC-2026-001', type: 'accident_vehicule', gravite: 'moderee',
    statut: 'plan_action', date: '2026-06-10', heure: '14:30', lieu: 'RN6 — KM 42, Casablanca',
    vehiculeId: 'v1', chauffeurId: 'd2',
    description: 'Collision légère avec un véhicule léger lors d\'un dépassement sur voie rapide. Le VL a freiné brusquement, distance de sécurité insuffisante.',
    temoins: 'Mohammed ALAMI (C-0031)', blesses: 'Aucun blessé', degatsMateriels: 'Aile avant gauche + pare-choc endommagés',
    photos: ['IMG_collision_avant.jpg', 'IMG_degat_parechoc.jpg'],
    causesImmédiates: 'Freinage brusque du VL devant, distance de sécurité insuffisante',
    causesProfondees: '1. Pourquoi la distance était insuffisante ? → Trafic dense\n2. Pourquoi pas d\'adaptation ? → Sensibilisation insuffisante conduite préventive\n3. Pourquoi insuffisante ? → Absence de module dédié dans le plan de formation\n4. Pourquoi pas de module ? → Plan de formation non révisé depuis 2023\n5. Pourquoi ? → Procédure de révision annuelle non appliquée',
    facteurs: ['humain', 'organisationnel'],
    actions: [
      { id: 'a1', description: 'Formation conduite préventive pour tous les conducteurs (8h)', type: 'preventive', responsable: 'Resp. RH', echeance: '2026-07-30', statut: 'en_cours' },
      { id: 'a2', description: 'Mise à jour plan de formation annuel + module conduite', type: 'corrective', responsable: 'Resp. HSE', echeance: '2026-07-15', statut: 'ouverte' },
      { id: 'a3', description: 'Rappel sécurité routière en réunion mensuelle', type: 'preventive', responsable: 'Chef de Parc', echeance: '2026-07-05', statut: 'cloturee', commentaire: 'Réunion tenue le 03/07' },
    ],
    declarePar: 'Chef de Parc', dateDeclaration: '2026-06-10',
  },
  {
    id: 'inc002', reference: 'INC-2026-002', type: 'presquaccident', gravite: 'sans_arret',
    statut: 'en_analyse', date: '2026-06-18', heure: '09:15', lieu: 'Dépôt — Zone de chargement B',
    vehiculeId: undefined, chauffeurId: 'd1',
    description: 'Presque chute lors de la descente de cabine — marche antidérapante défaillante et glissante après les intempéries.',
    temoins: 'Chef de quai Ahmed OUALI', blesses: 'Aucun', degatsMateriels: 'Aucun',
    photos: ['marche_defaillante.jpg'],
    causesImmédiates: 'Marche antidérapante usée, surface glissante après pluie',
    causesProfondees: '', facteurs: ['materiel', 'environnement'],
    actions: [], declarePar: 'Karim BENALI', dateDeclaration: '2026-06-18',
  },
  {
    id: 'inc003', reference: 'INC-2026-003', type: 'accident_travail', gravite: 'legere',
    statut: 'cloture', date: '2026-05-22', heure: '11:00', lieu: 'Entrepôt — Zone de stockage C',
    vehiculeId: undefined, chauffeurId: undefined,
    description: 'Coupure légère à la main lors de la manipulation de cerclages métalliques sans port des gants de protection requis.',
    temoins: 'Chef d\'équipe logistique', blesses: 'Opérateur : coupure superficielle main droite, soins infirmerie', degatsMateriels: 'Aucun',
    photos: [],
    causesImmédiates: 'Absence d\'EPI (gants anti-coupure) — stock vide non réapprovisionné',
    causesProfondees: '1. Absence de gants → Stock EPI vide\n2. Stock vide → Commande non passée\n3. Commande non passée → Procédure suivi stock défaillante\n4. Procédure défaillante → Aucun responsable désigné\n5. Absence responsable → Organisation HSE incomplète',
    facteurs: ['humain', 'organisationnel', 'materiel'],
    actions: [
      { id: 'a4', description: 'Réapprovisionnement stock EPI — gants anti-coupure niveau B', type: 'corrective', responsable: 'Resp. Achats', echeance: '2026-06-01', statut: 'cloturee', commentaire: 'Stock réapprovisionné le 28/05' },
      { id: 'a5', description: 'Désignation d\'un responsable suivi stock EPI', type: 'corrective', responsable: 'Resp. HSE', echeance: '2026-06-15', statut: 'cloturee', commentaire: 'M. RACHIDI désigné le 12/06' },
      { id: 'a6', description: 'Affichage rappel port obligatoire EPI aux postes de travail', type: 'preventive', responsable: 'Chef d\'équipe', echeance: '2026-06-30', statut: 'cloturee', commentaire: 'Affiches installées' },
    ],
    declarePar: 'Responsable HSE', dateDeclaration: '2026-05-22',
  },
];

// ─── Incident Declaration Modal ──────────────────────────────────────────────

function IncidentDeclarationModal({ onClose, onSubmit, vehicles, drivers }: {
  onClose: () => void;
  onSubmit: (inc: Incident) => void;
  vehicles: Vehicle[]; drivers: Driver[];
}) {
  const { c } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType]       = useState<IncidentType>('incident');
  const [gravite, setGravite] = useState<IncidentGravite>('legere');
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [heure, setHeure]     = useState(new Date().toTimeString().slice(0, 5));
  const [lieu, setLieu]       = useState('');
  const [vehiculeId, setVehiculeId] = useState('');
  const [chauffeurId, setChauffeurId] = useState('');
  const [declarePar, setDeclarePar]  = useState('');
  const [description, setDescription] = useState('');
  const [blesses, setBlesses]         = useState('Aucun');
  const [degatsMateriels, setDegatsMateriels] = useState('Aucun');
  const [temoins, setTemoins] = useState('');
  const [photos, setPhotos]   = useState<string[]>([]);

  const step1OK = lieu.trim().length > 0 && declarePar.trim().length > 0;
  const step2OK = description.trim().length > 10;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos(prev => [...prev, ...files.map(f => f.name)]);
  };

  const handleSubmit = () => {
    const seq = String(Math.floor(Math.random() * 900) + 100);
    const year = new Date().getFullYear();
    const inc: Incident = {
      id: `inc_${Date.now()}`, reference: `INC-${year}-${seq}`,
      type, gravite, statut: 'declare', date, heure, lieu,
      vehiculeId: vehiculeId || undefined, chauffeurId: chauffeurId || undefined,
      description, blesses, degatsMateriels, temoins, photos,
      causesImmédiates: '', causesProfondees: '', facteurs: [],
      actions: [], declarePar, dateDeclaration: date,
    };
    onSubmit(inc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4"
        style={{ border: `1px solid ${c.borderStrong}`, borderRadius: 16 }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <div className="font-semibold" style={{ color: c.textPrimary }}>Déclarer un Accident / Incident</div>
            <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>Déclaration immédiate — Réf. For-HSE-ACC-01</div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {([{ n: 1, label: 'Identification' }, { n: 2, label: 'Circonstances' }, { n: 3, label: 'Photos & Récap' }] as const).map(({ n, label }, i) => (
            <div key={n} className="flex items-center">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                style={{ background: step >= n ? '#ff8844' : c.border, color: step >= n ? '#020817' : c.textMuted }}>{n}</div>
              <div className="text-xs ml-1.5 mr-4" style={{ color: step === n ? c.textPrimary : c.textMuted }}>{label}</div>
              {i < 2 && <div className="w-8 h-px mr-4" style={{ background: c.border }} />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>TYPE D'ÉVÉNEMENT</label>
                  <select value={type} onChange={e => setType(e.target.value as IncidentType)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                    {(Object.entries(INCIDENT_TYPE_LABELS) as [IncidentType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>GRAVITÉ</label>
                  <select value={gravite} onChange={e => setGravite(e.target.value as IncidentGravite)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: graviteColor(gravite) }}>
                    {(Object.entries(INCIDENT_GRAVITE_LABELS) as [IncidentGravite, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>DATE</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>HEURE</label>
                  <input type="time" value={heure} onChange={e => setHeure(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>LIEU DE L'ÉVÉNEMENT *</label>
                <input value={lieu} onChange={e => setLieu(e.target.value)}
                  placeholder="Ex : RN1 — KM 56, Dépôt zone B, Site client..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>VÉHICULE IMPLIQUÉ</label>
                  <select value={vehiculeId} onChange={e => setVehiculeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                    <option value="">Aucun / N/A</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>CONDUCTEUR / PERSONNE</label>
                  <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                    <option value="">Non applicable</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>DÉCLARÉ PAR *</label>
                <input value={declarePar} onChange={e => setDeclarePar(e.target.value)}
                  placeholder="Nom et fonction du déclarant..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              {(gravite === 'mortelle' || gravite === 'grave') && (
                <div className="px-3 py-3 rounded-lg" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)' }}>
                  <div className="font-semibold text-sm" style={{ color: '#ff4444' }}>🚨 Événement grave — Procédure d'urgence</div>
                  <div className="text-xs mt-1" style={{ color: c.textSecondary }}>
                    Alerter immédiatement la Direction et le Responsable HSE. Déclaration CNSS obligatoire sous 48h.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>DESCRIPTION DES FAITS * (min. 10 caractères)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={4} placeholder="Décrire précisément les circonstances, le déroulement, les conditions..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                <div className="text-xs mt-1 text-right" style={{ color: description.length < 10 ? '#ff4444' : c.textFaint }}>
                  {description.length} caractères
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>BLESSÉS / VICTIMES</label>
                <input value={blesses} onChange={e => setBlesses(e.target.value)}
                  placeholder="Ex : Aucun / Conducteur: contusion épaule gauche..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>DÉGÂTS MATÉRIELS</label>
                <input value={degatsMateriels} onChange={e => setDegatsMateriels(e.target.value)}
                  placeholder="Ex : Aucun / Pare-choc avant + aile gauche..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>TÉMOINS</label>
                <input value={temoins} onChange={e => setTemoins(e.target.value)}
                  placeholder="Nom et contact des témoins éventuels..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>PHOTOS / PIÈCES JOINTES</label>
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl cursor-pointer transition-all"
                  style={{ background: c.bgElevated, border: `2px dashed ${c.borderStrong}` }}>
                  <Camera size={24} style={{ color: c.textFaint }} />
                  <span className="text-sm" style={{ color: c.textSecondary }}>Cliquer pour ajouter des photos</span>
                  <span className="text-xs" style={{ color: c.textMuted }}>JPG, PNG, PDF — max 10 Mo chacun</span>
                  <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handlePhotoChange} />
                </label>
                {photos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {photos.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                        <Camera size={11} style={{ color: c.accent, flexShrink: 0 }} />
                        <span style={{ color: c.textSecondary, flex: 1 }}>{p}</span>
                        <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} style={{ color: '#ff4444' }}><X size={11} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.borderStrong}` }}>
                <div className="px-4 py-2.5 text-xs font-semibold" style={{ background: c.bgElevated, color: c.textMuted, borderBottom: `1px solid ${c.border}` }}>
                  RÉCAPITULATIF
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { label: 'Type', value: INCIDENT_TYPE_LABELS[type] },
                    { label: 'Gravité', value: INCIDENT_GRAVITE_LABELS[gravite], color: graviteColor(gravite) },
                    { label: 'Date / Heure', value: `${date} à ${heure}` },
                    { label: 'Lieu', value: lieu },
                    { label: 'Déclaré par', value: declarePar },
                    { label: 'Blessés', value: blesses },
                    { label: 'Photos', value: `${photos.length} fichier(s)` },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-xs flex-shrink-0" style={{ color: c.textMuted }}>{label}</span>
                      <span className="text-xs font-medium text-right" style={{ color: color || c.textSecondary }}>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${c.border}` }}>
          {step > 1
            ? <button onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textSecondary }}>← Retour</button>
            : <div />}
          {step < 3 && (
            <button onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              disabled={step === 1 ? !step1OK : !step2OK}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: (step === 1 ? step1OK : step2OK) ? 'linear-gradient(135deg,#ff8844,#cc4400)' : c.bgElevated, color: (step === 1 ? step1OK : step2OK) ? '#fff' : c.textMuted }}>
              Suivant →
            </button>
          )}
          {step === 3 && (
            <button onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#ff8844,#cc4400)', color: '#fff' }}>
              ✓ Enregistrer la déclaration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Incident Detail Modal ────────────────────────────────────────────────────

function IncidentDetailModal({ incident: initInc, onClose, onUpdate, vehicles, drivers }: {
  incident: Incident; onClose: () => void;
  onUpdate: (inc: Incident) => void;
  vehicles: Vehicle[]; drivers: Driver[];
}) {
  const { c } = useTheme();
  const [inc, setInc] = useState<Incident>(initInc);
  const [activeTab, setActiveTab] = useState<'declaration' | 'analyse' | 'actions'>('declaration');
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({ type: initInc.type, gravite: initInc.gravite, date: initInc.date, heure: initInc.heure, lieu: initInc.lieu, vehiculeId: initInc.vehiculeId ?? '', chauffeurId: initInc.chauffeurId ?? '', declarePar: initInc.declarePar, description: initInc.description, blesses: initInc.blesses, degatsMateriels: initInc.degatsMateriels, temoins: initInc.temoins });
  const [newAction, setNewAction] = useState({ description: '', type: 'corrective' as 'corrective' | 'preventive', responsable: '', echeance: '' });
  const [deleteActionId, setDeleteActionId] = useState<string | null>(null);

  const gColor = graviteColor(inc.gravite);
  const sColor = statutIncidentColor(inc.statut);

  const save = (updated: Incident) => { setInc(updated); onUpdate(updated); };

  const advanceStatut = () => {
    const flow: IncidentStatut[] = ['declare', 'en_analyse', 'plan_action', 'cloture'];
    const idx = flow.indexOf(inc.statut);
    if (idx < flow.length - 1) save({ ...inc, statut: flow[idx + 1] });
  };

  const addAction = () => {
    if (!newAction.description || !newAction.responsable || !newAction.echeance) return;
    const action: IncidentAction = { id: `a_${Date.now()}`, ...newAction, statut: 'ouverte' };
    save({ ...inc, actions: [...inc.actions, action] });
    setNewAction({ description: '', type: 'corrective', responsable: '', echeance: '' });
  };

  const toggleActionStatut = (id: string) => {
    const flow: IncidentAction['statut'][] = ['ouverte', 'en_cours', 'cloturee'];
    save({ ...inc, actions: inc.actions.map(a => a.id !== id ? a : { ...a, statut: flow[(flow.indexOf(a.statut) + 1) % flow.length] }) });
  };

  const removeAction = (id: string) => {
    save({ ...inc, actions: inc.actions.filter(a => a.id !== id) });
    setDeleteActionId(null);
  };

  const saveEditFields = () => {
    const updated: Incident = {
      ...inc,
      type:            editFields.type,
      gravite:         editFields.gravite,
      date:            editFields.date,
      heure:           editFields.heure,
      lieu:            editFields.lieu,
      vehiculeId:      editFields.vehiculeId || undefined,
      chauffeurId:     editFields.chauffeurId || undefined,
      declarePar:      editFields.declarePar,
      description:     editFields.description,
      blesses:         editFields.blesses,
      degatsMateriels: editFields.degatsMateriels,
      temoins:         editFields.temoins,
    };
    save(updated);
    setEditMode(false);
  };

  const FACTEURS = ['humain', 'materiel', 'environnement', 'organisationnel', 'technique'];
  const vehicle = vehicles.find(v => v.id === inc.vehiculeId);
  const driver  = drivers.find(d => d.id === inc.chauffeurId);
  const openActions = inc.actions.filter(a => a.statut !== 'cloturee').length;
  const progress = inc.actions.length > 0
    ? Math.round((inc.actions.filter(a => a.statut === 'cloturee').length / inc.actions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-lg h-full overflow-hidden flex flex-col"
        style={{ border: `1px solid ${c.borderStrong}`, borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: `${gColor}15`, color: gColor, border: `1px solid ${gColor}40` }}>
                  {INCIDENT_TYPE_LABELS[inc.type]}
                </span>
                <span className="text-xs font-mono" style={{ color: c.textMuted }}>{inc.reference}</span>
              </div>
              <div className="text-sm font-semibold mt-1.5" style={{ color: c.textPrimary }}>
                {inc.date} à {inc.heure} — {inc.lieu}
              </div>
            </div>
            <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${gColor}12`, color: gColor, border: `1px solid ${gColor}30` }}>
              ⚡ {INCIDENT_GRAVITE_LABELS[inc.gravite]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${sColor}12`, color: sColor, border: `1px solid ${sColor}30` }}>
              {INCIDENT_STATUT_LABELS[inc.statut]}
            </span>
            {inc.statut !== 'cloture' && (
              <button onClick={advanceStatut}
                className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                → Avancer statut
              </button>
            )}
          </div>
        </div>

        <div className="flex px-5 pt-3 pb-0 gap-1 flex-shrink-0">
          {([
            { key: 'declaration', label: '📋 Déclaration' },
            { key: 'analyse',     label: '🔍 Analyse' },
            { key: 'actions',     label: `📌 Plan d'action${inc.actions.length ? ` (${inc.actions.length})` : ''}` },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="px-3 py-2 rounded-t-lg text-xs font-medium transition-all"
              style={{ background: activeTab === key ? c.accentBg : 'transparent', color: activeTab === key ? c.accent : c.textMuted, borderBottom: activeTab === key ? `2px solid ${c.accent}` : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: c.border, margin: '0 20px' }} />

        <div className="flex-1 overflow-y-auto p-5">

          {activeTab === 'declaration' && (
            <div className="space-y-4">
              {/* Toolbar lecture/édition */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: c.textMuted }}>
                  {editMode ? '✏️ MODE ÉDITION' : 'FICHE DE DÉCLARATION'}
                </span>
                {!editMode
                  ? <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                      <Pencil size={11} /> Modifier
                    </button>
                  : <div className="flex items-center gap-2">
                      <button onClick={() => setEditMode(false)}
                        className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
                        Annuler
                      </button>
                      <button onClick={saveEditFields}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'linear-gradient(135deg,#ff8844,#cc4400)', color: '#fff' }}>
                        ✓ Sauvegarder
                      </button>
                    </div>
                }
              </div>

              {!editMode ? (
                <>
                  <div className="px-4 py-3 rounded-xl space-y-2" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                    {[
                      { label: 'Lieu', value: inc.lieu },
                      { label: 'Déclaré par', value: inc.declarePar },
                      { label: 'Date / Heure', value: `${inc.date} à ${inc.heure}` },
                      { label: 'Véhicule', value: vehicle ? `${vehicle.immatriculation} — ${vehicle.marque}` : '—' },
                      { label: 'Conducteur', value: driver ? `${driver.prenom} ${driver.nom}` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4">
                        <span className="text-xs flex-shrink-0" style={{ color: c.textMuted }}>{label}</span>
                        <span className="text-xs font-medium text-right" style={{ color: c.textSecondary }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>DESCRIPTION DES FAITS</div>
                    <div className="px-3 py-3 rounded-lg text-sm leading-relaxed"
                      style={{ background: c.bgElevated, color: c.textSecondary, border: `1px solid ${c.border}` }}>
                      {inc.description}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-semibold mb-1.5" style={{ color: c.textMuted }}>BLESSÉS</div>
                      <div className="px-3 py-2.5 rounded-lg text-xs"
                        style={{ background: inc.blesses !== 'Aucun' ? 'rgba(255,68,68,0.06)' : c.bgElevated, border: `1px solid ${inc.blesses !== 'Aucun' ? 'rgba(255,68,68,0.2)' : c.border}`, color: inc.blesses !== 'Aucun' ? '#ff9999' : '#00e676' }}>
                        {inc.blesses}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-1.5" style={{ color: c.textMuted }}>DÉGÂTS MATÉRIELS</div>
                      <div className="px-3 py-2.5 rounded-lg text-xs"
                        style={{ background: inc.degatsMateriels !== 'Aucun' ? 'rgba(255,179,0,0.06)' : c.bgElevated, border: `1px solid ${inc.degatsMateriels !== 'Aucun' ? 'rgba(255,179,0,0.2)' : c.border}`, color: inc.degatsMateriels !== 'Aucun' ? '#ffb300' : '#00e676' }}>
                        {inc.degatsMateriels}
                      </div>
                    </div>
                  </div>
                  {inc.temoins && (
                    <div>
                      <div className="text-xs font-semibold mb-1.5" style={{ color: c.textMuted }}>TÉMOINS</div>
                      <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>{inc.temoins}</div>
                    </div>
                  )}
                  {inc.photos.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>PHOTOS ({inc.photos.length})</div>
                      <div className="space-y-1">
                        {inc.photos.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                            style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                            <Camera size={11} style={{ color: c.accent }} />
                            <span style={{ color: c.textSecondary }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── Mode édition ── */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>TYPE</label>
                      <select value={editFields.type} onChange={e => setEditFields(p => ({ ...p, type: e.target.value as IncidentType }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                        {(Object.entries(INCIDENT_TYPE_LABELS) as [IncidentType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>GRAVITÉ</label>
                      <select value={editFields.gravite} onChange={e => setEditFields(p => ({ ...p, gravite: e.target.value as IncidentGravite }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: graviteColor(editFields.gravite) }}>
                        {(Object.entries(INCIDENT_GRAVITE_LABELS) as [IncidentGravite, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>DATE</label>
                      <input type="date" value={editFields.date} onChange={e => setEditFields(p => ({ ...p, date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>HEURE</label>
                      <input type="time" value={editFields.heure} onChange={e => setEditFields(p => ({ ...p, heure: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>LIEU</label>
                    <input value={editFields.lieu} onChange={e => setEditFields(p => ({ ...p, lieu: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>VÉHICULE</label>
                      <select value={editFields.vehiculeId} onChange={e => setEditFields(p => ({ ...p, vehiculeId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                        <option value="">Aucun</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>CONDUCTEUR</label>
                      <select value={editFields.chauffeurId} onChange={e => setEditFields(p => ({ ...p, chauffeurId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}>
                        <option value="">Aucun</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>DÉCLARÉ PAR</label>
                    <input value={editFields.declarePar} onChange={e => setEditFields(p => ({ ...p, declarePar: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>DESCRIPTION</label>
                    <textarea value={editFields.description} onChange={e => setEditFields(p => ({ ...p, description: e.target.value }))}
                      rows={3} className="w-full px-3 py-2 rounded-lg text-xs resize-none"
                      style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>BLESSÉS</label>
                      <input value={editFields.blesses} onChange={e => setEditFields(p => ({ ...p, blesses: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>DÉGÂTS MAT.</label>
                      <input value={editFields.degatsMateriels} onChange={e => setEditFields(p => ({ ...p, degatsMateriels: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs"
                        style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: c.textMuted }}>TÉMOINS</label>
                    <input value={editFields.temoins} onChange={e => setEditFields(p => ({ ...p, temoins: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyse' && (
            <div className="space-y-4">
              <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <span style={{ color: c.accent }}>💡 Méthode :</span>
                <span style={{ color: c.textSecondary }}> Causes immédiates (Quoi?) → 5 Pourquoi (Pourquoi?) → Facteurs contributifs</span>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>CAUSES IMMÉDIATES</label>
                <textarea value={inc.causesImmédiates} onChange={e => save({ ...inc, causesImmédiates: e.target.value })}
                  rows={2} placeholder="Qu'est-ce qui a directement causé l'événement ? (acte ou condition)"
                  className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>ANALYSE 5 POURQUOI</label>
                <textarea value={inc.causesProfondees} onChange={e => save({ ...inc, causesProfondees: e.target.value })}
                  rows={6}
                  placeholder={'1. Pourquoi … ? → …\n2. Pourquoi … ? → …\n3. Pourquoi … ? → …\n4. Pourquoi … ? → …\n5. Pourquoi … ? → … (cause racine)'}
                  className="w-full px-3 py-2.5 rounded-lg text-sm resize-none font-mono"
                  style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: c.textMuted }}>FACTEURS CONTRIBUTIFS</label>
                <div className="flex flex-wrap gap-2">
                  {FACTEURS.map(f => {
                    const active = inc.facteurs.includes(f);
                    return (
                      <button key={f}
                        onClick={() => save({ ...inc, facteurs: active ? inc.facteurs.filter(x => x !== f) : [...inc.facteurs, f] })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                        style={{ background: active ? 'rgba(255,136,68,0.15)' : c.bgElevated, color: active ? '#ff8844' : c.textMuted, border: `1px solid ${active ? 'rgba(255,136,68,0.4)' : c.border}` }}>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: c.textMuted }}>NIVEAU DE RISQUE</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: `${gColor}08`, border: `1px solid ${gColor}25` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0"
                    style={{ background: `${gColor}20`, color: gColor }}>
                    {inc.gravite === 'mortelle' ? 'E' : inc.gravite === 'grave' ? 'D' : inc.gravite === 'moderee' ? 'C' : inc.gravite === 'legere' ? 'B' : 'A'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: gColor }}>{INCIDENT_GRAVITE_LABELS[inc.gravite]}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      {inc.gravite === 'mortelle' ? 'Risque extrême — arrêt immédiat + signalement autorités' :
                       inc.gravite === 'grave' ? 'Risque élevé — action corrective immédiate obligatoire' :
                       inc.gravite === 'moderee' ? 'Risque modéré — plan d\'action sous 48h' :
                       inc.gravite === 'legere' ? 'Risque faible — traitement sous 7 jours' : 'Risque négligeable'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              {inc.actions.length > 0 && (
                <div className="px-4 py-3 rounded-xl" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: c.textSecondary }}>Progression du plan d'action</span>
                    <span className="font-bold" style={{ color: progress >= 100 ? '#00e676' : '#00d4ff' }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: c.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress >= 100 ? '#00e676' : '#00d4ff' }} />
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: c.textMuted }}>
                    {inc.actions.filter(a => a.statut === 'cloturee').length}/{inc.actions.length} actions clôturées
                    {openActions > 0 && <span style={{ color: '#ffb300' }}> · {openActions} en attente</span>}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {inc.actions.map(a => {
                  const aColor = a.statut === 'cloturee' ? '#00e676' : a.statut === 'en_cours' ? '#ffb300' : '#4a7a9b';
                  return (
                    <div key={a.id} className="px-3 py-3 rounded-xl"
                      style={{ background: c.bgElevated, border: `1px solid ${a.statut === 'cloturee' ? 'rgba(0,230,118,0.2)' : c.border}` }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                              style={{ background: a.type === 'corrective' ? 'rgba(255,68,68,0.12)' : 'rgba(0,212,255,0.1)', color: a.type === 'corrective' ? '#ff8888' : '#00d4ff' }}>
                              {a.type}
                            </span>
                          </div>
                          <div className="text-xs font-medium" style={{ color: c.textPrimary }}>{a.description}</div>
                          <div className="text-xs mt-1" style={{ color: c.textMuted }}>{a.responsable} · Échéance {a.echeance}</div>
                          {a.commentaire && <div className="text-xs mt-0.5 italic" style={{ color: c.textFaint }}>{a.commentaire}</div>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => toggleActionStatut(a.id)}
                            className="text-xs px-2 py-1 rounded-lg font-bold"
                            style={{ background: `${aColor}12`, color: aColor, border: `1px solid ${aColor}30` }}>
                            {a.statut === 'cloturee' ? '✓' : a.statut === 'en_cours' ? '⟳' : '○'}
                          </button>
                          <button onClick={() => setDeleteActionId(a.id)}
                            className="p-1 rounded-lg"
                            style={{ color: '#ff4444' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.borderStrong}` }}>
                <div className="px-4 py-2.5 text-xs font-semibold" style={{ background: c.bgElevated, color: c.textMuted, borderBottom: `1px solid ${c.border}` }}>
                  + NOUVELLE ACTION
                </div>
                <div className="p-4 space-y-3">
                  <textarea value={newAction.description} onChange={e => setNewAction(p => ({ ...p, description: e.target.value }))}
                    rows={2} placeholder="Description de l'action à mener..."
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newAction.type} onChange={e => setNewAction(p => ({ ...p, type: e.target.value as 'corrective' | 'preventive' }))}
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }}>
                      <option value="corrective">Corrective</option>
                      <option value="preventive">Préventive</option>
                    </select>
                    <input type="date" value={newAction.echeance} onChange={e => setNewAction(p => ({ ...p, echeance: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }} />
                  </div>
                  <div className="flex gap-2">
                    <input value={newAction.responsable} onChange={e => setNewAction(p => ({ ...p, responsable: e.target.value }))}
                      placeholder="Responsable..."
                      className="flex-1 px-3 py-2 rounded-lg text-xs"
                      style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textPrimary }} />
                    <button onClick={addAction}
                      disabled={!newAction.description || !newAction.responsable || !newAction.echeance}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: newAction.description && newAction.responsable && newAction.echeance ? 'linear-gradient(135deg,#ff8844,#cc4400)' : c.bgElevated, color: newAction.description && newAction.responsable && newAction.echeance ? '#fff' : c.textMuted }}>
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        {/* Dialog suppression action */}
        {deleteActionId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="rounded-2xl p-5 mx-4 max-w-xs w-full"
              style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
              <h3 className="font-bold mb-1.5" style={{ color: c.textPrimary }}>Supprimer l'action ?</h3>
              <p className="text-xs mb-4" style={{ color: c.textSecondary }}>Cette opération est irréversible.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteActionId(null)} className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
                <button onClick={() => removeAction(deleteActionId)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>Supprimer</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Accidents Tab ────────────────────────────────────────────────────────────

function AccidentsTab({ incidents, onDeclare, onSelect, onDelete, vehicles, drivers, loading, demoMode }: {
  incidents: Incident[];
  onDeclare: () => void;
  onSelect: (inc: Incident) => void;
  onDelete: (id: string) => void;
  vehicles: Vehicle[]; drivers: Driver[];
  loading?: boolean;
  demoMode?: boolean;
}) {
  const { c } = useTheme();
  const [statutFilter, setStatutFilter] = useState<IncidentStatut | 'all'>('all');

  const filtered = incidents.filter(inc => statutFilter === 'all' || inc.statut === statutFilter);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = incidents.filter(i => i.date.startsWith(thisMonth)).length;
  const enAttente = incidents.filter(i => i.statut === 'declare' || i.statut === 'en_analyse').length;
  const openActions = incidents.reduce((s, i) => s + i.actions.filter(a => a.statut !== 'cloturee').length, 0);
  const graves = incidents.filter(i => i.gravite === 'mortelle' || i.gravite === 'grave').length;

  if (loading) return (
    <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-secondary)' }}>
      <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Chargement des incidents…
    </div>
  );

  return (
    <div className="space-y-5">
      {demoMode && (
        <div style={{ background: 'rgba(255,183,77,0.12)', border: '1px solid rgba(255,183,77,0.35)', borderRadius: 10, padding: '10px 16px', color: '#ffb74d', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} />
          <span>
            <strong>Mode démo</strong> — Tables Supabase non trouvées. Les données ci-dessous sont fictives et non persistées.
            Exécutez <code style={{ background: 'rgba(255,183,77,0.2)', borderRadius: 4, padding: '1px 6px' }}>supabase/migrations/20260629_incidents.sql</code> dans votre dashboard Supabase pour activer la persistance.
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total déclarés" value={incidents.length}
          icon={AlertTriangle} iconColor="#ff8844" iconBg="rgba(255,136,68,0.12)"
          trendLabel="Accidents & incidents" />
        <KPICard label="Ce mois-ci" value={thisMonthCount}
          icon={Calendar} iconColor="#ffb300" iconBg={c.warningBg}
          trendLabel="Nouvelles déclarations" />
        <KPICard label="En attente analyse" value={enAttente}
          icon={Search} iconColor="#00d4ff" iconBg={c.accentBg}
          glowClass={enAttente > 0 ? 'glow-warning' : ''}
          trendLabel="Déclarés + En analyse" />
        <KPICard label="Actions ouvertes" value={openActions}
          icon={ClipboardCheck} iconColor={openActions > 0 ? '#ff4444' : '#00e676'} iconBg={openActions > 0 ? c.dangerBg : c.successBg}
          glowClass={openActions > 2 ? 'glow-danger' : ''}
          trendLabel="Plans d'action en cours" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 flex-wrap">
          {(['all', 'declare', 'en_analyse', 'plan_action', 'cloture'] as const).map(f => (
            <button key={f} onClick={() => setStatutFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: statutFilter === f ? 'rgba(255,136,68,0.15)' : c.bgElevated, color: statutFilter === f ? '#ff8844' : c.textMuted, border: `1px solid ${statutFilter === f ? 'rgba(255,136,68,0.4)' : c.border}` }}>
              {f === 'all' ? `Tous (${incidents.length})` : `${INCIDENT_STATUT_LABELS[f]} (${incidents.filter(i => i.statut === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {graves > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>
              🚨 {graves} événement{graves > 1 ? 's' : ''} grave{graves > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={onDeclare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg,#ff8844,#cc4400)', color: '#fff', boxShadow: '0 4px 20px rgba(255,136,68,0.3)' }}>
            <Plus size={15} />
            Déclarer un accident / incident
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
          <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Registre des accidents & incidents</span>
          <span className="text-xs" style={{ color: c.textMuted }}>{filtered.length} enregistrement{filtered.length > 1 ? 's' : ''}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <AlertTriangle size={32} style={{ color: c.textFaint, margin: '0 auto 12px' }} />
            <div className="text-sm" style={{ color: c.textMuted }}>Aucun événement enregistré</div>
            <div className="text-xs mt-1" style={{ color: c.textFaint }}>Cliquez sur "Déclarer" pour enregistrer un premier événement</div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: `${c.border}26` }}>
            {filtered.map(inc => {
              const iGColor = graviteColor(inc.gravite);
              const iSColor = statutIncidentColor(inc.statut);
              const v = vehicles.find(x => x.id === inc.vehiculeId);
              const d = drivers.find(x => x.id === inc.chauffeurId);
              const openAct = inc.actions.filter(a => a.statut !== 'cloturee').length;
              return (
                <div key={inc.id} className="flex items-center gap-4 px-5 py-3.5 cursor-pointer table-row-hover" onClick={() => onSelect(inc)}>
                  <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: iGColor }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${iGColor}12`, border: `1.5px solid ${iGColor}30` }}>
                    {inc.type === 'accident_vehicule' ? '🚛' : inc.type === 'accident_travail' ? '👷' : inc.type === 'presquaccident' ? '⚠️' : inc.type === 'materiel' ? '🔧' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>{INCIDENT_TYPE_LABELS[inc.type]}</span>
                      <span className="text-xs font-mono" style={{ color: c.textFaint }}>{inc.reference}</span>
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>
                      {inc.date} à {inc.heure} · {inc.lieu}
                      {d && <> · <span style={{ color: c.textSecondary }}>{d.prenom} {d.nom}</span></>}
                      {v && !d && <> · <span style={{ color: c.textSecondary }}>{v.immatriculation}</span></>}
                    </div>
                    <div className="text-xs mt-0.5 truncate italic" style={{ color: c.textFaint }}>
                      {inc.description.slice(0, 80)}{inc.description.length > 80 ? '…' : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${iGColor}12`, color: iGColor, border: `1px solid ${iGColor}30` }}>
                      {INCIDENT_GRAVITE_LABELS[inc.gravite]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${iSColor}12`, color: iSColor, border: `1px solid ${iSColor}30` }}>
                      {INCIDENT_STATUT_LABELS[inc.statut]}
                    </span>
                    {openAct > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,179,0,0.12)', color: '#ffb300' }}>
                        {openAct} action{openAct > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onSelect(inc)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ background: c.accentBg, border: `1px solid ${c.accentBorder}` }}
                      title="Voir / modifier">
                      <Pencil size={12} style={{ color: c.accent }} />
                    </button>
                    <button onClick={() => onDelete(inc.id)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}
                      title="Supprimer">
                      <Trash2 size={12} style={{ color: '#ff4444' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'scoring' | 'checklist' | 'qse' | 'accidents';

export default function Securite() {
  const { c } = useTheme();
  const [tab, setTab] = useState<Tab>('qse');

  // Remote data
  const { data: driversData,      loading: ld, error: ed } = useDrivers();
  const { data: alertsData,       loading: la, error: ea } = useAlerts();
  const { data: vehiclesData,     loading: lv, error: ev } = useVehicles();
  const { data: checklistData,    loading: lck }           = useChecklistItems();
  const { data: inspectionsData,  loading: li }            = useInspections();
  const { data: actionsData,      loading: lac }           = useActions();
  const { data: conformiteData }                           = useConformiteTrend();

  const loading = ld || la || lv || lck || li || lac;
  const error   = ed || ea || ev;

  const safeDrivers      = driversData      ?? [];
  const safeVehicles     = vehiclesData     ?? [];
  const safeChecklist    = checklistData    ?? [];
  const safeConformite   = conformiteData   ?? [];

  // Local synced state
  const [localDrivers, setLocalDrivers] = useState<Driver[]>([]);
  const [localAlerts, setLocalAlerts]   = useState<Alert[]>([]);
  useEffect(() => { if (driversData) setLocalDrivers(driversData); }, [driversData]);
  useEffect(() => { if (alertsData)  setLocalAlerts(alertsData);  }, [alertsData]);

  // Driver CRUD state
  const [editDriver, setEditDriver]         = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null);

  const handleDriverSaved = (d: Driver) => {
    setLocalDrivers(prev => prev.map(x => x.id === d.id ? d : x));
    setShowDriverModal(false); setEditDriver(null);
  };

  const handleDeleteDriver = () => {
    if (!deleteDriverId) return;
    const id = deleteDriverId;
    setDeleteDriverId(null);
    setLocalDrivers(prev => prev.filter(d => d.id !== id));
    driverService.delete(id).catch(e => console.error('delete driver', e));
  };

  // Scoring state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critique' | 'warning' | 'info'>('all');

  // Checklist state
  const [allInspections, setAllInspections] = useState<Inspection[]>([]);
  const [allActions, setAllActions]         = useState<ActionCorrectrice[]>([]);
  const [showForm, setShowForm]             = useState(false);
  const [actionFilter, setActionFilter]     = useState<ActionStatut | 'all'>('all');
  const [prioriteFilter, setPrioriteFilter] = useState<ActionPriorite | 'all'>('all');
  const [selectedInspId, setSelectedInspId] = useState<string | null>(null);
  const [diagramInsp, setDiagramInsp]       = useState<Inspection | null>(null);

  // Sync from remote
  useEffect(() => { if (inspectionsData) setAllInspections(inspectionsData); }, [inspectionsData]);
  useEffect(() => { if (actionsData)     setAllActions(actionsData); },         [actionsData]);

  // Delete state
  const [deleteInspId,   setDeleteInspId]   = useState<string | null>(null);
  const [deleteActionId, setDeleteActionId] = useState<string | null>(null);

  // Accidents/Incidents state
  const [incidents, setIncidents]               = useState<Incident[]>([]);
  const [incidentsLoaded, setIncidentsLoaded]   = useState(false);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentsDemoMode, setIncidentsDemoMode] = useState(false);
  const [showDeclareForm, setShowDeclareForm]   = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Charge depuis Supabase quand l'onglet accidents est ouvert
  useEffect(() => {
    if (tab !== 'accidents' || incidentsLoaded) return;
    setIncidentsLoading(true);
    incidentService.getAll()
      .then(data => {
        setIncidents(data);           // toujours écraser (même si vide)
        setIncidentsDemoMode(false);
        setIncidentsLoaded(true);
        setIncidentsLoading(false);
      })
      .catch(() => {
        // Tables Supabase non créées → données démo en fallback
        setIncidents(INITIAL_INCIDENTS);
        setIncidentsDemoMode(true);
        setIncidentsLoaded(true);
        setIncidentsLoading(false);
      });
  }, [tab, incidentsLoaded]);

  const [deleteIncidentId, setDeleteIncidentId] = useState<string | null>(null);

  const handleIncidentSubmit = async (inc: Incident) => {
    setIncidents(prev => [inc, ...prev]);
    setShowDeclareForm(false);
    try { await incidentService.create(inc); } catch { /* garde l'état local */ }
  };

  const handleIncidentUpdate = async (inc: Incident) => {
    setIncidents(prev => prev.map(x => x.id === inc.id ? inc : x));
    setSelectedIncident(inc);
    try { await incidentService.update(inc.id, inc); } catch { /* garde l'état local */ }
  };

  const handleDeleteIncident = async () => {
    if (!deleteIncidentId) return;
    const id = deleteIncidentId;
    setDeleteIncidentId(null);
    setSelectedIncident(prev => prev?.id === id ? null : prev);
    const snapshot = incidents.find(x => x.id === id);
    setIncidents(prev => prev.filter(x => x.id !== id));
    try {
      await incidentService.delete(id);
    } catch (err) {
      console.error('Erreur suppression incident', err);
      // Rollback optimiste si Supabase échoue
      if (snapshot) setIncidents(prev => [snapshot, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    }
  };

  const handleInspSubmit = (insp: Inspection, actions: ActionCorrectrice[]) => {
    setAllInspections(prev => [insp, ...prev]);
    setAllActions(prev => [...actions, ...prev]);
    setShowForm(false);
  };

  const handleDeleteInsp = () => {
    if (!deleteInspId) return;
    const id = deleteInspId;
    setDeleteInspId(null);
    setAllInspections(prev => prev.filter(i => i.id !== id));
    setAllActions(prev => prev.filter(a => a.inspectionId !== id));
    checklistService.deleteInspection(id).catch(e => console.error('delete insp', e));
  };

  const handleDeleteAction = () => {
    if (!deleteActionId) return;
    const id = deleteActionId;
    setDeleteActionId(null);
    setAllActions(prev => prev.filter(a => a.id !== id));
    checklistService.deleteAction(id).catch(e => console.error('delete action', e));
  };

  const tooltipStyle = {
    background: c.tooltipBg,
    border: `1px solid ${c.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
  };

  // Scoring derived
  const sorted = [...localDrivers].sort((a, b) => b.scoreGlobal - a.scoreGlobal);
  const avgScore = localDrivers.length > 0
    ? Math.round(localDrivers.reduce((s, d) => s + d.scoreGlobal, 0) / localDrivers.length)
    : 0;
  const criticals = localDrivers.filter(d => d.scoreGlobal < 70).length;
  const excellent = localDrivers.filter(d => d.scoreGlobal >= 90).length;
  const filteredAlerts = localAlerts.filter(a => alertFilter === 'all' || a.level === alertFilter);
  const scoreTrend = [
    { m: 'Nov', score: 74 }, { m: 'Déc', score: 76 }, { m: 'Jan', score: 75 },
    { m: 'Fév', score: 78 }, { m: 'Mar', score: 80 }, { m: 'Avr', score: 82 },
    { m: 'Mai', score: avgScore },
  ];

  // Checklist derived
  const avgTaux = Math.round(allInspections.reduce((s, i) => s + i.tauxConformite, 0) / allInspections.length);
  const openActions = allActions.filter(a => a.statut !== 'cloturee').length;
  const critiqueOpen = allActions.filter(a => a.statut !== 'cloturee' && a.priorite === 'critique').length;
  const conformeVehicules = new Set(allInspections.filter(i => i.statut === 'conforme').map(i => i.vehiculeId)).size;
  const thisMonthInsp = allInspections.filter(i => i.date.startsWith('2025-05')).length;
  const radarData = useMemo(() => buildRadarData(allInspections, safeChecklist), [allInspections, safeChecklist]);
  const catBarData = useMemo(() => buildCatBarData(allInspections, safeChecklist), [allInspections, safeChecklist]);
  const filteredActions = useMemo(() => allActions.filter(a =>
    (actionFilter === 'all' || a.statut === actionFilter) &&
    (prioriteFilter === 'all' || a.priorite === prioriteFilter)
  ), [allActions, actionFilter, prioriteFilter]);
  const selectedInsp = allInspections.find(i => i.id === selectedInspId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Module Sécurité" subtitle="Tableau de bord HSE, check-list, scoring conducteurs" />

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-0">
        {([
          { key: 'qse',       label: 'Tableau de bord HSE',          icon: Leaf },
          { key: 'checklist', label: 'Check-list & Plan d\'actions', icon: ClipboardCheck },
          { key: 'scoring',   label: 'Scoring & Alertes',            icon: ShieldCheck },
          { key: 'accidents', label: 'Accidents & Incidents',          icon: AlertTriangle },
        ] as { key: Tab; label: string; icon: React.FC<{ size?: number; style?: React.CSSProperties }> }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all"
            style={{
              background: tab === key ? c.accentBg : 'transparent',
              color: tab === key ? c.accent : c.textMuted,
              borderBottom: tab === key ? `2px solid ${c.accent}` : '2px solid transparent',
            }}>
            <Icon size={15} style={{ color: tab === key ? c.accent : c.textMuted }} />
            {label}
          </button>
        ))}
      </div>
      <div style={{ height: 1, background: c.border, margin: '0 24px' }} />

      <DataState loading={loading} error={error}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── Tab Scoring & Alertes ─────────────────────────────────────── */}
        {tab === 'scoring' && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Score moyen flotte" value={avgScore} unit="/100"
              icon={ShieldCheck} iconColor="#00e676" iconBg={c.successBg}
              trend={4} trendLabel="amélioration ce mois" glowClass="glow-success" />
            <KPICard label="Conducteurs excellents" value={excellent} unit={`/${safeDrivers.length}`}
              icon={TrendingUp} iconColor="#00d4ff" iconBg={c.accentBg}
              trendLabel="Score ≥ 90/100" />
            <KPICard label="Conducteurs à risque" value={criticals}
              icon={TrendingDown} iconColor="#ff4444" iconBg={c.dangerBg}
              trendLabel="Score < 70/100" glowClass={criticals > 0 ? 'glow-danger' : ''} />
            <KPICard label="Alertes non lues" value={localAlerts.filter(a => !a.lu).length}
              icon={Bell} iconColor="#ffb300" iconBg={c.warningBg}
              trendLabel={`${localAlerts.filter(a => a.level === 'critique' && !a.lu).length} critiques`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Classement sécurité conducteurs</span>
                <span className="text-xs" style={{ color: c.textMuted }}>{safeDrivers.length} conducteurs</span>
              </div>
              <div className="divide-y" style={{ borderColor: `${c.border}26` }}>
                {sorted.map((d, i) => {
                  const color = scoreColor(d.scoreGlobal);
                  return (
                    <div key={d.id} className="flex items-center gap-4 px-5 py-3 cursor-pointer table-row-hover"
                      onClick={() => setSelectedDriver(d)}>
                      <div className="w-6 text-center text-xs font-bold" style={{ color: i < 3 ? c.accent : c.textFaint }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${color}18`, border: `1.5px solid ${color}40`, color }}>
                        {d.prenom[0]}{d.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{d.prenom} {d.nom}</div>
                        <div className="text-xs" style={{ color: c.textMuted }}>{d.matricule} · {d.kmTotal.toLocaleString()} km</div>
                      </div>
                      <div className="w-24 hidden md:block">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: c.textMuted }}>Score</span>
                          <span className="font-semibold" style={{ color }}>{d.scoreGlobal}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                          <div className="h-full rounded-full" style={{ width: `${d.scoreGlobal}%`, background: color }} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: `${color}18`, color }}>{scoreGrade(d.scoreGlobal)}</div>
                      <div className="w-20 hidden lg:block">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${d.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' : d.status === 'repos' ? 'text-[#7bacc8] bg-[#7bacc810] border-[#7bacc840]' : 'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'}`}>
                          {d.status}
                        </span>
                      </div>
                      <Eye size={13} style={{ color: c.textMuted, flexShrink: 0 }} />
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditDriver(d); setShowDriverModal(true); }}
                          style={{ color: c.accent }}><Pencil size={13} /></button>
                        <button onClick={() => setDeleteDriverId(d.id)}
                          style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>Évolution score moyen flotte</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={scoreTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                    <XAxis dataKey="m" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} formatter={(v) => [`${v}/100`, 'Score']} />
                    <Line type="monotone" dataKey="score" stroke="#00e676" strokeWidth={2.5} dot={{ fill: '#00e676', r: 3 }} name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Alertes sécurité</h3>
                  <div className="flex items-center gap-2">
                    {localAlerts.length > 0 && (
                      <button
                        onClick={async () => {
                          try { await alertService.deleteAll(); } catch { /* ignore */ }
                          setLocalAlerts([]);
                        }}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}>
                        Vider
                      </button>
                    )}
                    <Activity size={14} style={{ color: '#ff4444' }} />
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {(['all', 'critique', 'warning', 'info'] as const).map(f => (
                    <button key={f} onClick={() => setAlertFilter(f)}
                      className="flex-1 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: alertFilter === f ? c.accentBg : 'transparent', color: alertFilter === f ? c.accent : c.textMuted, border: `1px solid ${alertFilter === f ? c.accentBorder : 'transparent'}` }}>
                      {f === 'all' ? 'Tout' : f === 'critique' ? '🚨' : f === 'warning' ? '⚠️' : 'ℹ️'}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredAlerts.map(a => (
                    <div key={a.id} className={`px-3 py-2.5 rounded-lg ${!a.lu ? 'border-l-2' : ''}`}
                      style={{ background: a.level === 'critique' ? 'rgba(255,68,68,0.06)' : a.level === 'warning' ? 'rgba(255,179,0,0.06)' : c.bgElevated, border: `1px solid ${a.level === 'critique' ? 'rgba(255,68,68,0.2)' : a.level === 'warning' ? 'rgba(255,179,0,0.15)' : c.border}`, borderLeftColor: !a.lu ? (a.level === 'critique' ? '#ff4444' : '#ffb300') : undefined }}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{alertTypeIcon[a.type] || '⚠️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: c.textSecondary }}>{a.message}</p>
                          <p className="text-xs mt-1" style={{ color: c.textFaint }}>{a.timestamp}</p>
                        </div>
                        {!a.lu && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#ff4444' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>)}

        {/* ── Tab Check-list & Plan d'actions ──────────────────────────── */}
        {tab === 'checklist' && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Conformité moyenne" value={avgTaux} unit="%"
              icon={ClipboardCheck} iconColor="#00e676" iconBg={c.successBg}
              trend={2} trendLabel="vs mois précédent" glowClass="glow-success" />
            <KPICard label="Actions ouvertes" value={openActions}
              icon={AlertTriangle} iconColor="#ffb300" iconBg={c.warningBg}
              trendLabel={`${critiqueOpen} critique${critiqueOpen > 1 ? 's' : ''}`}
              glowClass={critiqueOpen > 0 ? 'glow-danger' : ''} />
            <KPICard label="Inspections ce mois" value={thisMonthInsp}
              icon={BarChart3} iconColor="#00d4ff" iconBg={c.accentBg}
              trendLabel={`${safeChecklist.length} points / contrôle`} />
            <KPICard label="Véhicules conformes" value={conformeVehicules} unit={`/${safeVehicles.length}`}
              icon={ShieldAlert} iconColor="#00d4ff" iconBg={c.accentBg}
              trendLabel="Score 100% récent" />
          </div>

          <div className="flex justify-end">
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}>
              <Plus size={16} />
              Nouvelle inspection
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Conformité par catégorie</h3>
                <div className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.25)' }}>
                  Seuil cible : 95%
                </div>
              </div>
              {/* Score pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {catBarData.map(d => {
                  const color = d.taux >= 95 ? '#00e676' : d.taux >= 85 ? '#ffb300' : '#ff4444';
                  return (
                    <div key={d.cat} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                      <span style={{ color: c.textSecondary }}>{d.cat}</span>
                      <span className="font-bold" style={{ color }}>{d.taux}%</span>
                      {d.nc > 0 && <span style={{ color: '#ff4444' }}>· {d.nc} NC</span>}
                    </div>
                  );
                })}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <PolarGrid stroke={c.gridStroke} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload }) => {
                      const val = radarData.find(d => d.subject === payload.value)?.taux ?? 100;
                      const color = val >= 95 ? '#00e676' : val >= 85 ? '#ffb300' : '#ff4444';
                      return (
                        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill={color}>
                          {payload.value}
                        </text>
                      );
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: c.textSecondary }}
                    formatter={(v) => [`${v}%`, 'Conformité']}
                  />
                  {/* Zone cible à 95 */}
                  <Radar name="Cible" dataKey={() => 95} stroke="#00d4ff" fill="transparent"
                    strokeDasharray="4 3" strokeWidth={1} dot={false} />
                  {/* Conformité réelle */}
                  <Radar name="Conformité" dataKey="taux" stroke="#00e676" fill="#00e676" fillOpacity={0.12} strokeWidth={2.5}
                    dot={{ fill: '#00e676', r: 4, strokeWidth: 0 }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-1">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: c.textSecondary }}>
                  <div className="w-6 h-0.5" style={{ background: '#00e676' }} />
                  Conformité réelle
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: c.textSecondary }}>
                  <div className="w-6 h-0.5" style={{ background: '#00d4ff', borderTop: '1px dashed #00d4ff' }} />
                  Seuil 95%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>Tendance conformité flotte</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={safeConformite} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                    <XAxis dataKey="mois" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} formatter={(v) => [`${v}%`, 'Taux']} />
                    <Line type="monotone" dataKey="taux" stroke="#00e676" strokeWidth={2.5} dot={{ fill: '#00e676', r: 3 }} name="Taux %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Plan d'actions correctives</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: critiqueOpen > 0 ? 'rgba(255,68,68,0.12)' : 'rgba(0,230,118,0.1)', color: critiqueOpen > 0 ? '#ff4444' : '#00e676' }}>
                    {openActions} ouverte{openActions > 1 ? 's' : ''}
                  </span>
                </div>
                <Filter size={13} style={{ color: c.textMuted }} />
              </div>
              <div className="px-5 py-2.5 flex gap-2 flex-wrap" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                <div className="flex gap-1">
                  {(['all', 'ouverte', 'en_cours', 'cloturee'] as const).map(f => (
                    <button key={f} onClick={() => setActionFilter(f)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: actionFilter === f ? c.accentBg : 'transparent', color: actionFilter === f ? c.accent : c.textMuted, border: `1px solid ${actionFilter === f ? c.accentBorder : 'transparent'}` }}>
                      {f === 'all' ? 'Tous' : f === 'ouverte' ? '🔴 Ouvertes' : f === 'en_cours' ? '🟡 En cours' : '✅ Clôturées'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(['all', 'critique', 'haute', 'normale'] as const).map(f => (
                    <button key={f} onClick={() => setPrioriteFilter(f)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: prioriteFilter === f ? c.warningBg : 'transparent', color: prioriteFilter === f ? '#ffb300' : c.textMuted, border: `1px solid ${prioriteFilter === f ? c.warningBorder : 'transparent'}` }}>
                      {f === 'all' ? 'Toutes' : f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
                {filteredActions.length === 0
                  ? <div className="px-5 py-8 text-center text-sm" style={{ color: c.textMuted }}>Aucune action correspondante</div>
                  : filteredActions.map(a => <ActionRow key={a.id} action={a} vehicles={safeVehicles} drivers={safeDrivers} onDelete={id => setDeleteActionId(id)} />)}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Dernières inspections</span>
                <span className="text-xs" style={{ color: c.textMuted }}>{allInspections.length} au total</span>
              </div>
              <div className="divide-y" style={{ borderColor: `${c.border}26` }}>
                {allInspections.slice(0, 8).map(insp => {
                  const v = safeVehicles.find(x => x.id === insp.vehiculeId);
                  const d = safeDrivers.find(x => x.id === insp.chauffeurId);
                  const isSelected = selectedInspId === insp.id;
                  const tColor = insp.tauxConformite >= 95 ? '#00e676' : insp.tauxConformite >= 80 ? '#ffb300' : '#ff4444';
                  return (
                    <div key={insp.id} className="px-4 py-3 cursor-pointer transition-all"
                      style={{ background: isSelected ? c.accentBg : 'transparent' }}
                      onClick={() => setSelectedInspId(isSelected ? null : insp.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{ background: `${tColor}15`, border: `1.5px solid ${tColor}40`, color: tColor }}>
                          {insp.tauxConformite}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate" style={{ color: c.textPrimary }}>{v?.immatriculation || 'N/A'}</div>
                          <div className="text-xs truncate" style={{ color: c.textMuted }}>
                            {d ? `${d.prenom} ${d.nom}` : '—'} · {insp.date.slice(0, 10)}
                          </div>
                        </div>
                        {insp.statut === 'conforme' ? <CheckCircle2 size={14} style={{ color: '#00e676' }} /> : <XCircle size={14} style={{ color: '#ff4444' }} />}
                        <button
                          className="p-1 rounded-lg transition-all"
                          title="Vue schéma camion"
                          style={{ background: c.accentBg, border: `1px solid ${c.accentBorder}` }}
                          onClick={e => { e.stopPropagation(); setDiagramInsp(insp); }}>
                          <ScanLine size={12} style={{ color: c.accent }} />
                        </button>
                        <button
                          className="p-1 rounded-lg transition-all"
                          title="Supprimer"
                          style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}
                          onClick={e => { e.stopPropagation(); setDeleteInspId(insp.id); }}>
                          <Trash2 size={12} style={{ color: '#ff4444' }} />
                        </button>
                      </div>
                      {isSelected && selectedInsp && (
                        <div className="mt-3 space-y-1.5 pl-1">
                          {Object.entries(selectedInsp.resultats).filter(([, v]) => v === 'non_conforme').map(([itemId]) => {
                            const item = safeChecklist.find(i => i.id === itemId);
                            return item ? (
                              <div key={itemId} className="flex items-start gap-2 text-xs" style={{ color: '#ff8888' }}>
                                <XCircle size={11} className="flex-shrink-0 mt-0.5" /><span>{item.point}</span>
                              </div>
                            ) : null;
                          })}
                          {Object.values(selectedInsp.resultats).every(v => v !== 'non_conforme') && (
                            <div className="text-xs" style={{ color: '#00e676' }}>✓ Aucune non-conformité</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>)}

        {/* ── Tab QSE ──────────────────────────────────────────────────── */}
        {tab === 'qse' && <QSETab tooltipStyle={tooltipStyle} />}

        {/* ── Tab Accidents & Incidents ─────────────────────────────── */}
        {tab === 'accidents' && (
          <AccidentsTab
            incidents={incidents}
            onDeclare={() => setShowDeclareForm(true)}
            onSelect={inc => setSelectedIncident(inc)}
            onDelete={id => setDeleteIncidentId(id)}
            vehicles={safeVehicles}
            drivers={safeDrivers}
            loading={incidentsLoading}
            demoMode={incidentsDemoMode}
          />
        )}

      </div>

      </DataState>
      {selectedDriver && (
        <DriverPanel
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          alerts={localAlerts}
        />
      )}
      {showDriverModal && editDriver && (
        <DriverEditModal
          driver={editDriver}
          onSaved={handleDriverSaved}
          onClose={() => { setShowDriverModal(false); setEditDriver(null); }}
        />
      )}
      {deleteIncidentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer l'événement ?</h3>
            <p className="text-sm mb-1" style={{ color: c.textSecondary }}>
              {(() => { const i = incidents.find(x => x.id === deleteIncidentId); return i ? `${i.reference} — ${INCIDENT_TYPE_LABELS[i.type]}` : ''; })()}
            </p>
            <p className="text-xs mb-4" style={{ color: c.textMuted }}>Toutes les actions associées seront également supprimées.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteIncidentId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleDeleteIncident} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeclareForm && (
        <IncidentDeclarationModal
          onClose={() => setShowDeclareForm(false)}
          onSubmit={handleIncidentSubmit}
          vehicles={safeVehicles}
          drivers={safeDrivers}
        />
      )}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={handleIncidentUpdate}
          vehicles={safeVehicles}
          drivers={safeDrivers}
        />
      )}
      {showForm && (
        <InspectionForm
          onClose={() => setShowForm(false)}
          onSubmit={handleInspSubmit}
          vehicles={safeVehicles}
          drivers={safeDrivers}
          checklistItems={safeChecklist}
        />
      )}
      {diagramInsp && (
        <TruckDiagramModal
          inspection={diagramInsp}
          onClose={() => setDiagramInsp(null)}
          vehicles={safeVehicles}
          drivers={safeDrivers}
          checklistItems={safeChecklist}
        />
      )}

      {deleteInspId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer l'inspection ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Les actions correctives associées seront également supprimées.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteInspId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleDeleteInsp} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteActionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer l'action corrective ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteActionId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleDeleteAction} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer le conducteur ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>
              {(() => { const d = localDrivers.find(x => x.id === deleteDriverId); return d ? `${d.prenom} ${d.nom} — ${d.matricule}` : ''; })()}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteDriverId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleDeleteDriver} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Truck Diagram Modal ──────────────────────────────────────────────────────

const TRUCK_ZONES = [
  { id: 'documents',    cat: 'Documents réglementaires', label: 'Documents',      ncPos: { x: 188, y: 78  } },
  { id: 'conducteur',   cat: 'Conducteur & sécurité',   label: 'Conducteur',     ncPos: { x: 188, y: 150 } },
  { id: 'epi',          cat: 'EPI obligatoires',        label: 'EPI',            ncPos: { x: 188, y: 192 } },
  { id: 'tracteur',     cat: 'Tracteur',                label: 'Tracteur',       ncPos: { x: 262, y: 115 } },
  { id: 'benne',        cat: 'Benne / Remorque',        label: 'Benne / Rem.',   ncPos: { x: 722, y: 50  } },
  { id: 'pneus',        cat: 'Pneumatiques',            label: 'Pneumatiques',   ncPos: { x: 148, y: 222 } },
  { id: 'environnement',cat: 'Environnement & urgence', label: 'Environ.',       ncPos: { x: 490, y: 216 } },
];

function TruckDiagramModal({ inspection, onClose, vehicles, drivers, checklistItems }: {
  inspection: Inspection; onClose: () => void;
  vehicles: Vehicle[]; drivers: Driver[]; checklistItems: ChecklistItem[];
}) {
  const { c, isDark } = useTheme();
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const vehicle = vehicles.find(v => v.id === inspection.vehiculeId);
  const driver  = drivers.find(d => d.id === inspection.chauffeurId);

  const getStats = (cat: string) => {
    const items = checklistItems.filter(i => i.categorie === cat);
    const nc: typeof items = [];
    let conforme = 0, na = 0;
    items.forEach(item => {
      const r = inspection.resultats[item.id];
      if (r === 'conforme') conforme++;
      else if (r === 'non_conforme') nc.push(item);
      else if (r === 'na') na++;
    });
    return { conforme, nonConforme: nc.length, na, nc_items: nc, total: items.length };
  };

  const zoneColor = (cat: string, hover = false) => {
    const s = getStats(cat);
    const filled = s.conforme + s.nonConforme + s.na;
    const a = hover ? 0.55 : 0.32;
    if (filled === 0) return `rgba(120,140,170,0.18)`;
    if (s.nonConforme > 0) return `rgba(255,68,68,${a})`;
    return `rgba(0,230,118,${a})`;
  };

  const zoneBorder = (cat: string) => {
    const s = getStats(cat);
    const filled = s.conforme + s.nonConforme + s.na;
    if (filled === 0) return '#2a4060';
    if (s.nonConforme > 0) return '#ff4444';
    return '#00e676';
  };

  const isActive = (id: string) => activeZone === id;

  const interactiveProps = (id: string, cat: string) => ({
    style: { cursor: 'pointer' } as React.CSSProperties,
    onClick: () => setActiveZone(activeZone === id ? null : id),
    onMouseEnter: () => !activeZone && setActiveZone(id),
    onMouseLeave: () => !activeZone && setActiveZone(null),
    fill: zoneColor(cat, isActive(id)),
    stroke: zoneBorder(cat),
    strokeWidth: isActive(id) ? 2.5 : 1.5,
  });

  const activeData = activeZone ? TRUCK_ZONES.find(z => z.id === activeZone) : null;
  const activeStats = activeData ? getStats(activeData.cat) : null;
  const activeItems = activeData ? checklistItems.filter(i => i.categorie === activeData.cat) : [];


  const tScore = inspection.tauxConformite;
  const tColor = tScore >= 95 ? '#00e676' : tScore >= 80 ? '#ffb300' : '#ff4444';

  // Structural palette (theme-aware)
  const sk = isDark ? '#1e3a5f' : '#7888a0';
  const sf = isDark ? '#0c1e38' : '#c8d8ec';
  const gf = isDark ? 'rgba(100,180,255,0.13)' : 'rgba(140,195,255,0.38)';
  const gb = isDark ? '#2a5a8a' : '#5888b8';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', padding: '16px' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-5xl flex flex-col overflow-hidden"
        style={{ border: `1px solid ${c.borderStrong}`, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <div className="font-semibold" style={{ color: c.textPrimary }}>
              Rapport d'inspection — {vehicle?.immatriculation}
              {vehicle && <span className="font-normal ml-2" style={{ color: c.textMuted }}>{vehicle.marque} {vehicle.modele}</span>}
            </div>
            <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
              {driver ? `${driver.prenom} ${driver.nom}` : '—'} · {inspection.date} · {inspection.inspecteur}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: tColor }}>{tScore}%</div>
              <div className="text-xs" style={{ color: c.textMuted }}>Conformité</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: c.textMuted }}><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* SVG Truck */}
          <div className="flex-1 flex flex-col justify-center px-4 py-4" style={{ minWidth: 0 }}>
            <div className="text-xs font-semibold text-center mb-2" style={{ color: c.textFaint }}>
              Cliquez sur une zone pour voir les détails
            </div>
            <svg viewBox="0 0 760 278" className="w-full" style={{ maxHeight: 330 }}>
              {/* ════════════════════════════════════════════════════════ */}
              {/*  PROFESSIONAL EUROPEAN CAB-OVER TRUCK (flat-face)       */}
              {/* ════════════════════════════════════════════════════════ */}

              {/* Ground shadow */}
              <ellipse cx="400" cy="272" rx="340" ry="5" fill={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)'} style={{ pointerEvents: 'none' }} />

              {/* ── BENNE / REMORQUE ─────────────────────────────────── */}
              <path d="M 296,50 L 318,38 L 736,38 L 736,213 L 296,213 Z"
                {...interactiveProps('benne', 'Benne / Remorque')} />
              {/* Benne structural ribs */}
              {[400, 500, 600, 700].map(x => (
                <line key={x} x1={x} y1="38" x2={x} y2="213" stroke={sk} strokeWidth="0.9" opacity="0.55" style={{ pointerEvents: 'none' }} />
              ))}
              {/* Horizontal stiffener mid-height */}
              <line x1="296" y1="126" x2="736" y2="126" stroke={sk} strokeWidth="0.7" opacity="0.4" style={{ pointerEvents: 'none' }} />
              {/* Reflective tape strip bottom */}
              <rect x="296" y="200" width="440" height="5"
                fill="none" stroke={isDark ? '#e8cc44' : '#b89900'} strokeWidth="0.7"
                strokeDasharray="14,10" opacity="0.65" style={{ pointerEvents: 'none' }} />
              {/* Rear door frame */}
              <rect x="718" y="38" width="18" height="175" rx="2"
                fill={sf} stroke={sk} strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
              {/* Rear door hinge lines */}
              <line x1="719" y1="70"  x2="735" y2="70"  stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              <line x1="719" y1="110" x2="735" y2="110" stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              <line x1="719" y1="180" x2="735" y2="180" stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              {/* Rear lights cluster (right side) */}
              <rect x="732" y="50" width="6" height="22" rx="2" fill="#e02020" style={{ pointerEvents: 'none' }} />
              <rect x="732" y="78" width="6" height="14" rx="2" fill="#e07020" style={{ pointerEvents: 'none' }} />
              <rect x="732" y="98" width="6" height="10" rx="2" fill={isDark ? '#ffffff40' : '#cccccc'} style={{ pointerEvents: 'none' }} />
              <rect x="732" y="180" width="6" height="22" rx="2" fill="#e02020" style={{ pointerEvents: 'none' }} />
              <rect x="732" y="158" width="6" height="14" rx="2" fill="#e07020" style={{ pointerEvents: 'none' }} />

              {/* ── HYDRAULIC LIFT PISTON (benne raise) ──────────────── */}
              <rect x="277" y="94" width="12" height="94" rx="5"
                fill={sf} stroke={sk} strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
              <rect x="280" y="82" width="6" height="18" rx="3"
                fill={isDark ? '#2a4a6a' : '#a0b8d0'} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              {/* Piston ring detail */}
              {[100, 114, 128, 142].map(y => (
                <line key={y} x1="277" y1={y} x2="289" y2={y} stroke={sk} strokeWidth="0.5" opacity="0.6" style={{ pointerEvents: 'none' }} />
              ))}

              {/* ── CHASSIS / ENVIRONNEMENT ──────────────────────────── */}
              <rect x="52" y="213" width="684" height="13" rx="3"
                fill={zoneColor('Environnement & urgence', isActive('environnement'))}
                stroke={zoneBorder('Environnement & urgence')}
                strokeWidth={isActive('environnement') ? 2 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveZone(activeZone === 'environnement' ? null : 'environnement')}
                onMouseEnter={() => !activeZone && setActiveZone('environnement')}
                onMouseLeave={() => !activeZone && setActiveZone(null)}
              />
              {/* Chassis cross-members */}
              {[200, 300, 400, 500, 620].map(x => (
                <rect key={x} x={x} y="213" width="8" height="13" rx="1"
                  fill={sk} opacity="0.35" style={{ pointerEvents: 'none' }} />
              ))}

              {/* ── TRACTEUR (mechanical zone, behind cab) ───────────── */}
              <rect x="200" y="108" width="70" height="105" rx="3"
                {...interactiveProps('tracteur', 'Tracteur')} />
              {/* Grille / louvre vents */}
              {[120, 133, 146, 159, 172, 185].map(y => (
                <line key={y} x1="204" y1={y} x2="267" y2={y}
                  stroke={sk} strokeWidth="0.75" opacity="0.6" style={{ pointerEvents: 'none' }} />
              ))}
              {/* Air intake grille box */}
              <rect x="204" y="116" width="62" height="78" rx="2"
                fill="none" stroke={sk} strokeWidth="0.8" opacity="0.5" style={{ pointerEvents: 'none' }} />

              {/* ── FUEL TANK ────────────────────────────────────────── */}
              <rect x="248" y="158" width="28" height="55" rx="4"
                fill={sf} stroke={sk} strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
              {/* Tank bands */}
              <line x1="248" y1="173" x2="276" y2="173" stroke={sk} strokeWidth="1" style={{ pointerEvents: 'none' }} />
              <line x1="248" y1="196" x2="276" y2="196" stroke={sk} strokeWidth="1" style={{ pointerEvents: 'none' }} />
              {/* Fuel cap */}
              <circle cx="262" cy="163" r="4" fill={sk} opacity="0.5" style={{ pointerEvents: 'none' }} />

              {/* ── AIR DEFLECTOR (cab roof ↔ benne top) ─────────────── */}
              <path d="M 198,54 L 224,38 L 294,38 L 294,50 L 228,62 L 198,66 Z"
                fill={sf} stroke={sk} strokeWidth="1" style={{ pointerEvents: 'none' }} />

              {/* ── FIFTH WHEEL COUPLING ─────────────────────────────── */}
              <rect x="265" y="207" width="30" height="8" rx="2"
                fill={sk} stroke={sk} strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
              <ellipse cx="280" cy="211" rx="10" ry="3.5"
                fill="none" stroke={isDark ? '#3a6a9a' : '#809ab8'} strokeWidth="1" style={{ pointerEvents: 'none' }} />

              {/* ── CAB ZONES (drawn below structural glass/details) ──── */}
              {/* Documents zone — upper cab */}
              <path d="M 43,80 Q 43,70 53,70 L 197,70 L 197,132 L 43,132 Z"
                {...interactiveProps('documents', 'Documents réglementaires')} />
              {/* Conducteur zone — mid cab / door */}
              <rect x="43" y="132" width="154" height="42"
                {...interactiveProps('conducteur', 'Conducteur & sécurité')} />
              {/* EPI zone — lower cab */}
              <rect x="43" y="174" width="154" height="39"
                {...interactiveProps('epi', 'EPI obligatoires')} />

              {/* ── CAB STRUCTURAL OUTLINE ───────────────────────────── */}
              <path d="M 42,213 L 42,80 Q 42,70 52,70 L 198,70 L 198,213 Z"
                fill="none" stroke={sk} strokeWidth="2" style={{ pointerEvents: 'none' }} />

              {/* ── ROOF DEFLECTOR / FAIRING ─────────────────────────── */}
              <path d="M 42,70 L 42,54 Q 42,48 52,48 L 198,48 L 198,70 Z"
                fill={sf} stroke={sk} strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
              {/* Fairing ribs */}
              {[80, 120, 160].map(x => (
                <line key={x} x1={x} y1="48" x2={x} y2="70"
                  stroke={sk} strokeWidth="0.6" opacity="0.5" style={{ pointerEvents: 'none' }} />
              ))}

              {/* ── WINDSHIELD ───────────────────────────────────────── */}
              <rect x="47" y="74" width="146" height="53" rx="4"
                fill={gf} stroke={gb} strokeWidth="1.4" style={{ pointerEvents: 'none' }} />
              {/* Center A-pillar */}
              <line x1="120" y1="74" x2="120" y2="127"
                stroke={gb} strokeWidth="1" opacity="0.7" style={{ pointerEvents: 'none' }} />
              {/* Windshield corner cut (cab front face angle) */}
              <line x1="47" y1="74" x2="47" y2="127"
                stroke={sk} strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
              {/* Wipers */}
              <line x1="58" y1="126" x2="108" y2="117"
                stroke={sk} strokeWidth="1.3" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
              <line x1="182" y1="126" x2="132" y2="117"
                stroke={sk} strokeWidth="1.3" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

              {/* Dashboard top strip */}
              <rect x="43" y="127" width="155" height="5" rx="0"
                fill={sf} stroke={sk} strokeWidth="0.6" style={{ pointerEvents: 'none' }} />

              {/* ── DOOR WINDOWS ─────────────────────────────────────── */}
              {/* Main door window */}
              <rect x="52" y="137" width="80" height="32" rx="3"
                fill={gf} stroke={gb} strokeWidth="1.3" style={{ pointerEvents: 'none' }} />
              {/* Rear quarter window */}
              <rect x="138" y="137" width="52" height="32" rx="3"
                fill={gf} stroke={gb} strokeWidth="1.3" style={{ pointerEvents: 'none' }} />
              {/* Window divider between door & quarter */}
              <line x1="134" y1="137" x2="134" y2="169"
                stroke={sk} strokeWidth="2.5" style={{ pointerEvents: 'none' }} />

              {/* Door body panel line */}
              <line x1="43" y1="174" x2="197" y2="174"
                stroke={sk} strokeWidth="1" style={{ pointerEvents: 'none' }} />
              {/* Door crease line */}
              <line x1="43" y1="169" x2="197" y2="169"
                stroke={sk} strokeWidth="0.5" opacity="0.4" style={{ pointerEvents: 'none' }} />

              {/* Door handle */}
              <rect x="80" y="182" width="24" height="5" rx="2.5"
                fill={sf} stroke={sk} strokeWidth="1.1" style={{ pointerEvents: 'none' }} />
              <rect x="100" y="180" width="4" height="9" rx="2"
                fill={sf} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />

              {/* ── SIDE MIRROR ──────────────────────────────────────── */}
              <line x1="43" y1="97" x2="20" y2="110"
                stroke={sk} strokeWidth="1.8" style={{ pointerEvents: 'none' }} />
              <rect x="10" y="106" width="20" height="13" rx="3"
                fill={sf} stroke={sk} strokeWidth="1.1" style={{ pointerEvents: 'none' }} />
              {/* Mirror glass */}
              <rect x="12" y="108" width="16" height="9" rx="2"
                fill={gf} stroke={gb} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />

              {/* ── EXHAUST STACK ─────────────────────────────────────── */}
              <rect x="174" y="26" width="11" height="44" rx="4"
                fill={sf} stroke={sk} strokeWidth="1.1" style={{ pointerEvents: 'none' }} />
              <rect x="172" y="34" width="15" height="6" rx="2"
                fill={sf} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              <ellipse cx="179" cy="24" rx="8" ry="3.5"
                fill={sf} stroke={sk} strokeWidth="1" style={{ pointerEvents: 'none' }} />
              {/* Exhaust plume (subtle) */}
              <path d="M 177,22 Q 172,14 178,10 Q 184,4 180,0"
                fill="none" stroke={sk} strokeWidth="0.8" strokeDasharray="2,3"
                opacity="0.3" style={{ pointerEvents: 'none' }} />

              {/* ── FRONT HEADLIGHTS & FOG LIGHTS ────────────────────── */}
              {/* Main headlight (top) */}
              <rect x="42" y="172" width="16" height="10" rx="2"
                fill={isDark ? 'rgba(255,245,180,0.4)' : 'rgba(255,230,80,0.55)'}
                stroke={isDark ? '#aa9900' : '#cc9900'} strokeWidth="1" style={{ pointerEvents: 'none' }} />
              {/* Headlight lens detail */}
              <line x1="50" y1="172" x2="50" y2="182"
                stroke={isDark ? '#ccaa00' : '#aa8800'} strokeWidth="0.5" opacity="0.6" style={{ pointerEvents: 'none' }} />
              {/* Fog light (below) */}
              <rect x="42" y="185" width="12" height="8" rx="2"
                fill={isDark ? 'rgba(255,200,100,0.3)' : 'rgba(255,210,80,0.45)'}
                stroke={isDark ? '#886600' : '#aa8800'} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              {/* DRL / indicator strip */}
              <rect x="42" y="168" width="16" height="3" rx="1"
                fill={isDark ? 'rgba(180,240,255,0.4)' : 'rgba(180,230,255,0.7)'}
                stroke={isDark ? '#4499cc' : '#2266aa'} strokeWidth="0.6" style={{ pointerEvents: 'none' }} />

              {/* ── FRONT BUMPER & STEPS ─────────────────────────────── */}
              <rect x="36" y="205" width="12" height="8" rx="1"
                fill={sf} stroke={sk} strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
              <rect x="34" y="195" width="10" height="8" rx="1"
                fill={sf} stroke={sk} strokeWidth="0.9" style={{ pointerEvents: 'none' }} />
              <rect x="34" y="186" width="8" height="7" rx="1"
                fill={sf} stroke={sk} strokeWidth="0.7" style={{ pointerEvents: 'none' }} />

              {/* ── MUD FLAPS ────────────────────────────────────────── */}
              <rect x="117" y="225" width="6" height="18" rx="1"
                fill={sf} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              <rect x="388" y="225" width="6" height="18" rx="1"
                fill={sf} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
              <rect x="588" y="225" width="6" height="18" rx="1"
                fill={sf} stroke={sk} strokeWidth="0.8" style={{ pointerEvents: 'none' }} />

              {/* ── WHEELS (Pneumatiques) ─────────────────────────────── */}
              {[148, 415, 450, 614, 649].map((wx, i) => (
                <g key={i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveZone(activeZone === 'pneus' ? null : 'pneus')}
                  onMouseEnter={() => !activeZone && setActiveZone('pneus')}
                  onMouseLeave={() => !activeZone && setActiveZone(null)}>
                  {/* Tyre outer */}
                  <circle cx={wx} cy="244" r="28"
                    fill={zoneColor('Pneumatiques', isActive('pneus'))}
                    stroke={zoneBorder('Pneumatiques')}
                    strokeWidth={isActive('pneus') ? 2.5 : 1.5} />
                  {/* Tyre tread band */}
                  <circle cx={wx} cy="244" r="25"
                    fill="none" stroke={sk} strokeWidth="1" opacity="0.35" style={{ pointerEvents: 'none' }} />
                  {/* Rim dish */}
                  <circle cx={wx} cy="244" r="18"
                    fill={isDark ? '#0d1e36' : '#bfd0e4'}
                    stroke={zoneBorder('Pneumatiques')} strokeWidth="1" style={{ pointerEvents: 'none' }} />
                  {/* 7 spokes */}
                  {[0, 51.4, 102.9, 154.3, 205.7, 257.1, 308.6].map(deg => (
                    <line key={deg}
                      x1={wx + Math.cos(deg * Math.PI / 180) * 6}
                      y1={244 + Math.sin(deg * Math.PI / 180) * 6}
                      x2={wx + Math.cos(deg * Math.PI / 180) * 16}
                      y2={244 + Math.sin(deg * Math.PI / 180) * 16}
                      stroke={sk} strokeWidth="2.2" strokeLinecap="round"
                      style={{ pointerEvents: 'none' }} />
                  ))}
                  {/* Hub ring */}
                  <circle cx={wx} cy="244" r="6.5"
                    fill={isDark ? '#1a3355' : '#a0b8cc'} stroke={sk} strokeWidth="1"
                    style={{ pointerEvents: 'none' }} />
                  {/* Hub centre bolt */}
                  <circle cx={wx} cy="244" r="2.5"
                    fill={sk} style={{ pointerEvents: 'none' }} />
                </g>
              ))}

              {/* ── ZONE LABELS ──────────────────────────────────────── */}
              <text x="117" y="104" textAnchor="middle" fontSize="8" fontWeight="700" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>Documents</text>
              <text x="117" y="156" textAnchor="middle" fontSize="8" fontWeight="700" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>Conducteur</text>
              <text x="117" y="194" textAnchor="middle" fontSize="8" fontWeight="700" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>EPI</text>
              <text x="235" y="166" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>Tracteur</text>
              <text x="515" y="130" textAnchor="middle" fontSize="11" fontWeight="700" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>Benne / Remorque</text>
              <text x="148" y="276" textAnchor="middle" fontSize="7" fill={c.textMuted} style={{ pointerEvents: 'none' }}>AV</text>
              <text x="432" y="276" textAnchor="middle" fontSize="7" fill={c.textMuted} style={{ pointerEvents: 'none' }}>AR</text>
              <text x="631" y="276" textAnchor="middle" fontSize="7" fill={c.textMuted} style={{ pointerEvents: 'none' }}>REM</text>
              <text x="368" y="221" textAnchor="middle" fontSize="7.5" fill={c.textSecondary} style={{ pointerEvents: 'none' }}>Environnement & Urgence</text>

              {/* ── NC BADGE CIRCLES ─────────────────────────────────── */}
              {TRUCK_ZONES.map(zone => {
                const s = getStats(zone.cat);
                if (s.nonConforme === 0) return null;
                return (
                  <g key={zone.id} style={{ pointerEvents: 'none' }}>
                    <circle cx={zone.ncPos.x} cy={zone.ncPos.y} r="10" fill="#ff4444" />
                    <text x={zone.ncPos.x} y={zone.ncPos.y + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">{s.nonConforme}</text>
                  </g>
                );
              })}

              {/* ── CONFORMITY CHECK DOTS ────────────────────────────── */}
              {TRUCK_ZONES.filter(z => z.id !== 'pneus').map(zone => {
                const s = getStats(zone.cat);
                const filled = s.conforme + s.nonConforme + s.na;
                if (filled === 0 || s.nonConforme > 0) return null;
                return (
                  <g key={zone.id} style={{ pointerEvents: 'none' }}>
                    <circle cx={zone.ncPos.x} cy={zone.ncPos.y} r="9" fill="#00e676" />
                    <text x={zone.ncPos.x} y={zone.ncPos.y + 4} textAnchor="middle" fontSize="10" fill="#020817">✓</text>
                  </g>
                );
              })}

            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-2">
              {[
                { color: '#00e676', label: 'Conforme' },
                { color: '#ff4444', label: 'Non-conforme' },
                { color: 'rgba(120,140,170,0.3)', label: 'Non renseigné', border: '#2a4060' },
              ].map(({ color, label, border }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: c.textSecondary }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: color, border: `1px solid ${border || color}` }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-72 flex-shrink-0 overflow-y-auto flex flex-col"
            style={{ borderLeft: `1px solid ${c.border}` }}>

            {activeData && activeStats ? (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeStats.nonConforme > 0 ? '#ff4444' : '#00e676' }} />
                  <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>{activeData.label}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: activeStats.nonConforme > 0 ? 'rgba(255,68,68,0.12)' : 'rgba(0,230,118,0.1)', color: activeStats.nonConforme > 0 ? '#ff4444' : '#00e676' }}>
                    {activeStats.conforme}/{activeStats.total} OK
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: c.textMuted }}>
                    <span>Taux de conformité</span>
                    <span style={{ color: activeStats.nonConforme > 0 ? '#ff4444' : '#00e676' }}>
                      {activeStats.total > 0 ? Math.round((activeStats.conforme / (activeStats.total - activeStats.na || 1)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: c.border }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${activeStats.total > 0 ? (activeStats.conforme / (activeStats.total - activeStats.na || 1)) * 100 : 0}%`, background: activeStats.nonConforme > 0 ? '#ff4444' : '#00e676' }} />
                  </div>
                  <div className="flex gap-3 mt-2 text-xs" style={{ color: c.textMuted }}>
                    <span><span style={{ color: '#00e676' }}>●</span> {activeStats.conforme} conform.</span>
                    {activeStats.nonConforme > 0 && <span><span style={{ color: '#ff4444' }}>●</span> {activeStats.nonConforme} NC</span>}
                    {activeStats.na > 0 && <span><span style={{ color: c.textFaint }}>●</span> {activeStats.na} N/A</span>}
                  </div>
                </div>

                {/* NC items */}
                {activeStats.nc_items.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: '#ff4444' }}>Non-conformités</div>
                    <div className="space-y-2">
                      {activeStats.nc_items.map(item => (
                        <div key={item.id} className="px-2.5 py-2 rounded-lg"
                          style={{ background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.2)' }}>
                          <div className="flex items-start gap-1.5">
                            {item.critique && <span className="text-xs px-1 rounded flex-shrink-0" style={{ background: 'rgba(255,68,68,0.2)', color: '#ff4444' }}>CRIT</span>}
                            <span className="text-xs" style={{ color: '#ff9999' }}>{item.point}</span>
                          </div>
                          {inspection.commentaires[item.id] && (
                            <div className="text-xs mt-1 italic" style={{ color: '#ff7777' }}>→ {inspection.commentaires[item.id]}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All items list */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>Tous les points</div>
                  <div className="space-y-1">
                    {activeItems.map(item => {
                      const r = inspection.resultats[item.id];
                      const color = r === 'conforme' ? '#00e676' : r === 'non_conforme' ? '#ff4444' : c.textFaint;
                      const icon = r === 'conforme' ? '✓' : r === 'non_conforme' ? '✗' : '—';
                      return (
                        <div key={item.id} className="flex items-start gap-2 text-xs py-1"
                          style={{ borderBottom: `1px solid ${c.borderFaint}`, color: c.textSecondary }}>
                          <span className="font-bold flex-shrink-0" style={{ color }}>{icon}</span>
                          <span className="leading-tight">{item.point}</span>
                          {item.critique && <span className="flex-shrink-0 text-xs" style={{ color: '#ff4444' }}>⚠</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <ScanLine size={40} style={{ color: c.textFaint, marginBottom: 12 }} />
                <div className="text-sm font-medium mb-1" style={{ color: c.textMuted }}>Sélectionnez une zone</div>
                <div className="text-xs" style={{ color: c.textFaint }}>Cliquez sur une partie du camion pour voir le détail des points de contrôle</div>
                <div className="mt-6 space-y-2 w-full">
                  {TRUCK_ZONES.map(zone => {
                    const s = getStats(zone.cat);
                    const filled = s.conforme + s.nonConforme + s.na;
                    return (
                      <button key={zone.id}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all"
                        style={{ background: c.bgElevated, border: `1px solid ${filled === 0 ? c.border : s.nonConforme > 0 ? 'rgba(255,68,68,0.3)' : 'rgba(0,230,118,0.25)'}` }}
                        onClick={() => setActiveZone(zone.id)}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: filled === 0 ? c.textFaint : s.nonConforme > 0 ? '#ff4444' : '#00e676' }} />
                        <span style={{ color: c.textSecondary }}>{zone.label}</span>
                        <span className="ml-auto font-semibold"
                          style={{ color: filled === 0 ? c.textFaint : s.nonConforme > 0 ? '#ff4444' : '#00e676' }}>
                          {filled === 0 ? '—' : s.nonConforme > 0 ? `${s.nonConforme} NC` : '✓'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QSE Tab ──────────────────────────────────────────────────────────────────

function QSETab({ tooltipStyle }: { tooltipStyle: React.CSSProperties }) {
  const { c } = useTheme();
  const { data: qseDataRaw } = useQseData();
  const qseData = qseDataRaw ?? [];

  const activeMonths = qseData.filter(m => m.remonteesChauffeuts > 0 || m.accidentTrajet > 0 || m.accidentSite > 0 || m.accidentClient > 0);

  const totals = qseData.reduce((acc, m) => ({
    accidents:     acc.accidents     + m.accidentSite + m.accidentTrajet + m.accidentClient,
    incidentsEnv:  acc.incidentsEnv  + m.incidentEnvSite + m.incidentEnvTrajet + m.incidentEnvClient,
    joursArret:    acc.joursArret    + m.joursArret,
    reclamations:  acc.reclamations  + m.reclamationsClients,
    remontees:     acc.remontees     + m.remonteesChauffeuts,
  }), { accidents: 0, incidentsEnv: 0, joursArret: 0, reclamations: 0, remontees: 0 });

  const lastActive = activeMonths[activeMonths.length - 1];
  const avgPAS  = activeMonths.length > 0 ? Math.round(activeMonths.reduce((s, m) => s + m.tauxTraitementPAS, 0)  / activeMonths.length) : 0;
  const avgRem  = activeMonths.length > 0 ? Math.round(activeMonths.reduce((s, m) => s + m.tauxTraitementRemontees, 0) / activeMonths.length) : 0;

  const accidentChartData = qseData.map(m => ({
    mois: m.mois,
    Site:    m.accidentSite,
    Trajet:  m.accidentTrajet,
    Client:  m.accidentClient,
  }));

  const envChartData = qseData.map(m => ({
    mois: m.mois,
    Site:    m.incidentEnvSite,
    Trajet:  m.incidentEnvTrajet,
    Client:  m.incidentEnvClient,
  }));

  const tauxChartData = activeMonths.map(m => ({
    mois: m.mois,
    Remontées: m.tauxTraitementRemontees,
    'Plan d\'actions': m.tauxTraitementPAS,
  }));

  const signalChartData = qseData.map(m => ({
    mois: m.mois,
    'Jours arrêt':    m.joursArret,
    'Réclamations':   m.reclamationsClients,
    'Remontées':      m.remonteesChauffeuts,
  }));

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-px flex-1" style={{ background: c.border }} />
      <span className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: c.textMuted }}>{children}</span>
      <div className="h-px flex-1" style={{ background: c.border }} />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg"
          style={{ background: c.accentBg, border: `1px solid ${c.accentBorder}` }}>
          <Leaf size={14} style={{ color: c.accent }} />
          <span className="text-xs font-semibold" style={{ color: c.accent }}>For-QSE-01.01 — Tableau de bord HSE · Sécurité & Environnement 2026</span>
        </div>
        <span className="text-xs" style={{ color: c.textFaint }}>Version 01 · Émis le 15/05/2026</span>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Accidents totaux" value={totals.accidents}
          icon={AlertTriangle} iconColor="#ff4444" iconBg={c.dangerBg}
          glowClass={totals.accidents > 0 ? 'glow-danger' : ''} trendLabel="Site + Trajet + Client" />
        <KPICard label="Incidents env." value={totals.incidentsEnv}
          icon={Leaf} iconColor="#00e676" iconBg={c.successBg}
          trendLabel="Tous sites confondus" />
        <KPICard label="Jours d'arrêt" value={totals.joursArret}
          icon={Calendar} iconColor="#ffb300" iconBg={c.warningBg}
          glowClass={totals.joursArret > 0 ? 'glow-danger' : ''} trendLabel="Suite aux accidents" />
        <KPICard label="Taux traitement PAS" value={avgPAS} unit="%"
          icon={ShieldCheck} iconColor="#00e676" iconBg={c.successBg}
          trendLabel="Plan d'actions (moy.)" />
        <KPICard label="Remontées traitées" value={avgRem} unit="%"
          icon={Activity} iconColor="#00d4ff" iconBg={c.accentBg}
          trendLabel="Taux moyen annuel" />
      </div>

      {/* Groupe 1 — Accidents */}
      <div className="glass-card p-5">
        <SectionTitle>Accidents — 3 zones de suivi</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={accidentChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} vertical={false} />
                <XAxis dataKey="mois" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
                <Legend wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                <Bar dataKey="Site"   fill="#ff4444" radius={[3,3,0,0]} name="Sur site" />
                <Bar dataKey="Trajet" fill="#ffb300" radius={[3,3,0,0]} name="Trajet" />
                <Bar dataKey="Client" fill="#ff8844" radius={[3,3,0,0]} name="Sites clients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Accidents sur site POWER HYDRLUB', val: totals.accidents > 0 ? qseData.reduce((s,m)=>s+m.accidentSite,0) : 0, color: '#ff4444' },
              { label: 'Accidents de trajet', val: qseData.reduce((s,m)=>s+m.accidentTrajet,0), color: '#ffb300' },
              { label: 'Accidents sites clients', val: qseData.reduce((s,m)=>s+m.accidentClient,0), color: '#ff8844' },
            ].map(({ label, val, color }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: c.textSecondary }}>{label}</span>
                  <span className="text-lg font-black" style={{ color }}>{val}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full" style={{ width: val === 0 ? '100%' : '20%', background: val === 0 ? '#00e676' : color }} />
                </div>
                <div className="text-xs mt-1" style={{ color: val === 0 ? '#00e676' : color }}>{val === 0 ? '✓ Aucun accident' : `${val} cas`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groupe 2 — Incidents environnementaux */}
      <div className="glass-card p-5">
        <SectionTitle>Incidents environnementaux — 3 zones de suivi</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={envChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} vertical={false} />
                <XAxis dataKey="mois" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
                <Legend wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                <Bar dataKey="Site"   fill="#00e676" radius={[3,3,0,0]} name="Sur site" />
                <Bar dataKey="Trajet" fill="#00d4ff" radius={[3,3,0,0]} name="Trajet" />
                <Bar dataKey="Client" fill="#0088aa" radius={[3,3,0,0]} name="Sites clients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Incidents env. sur site', val: qseData.reduce((s,m)=>s+m.incidentEnvSite,0), color: '#00e676' },
              { label: 'Incidents env. en trajet', val: qseData.reduce((s,m)=>s+m.incidentEnvTrajet,0), color: '#00d4ff' },
              { label: 'Incidents env. sites clients', val: qseData.reduce((s,m)=>s+m.incidentEnvClient,0), color: '#0088aa' },
            ].map(({ label, val, color }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: c.textSecondary }}>{label}</span>
                  <span className="text-lg font-black" style={{ color }}>{val}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: val === 0 ? '#00e676' : color }}>{val === 0 ? '✓ Aucun incident' : `${val} cas`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Groupe 3 — Impact & signalements */}
        <div className="glass-card p-5">
          <SectionTitle>Impact & signalements</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={signalChartData.filter(m => m['Remontées'] > 0 || m['Jours arrêt'] > 0 || m['Réclamations'] > 0)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={6}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
              <Legend wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
              <Bar dataKey="Jours arrêt"  fill="#ff4444" radius={[3,3,0,0]} />
              <Bar dataKey="Réclamations" fill="#ffb300" radius={[3,3,0,0]} />
              <Bar dataKey="Remontées"    fill="#00d4ff" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Jours arrêt', val: totals.joursArret, color: '#ff4444' },
              { label: 'Réclamations', val: totals.reclamations, color: '#ffb300' },
              { label: 'Remontées', val: totals.remontees, color: '#00d4ff' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center px-2 py-2 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="text-xl font-black" style={{ color }}>{val}</div>
                <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Groupe 4 — Taux de traitement */}
        <div className="glass-card p-5">
          <SectionTitle>Taux de traitement (%)</SectionTitle>
          {tauxChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={tauxChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                <XAxis dataKey="mois" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} formatter={(v) => [`${v}%`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                <Line type="monotone" dataKey="Remontées"       stroke="#00d4ff" strokeWidth={2.5} dot={{ fill: '#00d4ff', r: 3 }} />
                <Line type="monotone" dataKey="Plan d'actions"  stroke="#00e676" strokeWidth={2.5} dot={{ fill: '#00e676', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm" style={{ color: c.textFaint }}>Pas encore de données</div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Taux traitement remontées', val: avgRem, color: '#00d4ff', target: 90 },
              { label: 'Taux traitement PAS',        val: avgPAS, color: '#00e676', target: 90 },
            ].map(({ label, val, color, target }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="text-xs mb-1" style={{ color: c.textSecondary }}>{label}</div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl font-black" style={{ color }}>{val}%</span>
                  <span className="text-xs" style={{ color: c.textFaint }}>Cible {target}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${val}%`, background: val >= target ? '#00e676' : val >= 80 ? '#ffb300' : '#ff4444' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau récap mensuel */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
          <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Récapitulatif mensuel — 2026</span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
            Réf. For-QSE-01.01
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: c.bgElevated, borderBottom: `1px solid ${c.border}` }}>
                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>Indicateur</th>
                {qseData.map(m => (
                  <th key={m.mois} className="px-3 py-2.5 text-center font-semibold uppercase tracking-wider" style={{ color: c.textFaint }}>{m.mois}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'accidentSite',              label: 'Accidents site',       warn: true },
                { key: 'accidentTrajet',             label: 'Accidents trajet',     warn: true },
                { key: 'accidentClient',             label: 'Accidents clients',    warn: true },
                { key: 'incidentEnvSite',            label: 'Inc. env. site',       warn: true },
                { key: 'incidentEnvTrajet',          label: 'Inc. env. trajet',     warn: true },
                { key: 'incidentEnvClient',          label: 'Inc. env. clients',    warn: true },
                { key: 'joursArret',                 label: 'Jours arrêt',          warn: true },
                { key: 'reclamationsClients',        label: 'Réclamations clients', warn: true },
                { key: 'remonteesChauffeuts',        label: 'Remontées chauffeurs', warn: false },
                { key: 'tauxTraitementRemontees',    label: 'Taux trait. remontées (%)', warn: false },
                { key: 'tauxTraitementPAS',          label: 'Taux PAS (%)',         warn: false },
              ].map(({ key, label, warn }, rowIdx) => (
                <tr key={key} style={{ borderBottom: `1px solid ${c.borderFaint}`, background: rowIdx % 2 === 0 ? 'transparent' : `${c.bgElevated}55` }}>
                  <td className="px-4 py-2" style={{ color: c.textSecondary, whiteSpace: 'nowrap' }}>{label}</td>
                  {qseData.map(m => {
                    const val = m[key as keyof typeof m] as number;
                    const isRate = key.startsWith('taux');
                    const isBad = warn && val > 0;
                    const isEmpty = val === 0 && m.mois !== 'Jan' && m.mois !== 'Fév' && m.mois !== 'Mar' && m.mois !== 'Avr' && m.mois !== 'Mai' && m.mois !== 'Juin';
                    return (
                      <td key={m.mois} className="px-3 py-2 text-center font-medium"
                        style={{ color: isEmpty ? c.textFaint : isBad ? '#ff4444' : isRate && val > 0 ? (val >= 90 ? '#00e676' : val >= 80 ? '#ffb300' : '#ff4444') : c.textPrimary }}>
                        {isEmpty ? '—' : isRate ? `${val}%` : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dernière mise à jour */}
      {lastActive && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textMuted }}>
          <Activity size={13} style={{ color: c.accent }} />
          Dernière saisie : <span style={{ color: c.textPrimary, fontWeight: 500 }}>{lastActive.mois} 2026</span>
          · Total accidents : <span style={{ color: totals.accidents > 0 ? '#ff4444' : '#00e676', fontWeight: 600 }}>{totals.accidents}</span>
          · Total incidents env. : <span style={{ color: totals.incidentsEnv > 0 ? '#ffb300' : '#00e676', fontWeight: 600 }}>{totals.incidentsEnv}</span>
          · Taux PAS moyen : <span style={{ color: avgPAS >= 90 ? '#00e676' : '#ffb300', fontWeight: 600 }}>{avgPAS}%</span>
        </div>
      )}
    </div>
  );
}
