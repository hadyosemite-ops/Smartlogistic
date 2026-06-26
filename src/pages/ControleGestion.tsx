import { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import { useTheme } from '../context/ThemeContext';
import DataState from '../components/ui/DataState';
import {
  useVoyageCosts, useClientRevenue, useRoutePerf,
  useFinancialByMonth, useMissions, useDrivers, useVehicles,
} from '../hooks/useFleetData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)} M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)} K`
    : `${n}`;

const PIE_COLORS = ['#00d4ff', '#ff4444', '#ffb300', '#00e676', '#7bacc8'];

// ─── VoyageDetail panel ───────────────────────────────────────────────────────

interface VoyageDetailProps {
  missionId: string;
  onClose: () => void;
}

import type { Mission, VoyageCost, Driver, Vehicle } from '../data/mock';

function VoyageDetail({ missionId, onClose, missions, voyageCosts, drivers, vehicles }: VoyageDetailProps & {
  missions: Mission[]; voyageCosts: VoyageCost[]; drivers: Driver[]; vehicles: Vehicle[];
}) {
  const { c } = useTheme();
  const mission = missions.find(m => m.id === missionId);
  const cost    = voyageCosts.find(v => v.missionId === missionId);
  if (!mission || !cost) return null;

  const driver  = drivers.find(d => d.id === mission.chauffeurId);
  const vehicle = vehicles.find(v => v.id === mission.vehiculeId);
  const marge   = mission.prixHT - cost.total;
  const margePct = Math.round((marge / mission.prixHT) * 100);
  const margeColor = margePct >= 40 ? '#00e676' : margePct >= 25 ? '#ffb300' : '#ff4444';

  const costBreakdown = [
    { label: 'Carburant',      value: cost.carburant,        pct: Math.round((cost.carburant / cost.total) * 100),       color: '#ff4444' },
    { label: 'Salaire',        value: cost.salaireChauffeur, pct: Math.round((cost.salaireChauffeur / cost.total) * 100), color: '#ffb300' },
    { label: 'Péages',         value: cost.peages,           pct: Math.round((cost.peages / cost.total) * 100),           color: '#00d4ff' },
    { label: 'Amortissement',  value: cost.amortissement,    pct: Math.round((cost.amortissement / cost.total) * 100),    color: '#7bacc8' },
    { label: 'Assurance',      value: cost.assurance,        pct: Math.round((cost.assurance / cost.total) * 100),        color: '#00e676' },
    { label: 'Divers',         value: cost.divers,           pct: Math.round((cost.divers / cost.total) * 100),           color: '#4a7a9b' },
  ];

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
            <p className="text-xs font-mono mb-1" style={{ color: c.textMuted }}>{mission.reference}</p>
            <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>{mission.client}</h3>
            <p className="text-sm" style={{ color: c.textSecondary }}>{mission.origine} → {mission.destination}</p>
            <p className="text-xs mt-1" style={{ color: c.textMuted }}>
              {mission.distance} km · {mission.poids > 0 ? `${mission.poids}t` : 'Retour vide'} · {mission.chargement}
            </p>
          </div>
          <button onClick={onClose} className="text-lg leading-none" style={{ color: c.textMuted }}>✕</button>
        </div>

        {/* P&L */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Chiffre d\'affaires', value: `${mission.prixHT.toLocaleString()} MAD`, color: c.accent },
            { label: 'Coût de revient',     value: `${cost.total.toLocaleString()} MAD`,     color: '#ff4444' },
            { label: 'Marge nette',         value: `${marge.toLocaleString()} MAD`,           color: margeColor },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-3 py-2.5 rounded-xl text-center"
              style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
              <div className="text-sm font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Marge % bar */}
        <div className="px-4 py-3 rounded-xl mb-5"
          style={{ background: `${margeColor}0a`, border: `1px solid ${margeColor}25` }}>
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: c.textSecondary }}>Taux de marge</span>
            <span className="font-black text-lg" style={{ color: margeColor }}>{margePct}%</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: c.border }}>
            <div className="h-full rounded-full" style={{ width: `${margePct}%`, background: `linear-gradient(90deg, ${margeColor}80, ${margeColor})` }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: c.textMuted }}>
            {mission.distance > 0 ? `${(cost.total / mission.distance).toFixed(2)} MAD/km` : '—'}
            {' · '}
            {mission.poids > 0 ? `${(mission.prixHT / mission.poids).toFixed(0)} MAD/tonne` : '—'}
          </p>
        </div>

        {/* Cost breakdown bars */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
            Décomposition coût de revient
          </h4>
          <div className="space-y-2.5">
            {costBreakdown.map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: c.textSecondary }}>{label}</span>
                  <span className="font-semibold" style={{ color }}>
                    {value.toLocaleString()} MAD <span style={{ color: c.textMuted }}>({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition CSS */}
        <div className="mb-5">
          <div className="flex h-4 rounded overflow-hidden mb-2">
            {costBreakdown.map((s, i) => (
              <div key={i} title={`${s.label}: ${s.value.toLocaleString()} MAD`}
                style={{ width: `${s.pct}%`, background: s.color, opacity: 0.85 }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {costBreakdown.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                <span style={{ color: c.textSecondary }}>{s.label}</span>
                <span className="ml-auto font-semibold" style={{ color: s.color }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver & Vehicle */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="px-3 py-2.5 rounded-lg" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
            <div className="text-xs mb-1" style={{ color: c.textMuted }}>Conducteur</div>
            <div className="font-semibold" style={{ color: c.textPrimary }}>
              {driver ? `${driver.prenom} ${driver.nom}` : '—'}
            </div>
            {driver && <div style={{ color: c.textMuted }}>{driver.matricule}</div>}
          </div>
          <div className="px-3 py-2.5 rounded-lg" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
            <div className="text-xs mb-1" style={{ color: c.textMuted }}>Véhicule</div>
            <div className="font-semibold font-mono" style={{ color: c.accent }}>
              {vehicle?.immatriculation ?? '—'}
            </div>
            {vehicle && <div style={{ color: c.textMuted }}>{vehicle.marque} {vehicle.modele}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'synthese' | 'clients' | 'routes' | 'voyages';

export default function ControleGestion() {
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('synthese');
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const { data: financialByMonth, loading: lf, error: ef } = useFinancialByMonth();
  const { data: voyageCosts,      loading: lvc, error: evc } = useVoyageCosts();
  const { data: missions,         loading: lm, error: em }  = useMissions();
  const { data: clientRevenue,    loading: lcr, error: ecr } = useClientRevenue();
  const { data: routePerf,        loading: lr, error: er }  = useRoutePerf();
  const { data: drivers,          loading: ld, error: ed }  = useDrivers();
  const { data: vehicles,         loading: lv, error: ev }  = useVehicles();

  const loading = lf || lvc || lm || lcr || lr || ld || lv;
  const error   = ef || evc || em || ecr || er || ed || ev;

  const safeFin   = financialByMonth ?? [];
  const safeVC    = voyageCosts      ?? [];
  const safeMiss  = missions         ?? [];
  const safeCR    = clientRevenue    ?? [];
  const safeRP    = routePerf        ?? [];
  const safeDrv   = drivers          ?? [];
  const safeVeh   = vehicles         ?? [];

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const lastMonth  = safeFin[safeFin.length - 1] ?? { ca: 0, marge: 0, carburant: 0, maintenance: 0, salaires: 0 };
  const prevMonth  = safeFin[safeFin.length - 2] ?? { ca: 1, marge: 1 };
  const trendCA    = prevMonth.ca ? Math.round(((lastMonth.ca - prevMonth.ca) / prevMonth.ca) * 100) : 0;
  const trendMarge = prevMonth.marge ? Math.round(((lastMonth.marge - prevMonth.marge) / prevMonth.marge) * 100) : 0;
  const coutKmMoyen  = safeVC.length > 0 ? (safeVC.reduce((s, v) => {
    const m = safeMiss.find(x => x.id === v.missionId);
    return s + (m ? v.total / (m.distance || 1) : 0);
  }, 0) / safeVC.length).toFixed(2) : '0';
  const missWithCost = safeMiss.filter(m => safeVC.some(v => v.missionId === m.id));
  const margeMoyenne = missWithCost.length > 0 ? Math.round(
    missWithCost.reduce((s, m) => {
      const costV = safeVC.find(v => v.missionId === m.id);
      return costV ? s + ((m.prixHT - costV.total) / m.prixHT) * 100 : s;
    }, 0) / missWithCost.length
  ) : 0;

  // ── Budget vs réel ──────────────────────────────────────────────────────
  const budgetData = [
    { cat: 'Carburant',    budget: 42000, reel: Number(lastMonth.carburant)   },
    { cat: 'Maintenance',  budget: 12000, reel: Number(lastMonth.maintenance) },
    { cat: 'Salaires',     budget: 44000, reel: Number(lastMonth.salaires)    },
    { cat: 'Péages',       budget: 9000,  reel: 8940                          },
    { cat: 'Assurance',    budget: 7500,  reel: 7200                          },
  ];

  const tooltipStyle = { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Contrôle de Gestion"
        subtitle="Rentabilité, coûts de revient et performance financière de la flotte"
      />
      <DataState loading={loading} error={error}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="CA mensuel (Mai)"
            value={fmt(lastMonth.ca)}
            unit="MAD"
            icon={DollarSign}
            iconColor={c.accent}
            iconBg={c.accentBg}
            trend={trendCA}
            trendLabel="vs avril"
            glowClass="glow-accent"
          />
          <KPICard
            label="Marge brute (Mai)"
            value={fmt(lastMonth.marge)}
            unit="MAD"
            icon={TrendingUp}
            iconColor="#00e676"
            iconBg={c.successBg}
            trend={trendMarge}
            trendLabel={`${Math.round((lastMonth.marge / lastMonth.ca) * 100)}% du CA`}
            glowClass="glow-success"
          />
          <KPICard
            label="Coût moyen / km"
            value={coutKmMoyen}
            unit="MAD"
            icon={BarChart2}
            iconColor="#ffb300"
            iconBg={c.warningBg}
            trendLabel="tous véhicules · mai"
          />
          <KPICard
            label="Marge moy. voyage"
            value={margeMoyenne}
            unit="%"
            icon={margeMoyenne >= 35 ? TrendingUp : TrendingDown}
            iconColor={margeMoyenne >= 35 ? '#00e676' : '#ffb300'}
            iconBg={margeMoyenne >= 35 ? c.successBg : c.warningBg}
            trendLabel="par mission (8 OT)"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          {([
            { key: 'synthese', label: '📈 Synthèse financière' },
            { key: 'clients',  label: '🏢 Rentabilité clients' },
            { key: 'routes',   label: '🗺️ Performance routes' },
            { key: 'voyages',  label: '🚛 Coûts voyages' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t.key ? c.accentBg : 'transparent',
                color: activeTab === t.key ? c.accent : c.textMuted,
                border: `1px solid ${activeTab === t.key ? c.accentBorder : 'transparent'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1 — SYNTHÈSE FINANCIÈRE ══ */}
        {activeTab === 'synthese' && (
          <div className="space-y-4">

            {/* Area chart */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-1" style={{ color: c.textPrimary }}>
                Évolution CA · Coûts · Marge (7 derniers mois)
              </h3>
              <p className="text-xs mb-4" style={{ color: c.textMuted }}>Données en MAD</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={safeFin} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCA"    x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCout"  x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff4444" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gMarge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00e676" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                  <XAxis dataKey="month" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                  <Area type="monotone" dataKey="ca"    name="CA"    stroke="#00d4ff" fill="url(#gCA)"    strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="couts" name="Coûts" stroke="#ff4444" fill="url(#gCout)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="marge" name="Marge" stroke="#00e676" fill="url(#gMarge)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Budget vs Réel + Décomposition coûts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Budget vs Réel */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                  Budget vs Réel — Mai 2025
                </h3>
                <div className="space-y-3">
                  {budgetData.map(({ cat, budget, reel }) => {
                    const diff    = reel - budget;
                    const diffPct = Math.round((diff / budget) * 100);
                    const over    = diff > 0;
                    const clr     = over ? '#ff4444' : '#00e676';
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span style={{ color: c.textSecondary }}>{cat}</span>
                          <div className="flex items-center gap-2">
                            <span style={{ color: c.textMuted }}>
                              Budget: {budget.toLocaleString()} MAD
                            </span>
                            <span className="flex items-center gap-0.5 font-semibold" style={{ color: clr }}>
                              {over ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                              {Math.abs(diffPct)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: c.border }}>
                          <div className="absolute top-0 h-full rounded-full"
                            style={{ width: '100%', background: c.accentBg, border: `1px solid ${c.accentBorder}` }} />
                          <div className="absolute top-0 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((reel / Math.max(budget, reel)) * 100, 100)}%`,
                              background: `linear-gradient(90deg, ${clr}88, ${clr})`,
                            }} />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span style={{ color: clr }}>{reel.toLocaleString()} MAD réel</span>
                          <span style={{ color: over ? '#ff8888' : '#66bb6a' }}>
                            {over ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`} MAD
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Décomposition coûts mai */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                  Structure des coûts — Mai 2025
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={[{
                      name: 'Mai',
                      Carburant:    lastMonth.carburant,
                      Maintenance:  lastMonth.maintenance,
                      Salaires:     lastMonth.salaires,
                      Autres:       lastMonth.couts - lastMonth.carburant - lastMonth.maintenance - lastMonth.salaires,
                    }]}
                    margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                    layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} horizontal={false} />
                    <XAxis type="number" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                    <Bar dataKey="Carburant"   stackId="a" fill="#ff4444" fillOpacity={0.85} />
                    <Bar dataKey="Salaires"    stackId="a" fill="#ffb300" fillOpacity={0.85} />
                    <Bar dataKey="Maintenance" stackId="a" fill="#00d4ff" fillOpacity={0.85} />
                    <Bar dataKey="Autres"      stackId="a" fill="#7bacc8" fillOpacity={0.85} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Totaux */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'CA',     value: lastMonth.ca,    color: c.accent },
                    { label: 'Coûts',  value: lastMonth.couts, color: '#ff4444' },
                    { label: 'Marge',  value: lastMonth.marge, color: '#00e676' },
                    { label: 'Taux',   value: `${Math.round((lastMonth.marge / lastMonth.ca) * 100)}%`, color: '#00e676' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="px-3 py-2 rounded-lg text-center"
                      style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                      <div className="text-sm font-bold" style={{ color }}>
                        {typeof value === 'number' ? `${value.toLocaleString()} MAD` : value}
                      </div>
                      <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2 — RENTABILITÉ CLIENTS ══ */}
        {activeTab === 'clients' && (
          <div className="space-y-4">

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                CA et Marge par client (YTD)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={safeCR} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                  <XAxis dataKey="client" tick={{ fill: c.textMuted, fontSize: 10, angle: -25, textAnchor: 'end' }}
                    axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                  <Bar dataKey="ca"    name="CA"    fill="#00d4ff" fillOpacity={0.85} radius={[4,4,0,0]} />
                  <Bar dataKey="marge" name="Marge" fill="#00e676" fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table clients */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  Tableau de rentabilité détaillé
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Client', 'CA (MAD)', 'Coût Revient', 'Marge', 'Taux marge', 'Missions', 'Km total', 'CA/km'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...safeCR].sort((a, b) => b.margePct - a.margePct).map((cr, idx) => {
                      const margeClr = cr.margePct >= 40 ? '#00e676' : cr.margePct >= 35 ? '#00d4ff' : cr.margePct >= 30 ? '#ffb300' : '#ff4444';
                      const caKm = (cr.ca / cr.km).toFixed(2);
                      return (
                        <tr key={cr.client} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                                style={{ background: `${PIE_COLORS[idx % 5]}22`, color: PIE_COLORS[idx % 5] }}>
                                {idx + 1}
                              </span>
                              <span className="text-sm font-medium" style={{ color: c.textPrimary }}>{cr.client}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.accent }}>{cr.ca.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>{cr.coutRevient.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: margeClr }}>{cr.marge.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full w-16" style={{ background: c.border }}>
                                <div className="h-full rounded-full" style={{ width: `${cr.margePct}%`, background: margeClr }} />
                              </div>
                              <span className="text-sm font-bold w-10" style={{ color: margeClr }}>{cr.margePct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>{cr.missions}</td>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: c.textSecondary }}>{cr.km.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.textPrimary }}>{caKm} MAD</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totaux footer */}
              <div className="px-5 py-3 grid grid-cols-4 gap-4" style={{ borderTop: `1px solid ${c.border}`, background: c.bgElevated }}>
                {[
                  { label: 'CA total',       value: `${safeCR.reduce((s,cr)=>s+cr.ca,0).toLocaleString()} MAD`,    color: c.accent },
                  { label: 'Marge totale',   value: `${safeCR.reduce((s,cr)=>s+cr.marge,0).toLocaleString()} MAD`, color: '#00e676' },
                  { label: 'Missions total', value: safeCR.reduce((s,cr)=>s+cr.missions,0),                         color: c.textSecondary },
                  { label: 'Km total',       value: `${safeCR.reduce((s,cr)=>s+cr.km,0).toLocaleString()} km`,     color: c.textSecondary },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                    <div className="text-sm font-bold" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3 — PERFORMANCE ROUTES ══ */}
        {activeTab === 'routes' && (
          <div className="space-y-4">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>CA par axe routier (MAD)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[...safeRP].sort((a,b) => b.ca - a.ca)}
                    layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} horizontal={false} />
                    <XAxis type="number" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="route" tick={{ fill: c.textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                    <Bar dataKey="ca" name="CA" fill="#00d4ff" fillOpacity={0.85} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>Taux de marge par axe (%)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[...routePerf].sort((a,b) => b.margePct - a.margePct)}
                    layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} horizontal={false} />
                    <XAxis type="number" tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false}
                      domain={[0, 60]} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="route" tick={{ fill: c.textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                    <Tooltip formatter={(v: any) => `${v}%`} contentStyle={tooltipStyle} />
                    <Bar dataKey="margePct" name="Marge %" fill="#00e676" fillOpacity={0.85} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Route table */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Détail par axe routier</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Axe routier', 'CA (MAD)', 'Coût / km', 'Taux marge', 'Missions', 'Rentabilité'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...safeRP].sort((a,b) => b.margePct - a.margePct).map((r, i) => {
                      const clr = r.margePct >= 42 ? '#00e676' : r.margePct >= 35 ? '#00d4ff' : r.margePct >= 30 ? '#ffb300' : '#ff4444';
                      const grade = r.margePct >= 42 ? 'A' : r.margePct >= 35 ? 'B' : r.margePct >= 30 ? 'C' : 'D';
                      return (
                        <tr key={r.route} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                style={{ background: `${clr}15`, color: clr, border: `1px solid ${clr}30` }}>#{i+1}</span>
                              <span className="font-medium" style={{ color: c.textPrimary }}>{r.route}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{ color: c.accent }}>{r.ca.toLocaleString()}</td>
                          <td className="px-4 py-3" style={{ color: c.textSecondary }}>{r.coutKm} MAD/km</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full w-16" style={{ background: c.border }}>
                                <div className="h-full rounded-full" style={{ width: `${r.margePct}%`, background: clr }} />
                              </div>
                              <span className="font-bold" style={{ color: clr }}>{r.margePct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3" style={{ color: c.textSecondary }}>{r.missions}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-black px-3 py-1 rounded-lg"
                              style={{ background: `${clr}15`, color: clr, border: `1px solid ${clr}30` }}>
                              {grade}
                            </span>
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

        {/* ══ TAB 4 — COÛTS VOYAGES ══ */}
        {activeTab === 'voyages' && (
          <div className="space-y-4">

            {/* Stacked bar CSS */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>
                Décomposition coût de revient par OT (MAD)
              </h3>
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { label: 'Carburant',     color: '#ff4444' },
                  { label: 'Salaire',       color: '#ffb300' },
                  { label: 'Péages',        color: '#00d4ff' },
                  { label: 'Amortissement', color: '#7bacc8' },
                  { label: 'Assurance',     color: '#00e676' },
                  { label: 'Divers',        color: '#4a7a9b' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: c.textSecondary }}>
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {safeVC.map(vc => {
                  const m      = safeMiss.find(x => x.id === vc.missionId);
                  const label  = m?.reference?.replace('OT-2025-', '#') ?? vc.missionId;
                  const maxVal = Math.max(...safeVC.map(v => v.total));
                  const segs   = [
                    { v: vc.carburant,        color: '#ff4444' },
                    { v: vc.salaireChauffeur, color: '#ffb300' },
                    { v: vc.peages,           color: '#00d4ff' },
                    { v: vc.amortissement,    color: '#7bacc8' },
                    { v: vc.assurance,        color: '#00e676' },
                    { v: vc.divers,           color: '#4a7a9b' },
                  ];
                  return (
                    <div key={vc.missionId} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-12 flex-shrink-0" style={{ color: c.accent }}>{label}</span>
                      <div className="flex-1 flex h-5 rounded overflow-hidden" style={{ background: c.border }}>
                        {segs.map((s, i) => (
                          <div key={i} style={{
                            width: `${(s.v / maxVal) * 100}%`,
                            background: s.color,
                            opacity: 0.85,
                          }} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold w-20 text-right flex-shrink-0" style={{ color: c.textPrimary }}>
                        {vc.total.toLocaleString()} MAD
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missions table */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Coût de revient détaillé par mission</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['OT', 'Client', 'Trajet', 'Prix HT', 'Coût Rev.', 'Marge', '%', 'MAD/km', 'Détail'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeMiss.map(m => {
                      const vc = safeVC.find(v => v.missionId === m.id);
                      if (!vc) return null;
                      const marge    = m.prixHT - vc.total;
                      const margePct = Math.round((marge / m.prixHT) * 100);
                      const madKm    = m.distance > 0 ? (vc.total / m.distance).toFixed(2) : '—';
                      const clr      = margePct >= 40 ? '#00e676' : margePct >= 30 ? '#ffb300' : '#ff4444';
                      return (
                        <tr key={m.id} className="table-row-hover cursor-pointer"
                          style={{ borderBottom: `1px solid ${c.borderFaint}` }}
                          onClick={() => setSelectedMission(m.id)}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold" style={{ color: c.accent }}>
                              {m.reference.replace('OT-2025-', '#')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{m.client}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>
                            {m.origine} → {m.destination}
                            <span className="ml-1" style={{ color: c.textFaint }}>({m.distance} km)</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.textPrimary }}>
                            {m.prixHT.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>
                            {vc.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: clr }}>
                            {marge.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-sm" style={{ color: clr }}>{margePct}%</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: c.textSecondary }}>{madKm}</td>
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

              {/* Footer totaux */}
              <div className="px-5 py-3 grid grid-cols-4 gap-4"
                style={{ borderTop: `1px solid ${c.border}`, background: c.bgElevated }}>
                {(() => {
                  const totalCA    = safeMiss.reduce((s,m) => s + m.prixHT, 0);
                  const totalCout  = safeVC.reduce((s,v) => s + v.total, 0);
                  const totalMarge = totalCA - totalCout;
                  const avgMarge   = Math.round((totalMarge / totalCA) * 100);
                  return [
                    { label: 'CA total',   value: `${totalCA.toLocaleString()} MAD`,    color: c.accent },
                    { label: 'Coûts',      value: `${totalCout.toLocaleString()} MAD`,  color: '#ff4444' },
                    { label: 'Marge',      value: `${totalMarge.toLocaleString()} MAD`, color: '#00e676' },
                    { label: 'Taux moyen', value: `${avgMarge}%`,                       color: '#00e676' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                      <div className="text-sm font-bold" style={{ color }}>{value}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

      </div>

      {selectedMission && (
        <VoyageDetail
          missionId={selectedMission}
          onClose={() => setSelectedMission(null)}
          missions={safeMiss}
          voyageCosts={safeVC}
          drivers={safeDrv}
          vehicles={safeVeh}
        />
      )}
      </DataState>
    </div>
  );
}
