import { useState } from 'react';
import {
  ShieldCheck, TrendingDown, TrendingUp,
  Bell, Eye, X, Activity
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import { drivers, alerts, type Driver } from '../data/mock';

const alertTypeIcon: Record<string, string> = {
  INCIDENT: '🚨', RETARD: '⏱️', VITESSE: '⚡', MAINTENANCE: '🔧',
  DOCUMENT: '📄', FATIGUE: '😴', CARBURANT: '⛽',
};

const scoreColor = (s: number) =>
  s >= 90 ? '#00e676' : s >= 75 ? '#00d4ff' : s >= 60 ? '#ffb300' : '#ff4444';

const scoreGrade = (s: number) =>
  s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : 'D';

interface DriverPanelProps {
  driver: Driver;
  onClose: () => void;
}

function DriverPanel({ driver, onClose }: DriverPanelProps) {
  const radarData = [
    { subject: 'Vitesse',    A: driver.scoreVitesse },
    { subject: 'Freinage',   A: driver.scoreFreinage },
    { subject: 'Fatigue',    A: driver.scoreFatigue },
    { subject: 'Distraction',A: driver.scoreDistraction },
    { subject: 'Global',     A: driver.scoreGlobal },
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

        {/* Header */}
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

        {/* Score global */}
        <div className="px-4 py-4 rounded-xl mb-5 text-center"
          style={{ background: `${color}0a`, border: `1px solid ${color}25` }}>
          <div className="text-5xl font-black" style={{ color }}>{driver.scoreGlobal}</div>
          <div className="text-sm font-medium mt-1" style={{ color: '#7bacc8' }}>Score Global de Sécurité</div>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: `${color}20`, color }}>
            Grade {scoreGrade(driver.scoreGlobal)}
          </div>
        </div>

        {/* Radar chart */}
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

        {/* Score bars */}
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

        {/* Stats */}
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

        {/* Documents */}
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

        {/* Driver alerts */}
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

export default function Securite() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critique' | 'warning' | 'info'>('all');

  const sorted = [...drivers].sort((a, b) => b.scoreGlobal - a.scoreGlobal);
  const avgScore = Math.round(drivers.reduce((s, d) => s + d.scoreGlobal, 0) / drivers.length);
  const criticals = drivers.filter(d => d.scoreGlobal < 70).length;
  const excellent  = drivers.filter(d => d.scoreGlobal >= 90).length;

  const filteredAlerts = alerts.filter(a => alertFilter === 'all' || a.level === alertFilter);

  // Trend data for avg score
  const scoreTrend = [
    { m: 'Nov', score: 74 }, { m: 'Déc', score: 76 }, { m: 'Jan', score: 75 },
    { m: 'Fév', score: 78 }, { m: 'Mar', score: 80 }, { m: 'Avr', score: 82 },
    { m: 'Mai', score: avgScore },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Module Sécurité" subtitle="Scoring conducteurs, alertes et gestion des risques" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
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

          {/* Drivers table */}
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
              <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Classement sécurité conducteurs</span>
              <span className="text-xs" style={{ color: '#4a7a9b' }}>{drivers.length} conducteurs</span>
            </div>
            <div className="divide-y" style={{ borderColor: '#1e3a5f26' }}>
              {sorted.map((d, i) => {
                const color = scoreColor(d.scoreGlobal);
                return (
                  <div key={d.id}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer table-row-hover"
                    onClick={() => setSelectedDriver(d)}>
                    {/* Rank */}
                    <div className="w-6 text-center text-xs font-bold" style={{ color: i < 3 ? '#00d4ff' : '#2a5070' }}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                    </div>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${color}18`, border: `1.5px solid ${color}40`, color }}>
                      {d.prenom[0]}{d.nom[0]}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: '#e8f4fd' }}>{d.prenom} {d.nom}</div>
                      <div className="text-xs" style={{ color: '#4a7a9b' }}>{d.matricule} · {d.kmTotal.toLocaleString()} km</div>
                    </div>
                    {/* Score bar */}
                    <div className="w-24 hidden md:block">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#4a7a9b' }}>Score</span>
                        <span className="font-semibold" style={{ color }}>{d.scoreGlobal}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#1e3a5f' }}>
                        <div className="h-full rounded-full" style={{ width: `${d.scoreGlobal}%`, background: color }} />
                      </div>
                    </div>
                    {/* Grade */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${color}18`, color }}>
                      {scoreGrade(d.scoreGlobal)}
                    </div>
                    {/* Status */}
                    <div className="w-20 hidden lg:block">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        d.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                        d.status === 'repos' ? 'text-[#7bacc8] bg-[#7bacc810] border-[#7bacc840]' :
                        'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
                      }`}>{d.status}</span>
                    </div>
                    <Eye size={13} style={{ color: '#4a7a9b', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Score trend */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#e8f4fd' }}>
                Évolution score moyen flotte
              </h3>
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

            {/* Alerts feed */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Alertes sécurité</h3>
                <Activity size={14} style={{ color: '#ff4444' }} />
              </div>
              {/* Filter tabs */}
              <div className="flex gap-1 mb-3">
                {(['all','critique','warning','info'] as const).map(f => (
                  <button key={f} onClick={() => setAlertFilter(f)}
                    className="flex-1 py-1 rounded text-xs font-medium transition-all"
                    style={{
                      background: alertFilter === f ? 'rgba(0,212,255,0.12)' : 'transparent',
                      color: alertFilter === f ? '#00d4ff' : '#4a7a9b',
                      border: `1px solid ${alertFilter === f ? 'rgba(0,212,255,0.3)' : 'transparent'}`
                    }}>
                    {f === 'all' ? 'Tout' : f === 'critique' ? '🚨' : f === 'warning' ? '⚠️' : 'ℹ️'}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAlerts.map(a => (
                  <div key={a.id} className={`px-3 py-2.5 rounded-lg ${!a.lu ? 'border-l-2' : ''}`}
                    style={{
                      background: a.level === 'critique' ? 'rgba(255,68,68,0.06)' : a.level === 'warning' ? 'rgba(255,179,0,0.06)' : 'rgba(10,22,40,0.5)',
                      border: `1px solid ${a.level === 'critique' ? 'rgba(255,68,68,0.2)' : a.level === 'warning' ? 'rgba(255,179,0,0.15)' : '#1e3a5f'}`,
                      borderLeftColor: !a.lu ? (a.level === 'critique' ? '#ff4444' : '#ffb300') : undefined,
                    }}>
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
      </div>

      {selectedDriver && <DriverPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
    </div>
  );
}
