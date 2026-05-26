import { useState, useMemo } from 'react';
import {
  ShieldCheck, TrendingDown, TrendingUp, Bell, Eye, X, Activity,
  ClipboardCheck, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Minus, AlertTriangle, TrendingUp as TrendUp,
  BarChart3, Calendar, Filter, ShieldAlert,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import {
  drivers, alerts, vehicles,
  checklistItems, inspections, actionsCorrectices, conformiteTrend,
  type Driver, type CheckStatut, type ActionStatut, type ActionPriorite,
  type Inspection, type ActionCorrectrice,
} from '../data/mock';

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

const categories = [...new Set(checklistItems.map(i => i.categorie))];

function buildRadarData(insp: Inspection[]) {
  return categories.map(cat => {
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

function buildCatBarData(insp: Inspection[]) {
  return categories.map(cat => {
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

function DriverPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
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
      style={{ background: 'rgba(2,8,23,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-md h-full overflow-y-auto p-6"
        style={{ border: '1px solid #234878', borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
              {driver.prenom[0]}{driver.nom[0]}
            </div>
            <div>
              <div className="font-semibold" style={{ color: '#e8f4fd' }}>{driver.prenom} {driver.nom}</div>
              <div className="text-xs" style={{ color: '#4a7a9b' }}>{driver.matricule}</div>
              <div className="text-xs mt-0.5" style={{ color: driver.status === 'actif' ? '#00e676' : '#ffb300' }}>
                ● {driver.status === 'actif' ? 'En service' : driver.status === 'repos' ? 'En repos' : 'Congé'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#4a7a9b' }}><X size={18} /></button>
        </div>

        <div className="px-4 py-4 rounded-xl mb-5 text-center"
          style={{ background: `${color}0a`, border: `1px solid ${color}25` }}>
          <div className="text-5xl font-black" style={{ color }}>{driver.scoreGlobal}</div>
          <div className="text-sm font-medium mt-1" style={{ color: '#7bacc8' }}>Score Global de Sécurité</div>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: `${color}20`, color }}>
            Grade {scoreGrade(driver.scoreGlobal)}
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-semibold mb-3" style={{ color: '#4a7a9b' }}>ANALYSE COMPORTEMENTALE</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a7a9b', fontSize: 11 }} />
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
                <span style={{ color: '#7bacc8' }}>{label}</span>
                <span className="font-semibold" style={{ color: scoreColor(value) }}>{value}/100</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#1e3a5f' }}>
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
              style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid #1e3a5f' }}>
              <div className="text-base font-bold" style={{ color: '#e8f4fd' }}>{value}</div>
              <div className="text-xs" style={{ color: '#4a7a9b' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-semibold mb-2" style={{ color: '#4a7a9b' }}>DOCUMENTS</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
              <span style={{ color: '#7bacc8' }}>Permis de conduire</span>
              <span style={{ color: '#00d4ff' }}>Exp. {driver.permisExpire}</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
              <span style={{ color: '#7bacc8' }}>Visite médicale</span>
              <span style={{ color: '#ffb300' }}>Exp. {driver.visiteExpire}</span>
            </div>
          </div>
        </div>

        {driverAlerts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color: '#4a7a9b' }}>ALERTES RÉCENTES</h4>
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

function InspectionForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (insp: Inspection, actions: ActionCorrectrice[]) => void;
}) {
  const [vehiculeId, setVehiculeId] = useState('');
  const [chauffeurId, setChauffeurId] = useState('');
  const [inspecteur, setInspecteur] = useState('Chef de Parc');
  const [resultats, setResultats] = useState<Record<string, CheckStatut>>({});
  const [commentaires, setCommentaires] = useState<Record<string, string>>({});
  const [openCat, setOpenCat] = useState<string | null>(categories[0]);
  const [step, setStep] = useState<'info' | 'checklist' | 'recap'>('info');

  const grouped = groupBy(checklistItems, i => i.categorie);

  const setStatut = (id: string, s: CheckStatut) => setResultats(prev => ({ ...prev, [id]: s }));
  const setComment = (id: string, c: string) => setCommentaires(prev => ({ ...prev, [id]: c }));

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
      style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4"
        style={{ border: '1px solid #234878', borderRadius: 16 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e3a5f' }}>
          <div>
            <div className="font-semibold" style={{ color: '#e8f4fd' }}>Nouvelle Inspection Véhicule</div>
            <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>Check-list Power Hydrlub — Tracteur & Benne — Réf. RH-PH-001</div>
          </div>
          <button onClick={onClose} style={{ color: '#4a7a9b' }}><X size={18} /></button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {(['info', 'checklist', 'recap'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
                style={{ background: step === s || (s === 'info' && step !== 'info') || (s === 'checklist' && step === 'recap') ? '#00d4ff' : '#1e3a5f', color: step === s || (s === 'info' && step !== 'info') || (s === 'checklist' && step === 'recap') ? '#020817' : '#4a7a9b' }}>
                {i + 1}
              </div>
              <div className="text-xs ml-1.5 mr-4" style={{ color: step === s ? '#e8f4fd' : '#4a7a9b' }}>
                {s === 'info' ? 'Identification' : s === 'checklist' ? 'Contrôle' : 'Récapitulatif'}
              </div>
              {i < 2 && <div className="w-8 h-px mr-4" style={{ background: '#1e3a5f' }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a7a9b' }}>VÉHICULE</label>
                <select value={vehiculeId} onChange={e => setVehiculeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: '#0a1628', border: '1px solid #234878', color: '#e8f4fd' }}>
                  <option value="">Sélectionner un véhicule...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque} {v.modele}</option>)}
                </select>
              </div>
              {vehicule && (
                <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <span style={{ color: '#7bacc8' }}>KM actuel :</span> <span style={{ color: '#e8f4fd' }}>{vehicule.kmActuel.toLocaleString()} km</span>
                  <span className="mx-3" style={{ color: '#1e3a5f' }}>|</span>
                  <span style={{ color: '#7bacc8' }}>État :</span> <span style={{ color: vehicule.scoreEtat >= 80 ? '#00e676' : vehicule.scoreEtat >= 60 ? '#ffb300' : '#ff4444' }}>{vehicule.scoreEtat}/100</span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a7a9b' }}>CONDUCTEUR</label>
                <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: '#0a1628', border: '1px solid #234878', color: '#e8f4fd' }}>
                  <option value="">Sélectionner un conducteur...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.prenom} {d.nom} — {d.matricule}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#4a7a9b' }}>INSPECTEUR</label>
                <input value={inspecteur} onChange={e => setInspecteur(e.target.value)}
                  placeholder="Nom de l'inspecteur..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: '#0a1628', border: '1px solid #234878', color: '#e8f4fd' }} />
              </div>
              <div className="px-3 py-3 rounded-lg text-xs" style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)' }}>
                <div className="font-semibold mb-1" style={{ color: '#ffb300' }}>⚠️ Points critiques bloquants</div>
                <div style={{ color: '#7bacc8' }}>{checklistItems.filter(i => i.critique).length} points critiques sur {checklistItems.length} — une non-conformité critique entraîne l'immobilisation immédiate du véhicule.</div>
              </div>
            </div>
          )}

          {step === 'checklist' && (
            <div className="space-y-2">
              {categories.map(cat => {
                const { filled, total, nc } = catProgress(cat);
                const isOpen = openCat === cat;
                const items = grouped[cat] || [];
                return (
                  <div key={cat} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${nc > 0 ? 'rgba(255,68,68,0.3)' : filled === total ? 'rgba(0,230,118,0.25)' : '#1e3a5f'}` }}>
                    <button className="w-full flex items-center gap-3 px-4 py-3"
                      style={{ background: isOpen ? 'rgba(0,212,255,0.06)' : 'rgba(10,22,40,0.4)' }}
                      onClick={() => setOpenCat(isOpen ? null : cat)}>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>{cat}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>
                          {filled}/{total} renseignés{nc > 0 && <> · <span style={{ color: '#ff4444' }}>{nc} NC</span></>}
                        </div>
                      </div>
                      {filled === total && nc === 0 && <CheckCircle2 size={15} style={{ color: '#00e676' }} />}
                      {nc > 0 && <AlertTriangle size={15} style={{ color: '#ff4444' }} />}
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e3a5f' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(filled / total) * 100}%`, background: nc > 0 ? '#ff4444' : filled === total ? '#00e676' : '#00d4ff' }} />
                      </div>
                      {isOpen ? <ChevronUp size={14} style={{ color: '#4a7a9b' }} /> : <ChevronDown size={14} style={{ color: '#4a7a9b' }} />}
                    </button>
                    {isOpen && (
                      <div className="divide-y" style={{ borderColor: '#1e3a5f26' }}>
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
                                  <div className="text-sm" style={{ color: '#c8e0f0' }}>{item.point}</div>
                                  <div className="flex gap-2 mt-2">
                                    {(['conforme', 'non_conforme', 'na'] as CheckStatut[]).map(s => (
                                      <button key={s} onClick={() => setStatut(item.id, s)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                          background: r === s ? (s === 'conforme' ? 'rgba(0,230,118,0.15)' : s === 'non_conforme' ? 'rgba(255,68,68,0.15)' : 'rgba(74,122,155,0.15)') : 'rgba(10,22,40,0.5)',
                                          border: `1px solid ${r === s ? (s === 'conforme' ? 'rgba(0,230,118,0.5)' : s === 'non_conforme' ? 'rgba(255,68,68,0.5)' : 'rgba(74,122,155,0.4)') : '#1e3a5f'}`,
                                          color: r === s ? (s === 'conforme' ? '#00e676' : s === 'non_conforme' ? '#ff4444' : '#7bacc8') : '#4a7a9b',
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
                                      style={{ background: '#0a1628', border: '1px solid rgba(255,68,68,0.3)', color: '#e8f4fd' }} />
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
                <div className="text-sm mt-1" style={{ color: '#7bacc8' }}>Taux de conformité</div>
                <div className="text-xs mt-2" style={{ color: '#4a7a9b' }}>{totalFilled} points renseignés · {totalNC} non-conformité{totalNC > 1 ? 's' : ''}</div>
              </div>
              {totalNC > 0 ? (
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#4a7a9b' }}>NON-CONFORMITÉS — {totalNC} ACTIONS GÉNÉRÉES</div>
                  <div className="space-y-2">
                    {checklistItems.filter(i => resultats[i.id] === 'non_conforme').map(item => (
                      <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                        style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
                        <XCircle size={14} style={{ color: '#ff4444', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div className="text-xs font-medium" style={{ color: '#ff8888' }}>{item.point}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>
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
                    <div className="text-xs mt-0.5" style={{ color: '#7bacc8' }}>Aucune non-conformité — autorisation de départ validée.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #1e3a5f' }}>
          {step !== 'info'
            ? <button onClick={() => setStep(step === 'recap' ? 'checklist' : 'info')} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#1e3a5f', color: '#7bacc8' }}>← Retour</button>
            : <div />}
          {step === 'info' && (
            <button onClick={() => setStep('checklist')} disabled={!vehiculeId || !chauffeurId}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: vehiculeId && chauffeurId ? 'linear-gradient(135deg,#00d4ff,#0077aa)' : '#1e3a5f', color: vehiculeId && chauffeurId ? '#020817' : '#4a7a9b' }}>
              Démarrer l'inspection →
            </button>
          )}
          {step === 'checklist' && (
            <button onClick={() => setStep('recap')} disabled={totalFilled < checklistItems.length * 0.8}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: totalFilled >= checklistItems.length * 0.8 ? 'linear-gradient(135deg,#00d4ff,#0077aa)' : '#1e3a5f', color: totalFilled >= checklistItems.length * 0.8 ? '#020817' : '#4a7a9b' }}>
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

function ActionRow({ action }: { action: ActionCorrectrice }) {
  const v = vehicles.find(x => x.id === action.vehiculeId);
  const d = drivers.find(x => x.id === action.chauffeurId);
  const pColor = prioriteColor(action.priorite);
  const sColor = statutColor(action.statut);
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: pColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: '#c8e0f0' }}>{action.point}</div>
        <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>
          {action.categorie}{v && <> · <span style={{ color: '#7bacc8' }}>{v.immatriculation}</span></>}{d && <> · {d.prenom} {d.nom}</>}
        </div>
        {action.commentaire && <div className="text-xs mt-0.5 italic truncate" style={{ color: '#4a7a9b' }}>{action.commentaire}</div>}
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs px-2 py-0.5 rounded-full mb-1 inline-block"
          style={{ background: `${pColor}15`, color: pColor, border: `1px solid ${pColor}40` }}>{action.priorite}</div>
        <div className="block text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${sColor}15`, color: sColor, border: `1px solid ${sColor}40` }}>{statutLabel(action.statut)}</div>
      </div>
      <div className="text-right text-xs flex-shrink-0" style={{ color: '#4a7a9b', minWidth: 72 }}>
        <Calendar size={11} className="inline mr-1" />{action.dateEcheance}
        <div className="mt-1" style={{ color: '#2a5070' }}>{action.responsable.split(' ').slice(-1)[0]}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'scoring' | 'checklist';

export default function Securite() {
  const [tab, setTab] = useState<Tab>('scoring');

  // Scoring state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critique' | 'warning' | 'info'>('all');

  // Checklist state
  const [showForm, setShowForm] = useState(false);
  const [allInspections, setAllInspections] = useState<Inspection[]>(inspections);
  const [allActions, setAllActions] = useState<ActionCorrectrice[]>(actionsCorrectices);
  const [actionFilter, setActionFilter] = useState<ActionStatut | 'all'>('all');
  const [prioriteFilter, setPrioriteFilter] = useState<ActionPriorite | 'all'>('all');
  const [selectedInspId, setSelectedInspId] = useState<string | null>(null);

  const handleInspSubmit = (insp: Inspection, actions: ActionCorrectrice[]) => {
    setAllInspections(prev => [insp, ...prev]);
    setAllActions(prev => [...actions, ...prev]);
    setShowForm(false);
  };

  // Scoring derived
  const sorted = [...drivers].sort((a, b) => b.scoreGlobal - a.scoreGlobal);
  const avgScore = Math.round(drivers.reduce((s, d) => s + d.scoreGlobal, 0) / drivers.length);
  const criticals = drivers.filter(d => d.scoreGlobal < 70).length;
  const excellent = drivers.filter(d => d.scoreGlobal >= 90).length;
  const filteredAlerts = alerts.filter(a => alertFilter === 'all' || a.level === alertFilter);
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
  const radarData = useMemo(() => buildRadarData(allInspections), [allInspections]);
  const catBarData = useMemo(() => buildCatBarData(allInspections), [allInspections]);
  const filteredActions = useMemo(() => allActions.filter(a =>
    (actionFilter === 'all' || a.statut === actionFilter) &&
    (prioriteFilter === 'all' || a.priorite === prioriteFilter)
  ), [allActions, actionFilter, prioriteFilter]);
  const selectedInsp = allInspections.find(i => i.id === selectedInspId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Module Sécurité" subtitle="Scoring conducteurs, alertes, check-list et plan d'actions" />

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-0">
        {([
          { key: 'scoring',   label: 'Scoring & Alertes',        icon: ShieldCheck },
          { key: 'checklist', label: 'Check-list & Plan d\'actions', icon: ClipboardCheck },
        ] as { key: Tab; label: string; icon: React.FC<{ size?: number; style?: React.CSSProperties }> }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all"
            style={{
              background: tab === key ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: tab === key ? '#00d4ff' : '#4a7a9b',
              borderBottom: tab === key ? '2px solid #00d4ff' : '2px solid transparent',
            }}>
            <Icon size={15} style={{ color: tab === key ? '#00d4ff' : '#4a7a9b' }} />
            {label}
          </button>
        ))}
      </div>
      <div style={{ height: 1, background: '#1e3a5f', margin: '0 24px' }} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── Tab Scoring & Alertes ─────────────────────────────────────── */}
        {tab === 'scoring' && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Score moyen flotte" value={avgScore} unit="/100"
              icon={ShieldCheck} iconColor="#00e676" iconBg="rgba(0,230,118,0.1)"
              trend={4} trendLabel="amélioration ce mois" glowClass="glow-success" />
            <KPICard label="Conducteurs excellents" value={excellent} unit={`/${drivers.length}`}
              icon={TrendingUp} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
              trendLabel="Score ≥ 90/100" />
            <KPICard label="Conducteurs à risque" value={criticals}
              icon={TrendingDown} iconColor="#ff4444" iconBg="rgba(255,68,68,0.1)"
              trendLabel="Score < 70/100" glowClass={criticals > 0 ? 'glow-danger' : ''} />
            <KPICard label="Alertes non lues" value={alerts.filter(a => !a.lu).length}
              icon={Bell} iconColor="#ffb300" iconBg="rgba(255,179,0,0.1)"
              trendLabel={`${alerts.filter(a => a.level === 'critique' && !a.lu).length} critiques`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Classement sécurité conducteurs</span>
                <span className="text-xs" style={{ color: '#4a7a9b' }}>{drivers.length} conducteurs</span>
              </div>
              <div className="divide-y" style={{ borderColor: '#1e3a5f26' }}>
                {sorted.map((d, i) => {
                  const color = scoreColor(d.scoreGlobal);
                  return (
                    <div key={d.id} className="flex items-center gap-4 px-5 py-3 cursor-pointer table-row-hover"
                      onClick={() => setSelectedDriver(d)}>
                      <div className="w-6 text-center text-xs font-bold" style={{ color: i < 3 ? '#00d4ff' : '#2a5070' }}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${color}18`, border: `1.5px solid ${color}40`, color }}>
                        {d.prenom[0]}{d.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: '#e8f4fd' }}>{d.prenom} {d.nom}</div>
                        <div className="text-xs" style={{ color: '#4a7a9b' }}>{d.matricule} · {d.kmTotal.toLocaleString()} km</div>
                      </div>
                      <div className="w-24 hidden md:block">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#4a7a9b' }}>Score</span>
                          <span className="font-semibold" style={{ color }}>{d.scoreGlobal}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#1e3a5f' }}>
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
                      <Eye size={13} style={{ color: '#4a7a9b', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#e8f4fd' }}>Évolution score moyen flotte</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={scoreTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis dataKey="m" tick={{ fill: '#4a7a9b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: '#4a7a9b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="#00e676" strokeWidth={2.5} dot={{ fill: '#00e676', r: 3 }} name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Alertes sécurité</h3>
                  <Activity size={14} style={{ color: '#ff4444' }} />
                </div>
                <div className="flex gap-1 mb-3">
                  {(['all', 'critique', 'warning', 'info'] as const).map(f => (
                    <button key={f} onClick={() => setAlertFilter(f)}
                      className="flex-1 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: alertFilter === f ? 'rgba(0,212,255,0.12)' : 'transparent', color: alertFilter === f ? '#00d4ff' : '#4a7a9b', border: `1px solid ${alertFilter === f ? 'rgba(0,212,255,0.3)' : 'transparent'}` }}>
                      {f === 'all' ? 'Tout' : f === 'critique' ? '🚨' : f === 'warning' ? '⚠️' : 'ℹ️'}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredAlerts.map(a => (
                    <div key={a.id} className={`px-3 py-2.5 rounded-lg ${!a.lu ? 'border-l-2' : ''}`}
                      style={{ background: a.level === 'critique' ? 'rgba(255,68,68,0.06)' : a.level === 'warning' ? 'rgba(255,179,0,0.06)' : 'rgba(10,22,40,0.5)', border: `1px solid ${a.level === 'critique' ? 'rgba(255,68,68,0.2)' : a.level === 'warning' ? 'rgba(255,179,0,0.15)' : '#1e3a5f'}`, borderLeftColor: !a.lu ? (a.level === 'critique' ? '#ff4444' : '#ffb300') : undefined }}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm">{alertTypeIcon[a.type] || '⚠️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: '#7bacc8' }}>{a.message}</p>
                          <p className="text-xs mt-1" style={{ color: '#2a5070' }}>{a.timestamp}</p>
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
              icon={ClipboardCheck} iconColor="#00e676" iconBg="rgba(0,230,118,0.1)"
              trend={2} trendLabel="vs mois précédent" glowClass="glow-success" />
            <KPICard label="Actions ouvertes" value={openActions}
              icon={AlertTriangle} iconColor="#ffb300" iconBg="rgba(255,179,0,0.1)"
              trendLabel={`${critiqueOpen} critique${critiqueOpen > 1 ? 's' : ''}`}
              glowClass={critiqueOpen > 0 ? 'glow-danger' : ''} />
            <KPICard label="Inspections ce mois" value={thisMonthInsp}
              icon={BarChart3} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
              trendLabel={`${checklistItems.length} points / contrôle`} />
            <KPICard label="Véhicules conformes" value={conformeVehicules} unit={`/${vehicles.length}`}
              icon={ShieldAlert} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Conformité par catégorie</h3>
                <TrendUp size={14} style={{ color: '#00e676' }} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catBarData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="cat" tick={{ fill: '#4a7a9b', fontSize: 10 }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fill: '#4a7a9b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, _n, p) => [`${v ?? 0}% (${(p.payload as { nc: number }).nc} NC)`, 'Conformité']} />
                  <Bar dataKey="taux" radius={[4, 4, 0, 0]} fill="#00d4ff"
                    label={{ position: 'top', fill: '#7bacc8', fontSize: 10, formatter: (v: unknown) => `${v}%` }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#e8f4fd' }}>Tendance conformité flotte</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={conformiteTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis dataKey="mois" tick={{ fill: '#4a7a9b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fill: '#4a7a9b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="taux" stroke="#00e676" strokeWidth={2.5} dot={{ fill: '#00e676', r: 3 }} name="Taux %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold mb-1" style={{ color: '#4a7a9b' }}>RADAR CONFORMITÉ</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 15, left: 15, bottom: 0 }}>
                    <PolarGrid stroke="#1e3a5f" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a7a9b', fontSize: 9 }} />
                    <Radar dataKey="taux" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <div>
                  <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Plan d'actions correctives</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: critiqueOpen > 0 ? 'rgba(255,68,68,0.12)' : 'rgba(0,230,118,0.1)', color: critiqueOpen > 0 ? '#ff4444' : '#00e676' }}>
                    {openActions} ouverte{openActions > 1 ? 's' : ''}
                  </span>
                </div>
                <Filter size={13} style={{ color: '#4a7a9b' }} />
              </div>
              <div className="px-5 py-2.5 flex gap-2 flex-wrap" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                <div className="flex gap-1">
                  {(['all', 'ouverte', 'en_cours', 'cloturee'] as const).map(f => (
                    <button key={f} onClick={() => setActionFilter(f)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: actionFilter === f ? 'rgba(0,212,255,0.12)' : 'transparent', color: actionFilter === f ? '#00d4ff' : '#4a7a9b', border: `1px solid ${actionFilter === f ? 'rgba(0,212,255,0.3)' : 'transparent'}` }}>
                      {f === 'all' ? 'Tous' : f === 'ouverte' ? '🔴 Ouvertes' : f === 'en_cours' ? '🟡 En cours' : '✅ Clôturées'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(['all', 'critique', 'haute', 'normale'] as const).map(f => (
                    <button key={f} onClick={() => setPrioriteFilter(f)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                      style={{ background: prioriteFilter === f ? 'rgba(255,179,0,0.1)' : 'transparent', color: prioriteFilter === f ? '#ffb300' : '#4a7a9b', border: `1px solid ${prioriteFilter === f ? 'rgba(255,179,0,0.3)' : 'transparent'}` }}>
                      {f === 'all' ? 'Toutes' : f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
                {filteredActions.length === 0
                  ? <div className="px-5 py-8 text-center text-sm" style={{ color: '#4a7a9b' }}>Aucune action correspondante</div>
                  : filteredActions.map(a => <ActionRow key={a.id} action={a} />)}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Dernières inspections</span>
                <span className="text-xs" style={{ color: '#4a7a9b' }}>{allInspections.length} au total</span>
              </div>
              <div className="divide-y" style={{ borderColor: '#1e3a5f26' }}>
                {allInspections.slice(0, 8).map(insp => {
                  const v = vehicles.find(x => x.id === insp.vehiculeId);
                  const d = drivers.find(x => x.id === insp.chauffeurId);
                  const isSelected = selectedInspId === insp.id;
                  const tColor = insp.tauxConformite >= 95 ? '#00e676' : insp.tauxConformite >= 80 ? '#ffb300' : '#ff4444';
                  return (
                    <div key={insp.id} className="px-4 py-3 cursor-pointer transition-all"
                      style={{ background: isSelected ? 'rgba(0,212,255,0.06)' : 'transparent' }}
                      onClick={() => setSelectedInspId(isSelected ? null : insp.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                          style={{ background: `${tColor}15`, border: `1.5px solid ${tColor}40`, color: tColor }}>
                          {insp.tauxConformite}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate" style={{ color: '#e8f4fd' }}>{v?.immatriculation || 'N/A'}</div>
                          <div className="text-xs truncate" style={{ color: '#4a7a9b' }}>
                            {d ? `${d.prenom} ${d.nom}` : '—'} · {insp.date.slice(0, 10)}
                          </div>
                        </div>
                        {insp.statut === 'conforme' ? <CheckCircle2 size={14} style={{ color: '#00e676' }} /> : <XCircle size={14} style={{ color: '#ff4444' }} />}
                        <Eye size={12} style={{ color: '#2a5070' }} />
                      </div>
                      {isSelected && selectedInsp && (
                        <div className="mt-3 space-y-1.5 pl-1">
                          {Object.entries(selectedInsp.resultats).filter(([, v]) => v === 'non_conforme').map(([itemId]) => {
                            const item = checklistItems.find(i => i.id === itemId);
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
      </div>

      {selectedDriver && <DriverPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
      {showForm && <InspectionForm onClose={() => setShowForm(false)} onSubmit={handleInspSubmit} />}
    </div>
  );
}
