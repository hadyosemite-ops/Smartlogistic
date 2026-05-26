import {
  Truck, ShieldCheck, AlertTriangle, TrendingUp,
  CheckCircle, Clock, Zap, MapPin, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import {
  missions, alerts, drivers, vehicles,
  activityData, fuelData, incidentData,
  statusLabel, statusColor, alertLevelColor
} from '../data/mock';

export default function Dashboard() {
  const navigate = useNavigate();
  const { c } = useTheme();

  const activeVehicles   = vehicles.filter(v => v.status === 'actif').length;
  const activeMissions   = missions.filter(m => m.status === 'en_cours').length;
  const incidentMissions = missions.filter(m => m.status === 'incident' || m.status === 'retard').length;
  const avgScore         = Math.round(drivers.reduce((s, d) => s + d.scoreGlobal, 0) / drivers.length);
  const unreadAlerts     = alerts.filter(a => !a.lu).length;
  const todayDelivered   = missions.filter(m => m.status === 'livree').length;
  const recentMissions   = missions.slice(0, 5);
  const criticalAlerts   = alerts.filter(a => !a.lu).slice(0, 4);

  const tooltipStyle = { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Dashboard Opérationnel" subtitle="Vue temps réel de la flotte — Lundi 25 Mai 2025" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard label="Véhicules actifs"    value={activeVehicles}  unit={`/${vehicles.length}`}
            icon={Truck} iconColor={c.accent} iconBg={c.accentBg}
            trend={5} trendLabel="vs semaine dernière" glowClass="glow-accent"
            onClick={() => navigate('/exploitation')} />
          <KPICard label="Missions en cours"   value={activeMissions}
            icon={Clock} iconColor={c.accent} iconBg={c.accentBg}
            trendLabel="3 planifiées aujourd'hui"
            onClick={() => navigate('/exploitation')} />
          <KPICard label="Livrées aujourd'hui" value={todayDelivered}
            icon={CheckCircle} iconColor={c.success} iconBg={c.successBg}
            trend={8} trendLabel="taux ponctualité 94%" glowClass="glow-success" />
          <KPICard label="Score sécurité moy." value={avgScore} unit="/100"
            icon={ShieldCheck} iconColor={avgScore >= 85 ? c.success : avgScore >= 70 ? c.warning : c.danger}
            iconBg={avgScore >= 85 ? c.successBg : c.warningBg}
            trend={3} trendLabel="amélioration ce mois" glowClass="glow-success"
            onClick={() => navigate('/securite')} />
          <KPICard label="Alertes actives"     value={unreadAlerts}
            icon={AlertTriangle} iconColor={c.danger} iconBg={c.dangerBg}
            trendLabel={`${alerts.filter(a => a.level === 'critique' && !a.lu).length} critiques`} glowClass="glow-danger"
            onClick={() => navigate('/securite')} />
          <KPICard label="Incidents / retards" value={incidentMissions}
            icon={Zap} iconColor={c.warning} iconBg={c.warningBg}
            trendLabel="sur missions du jour" glowClass="glow-warning" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Activité Flotte — 7 derniers jours</h3>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>Missions planifiées vs livrées</p>
              </div>
              <TrendingUp size={16} style={{ color: c.accent }} />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLivrees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e676" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                <XAxis dataKey="day" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                <Area type="monotone" dataKey="missions" name="Missions" stroke="#00d4ff" strokeWidth={2} fill="url(#gradMissions)" />
                <Area type="monotone" dataKey="livrees" name="Livrées" stroke="#00e676" strokeWidth={2} fill="url(#gradLivrees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Consommation carburant</h3>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>6 derniers mois (litres)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fuelData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                <XAxis dataKey="month" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
                <Bar dataKey="litres" name="Litres" fill={c.accent} radius={[4,4,0,0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Missions du jour</h3>
              <button onClick={() => navigate('/exploitation')} className="flex items-center gap-1 text-xs"
                style={{ color: c.accent }}>Voir tout <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-2">
              {recentMissions.map(m => {
                const driver = drivers.find(d => d.id === m.chauffeurId);
                return (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg table-row-hover"
                    style={{ background: c.bgElevated, border: `1px solid ${c.borderFaint}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold" style={{ color: c.accent }}>{m.reference}</span>
                        <Badge label={statusLabel[m.status]} className={statusColor[m.status]} />
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>
                        <MapPin size={9} className="inline mr-0.5" />{m.origine} → {m.destination}
                        {driver && <span className="ml-2">· {driver.prenom} {driver.nom}</span>}
                      </div>
                    </div>
                    {m.status === 'en_cours' && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold" style={{ color: c.textPrimary }}>{m.progression}%</div>
                        <div className="w-16 h-1.5 rounded-full mt-1" style={{ background: c.border }}>
                          <div className="h-full rounded-full" style={{ width: `${m.progression}%`, background: c.accent }} />
                        </div>
                      </div>
                    )}
                    {m.status === 'livree' && <CheckCircle size={16} style={{ color: c.success, flexShrink: 0 }} />}
                    {(m.status === 'incident' || m.status === 'retard') && <AlertTriangle size={16} style={{ color: c.danger, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Alertes récentes</h3>
              <button onClick={() => navigate('/securite')} className="flex items-center gap-1 text-xs"
                style={{ color: c.accent }}>Voir tout <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map(a => (
                <div key={a.id} className="px-3 py-2.5 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.borderFaint}` }}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5"><Badge label={a.type} className={alertLevelColor[a.level]} /></div>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecondary }}>{a.message}</p>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: c.textFaint }}>{a.timestamp}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: c.textMuted }}>Incidents 6 mois</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={incidentData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fill: c.textFaint, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }} />
                  <Bar dataKey="accidents"  name="Accidents"   stackId="a" fill="#ff4444" fillOpacity={0.8} />
                  <Bar dataKey="infractions"name="Infractions" stackId="a" fill="#ffb300" fillOpacity={0.8} />
                  <Bar dataKey="pannes"     name="Pannes"      stackId="a" fill="#7bacc8" fillOpacity={0.6} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Driver scores */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: c.textPrimary }}>Score conducteurs — classement</h3>
            <button onClick={() => navigate('/securite')} className="flex items-center gap-1 text-xs" style={{ color: c.accent }}>
              Détail <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...drivers].sort((a, b) => b.scoreGlobal - a.scoreGlobal).slice(0, 8).map((d, i) => {
              const color = d.scoreGlobal >= 90 ? c.success : d.scoreGlobal >= 75 ? c.accent : d.scoreGlobal >= 60 ? c.warning : c.danger;
              return (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.borderFaint}` }}>
                  <span className="text-xs font-bold w-4 text-center" style={{ color: i < 3 ? c.accent : c.textFaint }}>#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: c.textPrimary }}>{d.prenom} {d.nom}</div>
                    <div className="w-full h-1 rounded-full mt-1" style={{ background: c.border }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${d.scoreGlobal}%`, background: color }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{d.scoreGlobal}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
