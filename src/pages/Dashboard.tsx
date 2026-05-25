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
import {
  missions, alerts, drivers, vehicles,
  activityData, fuelData, incidentData,
  statusLabel, statusColor, alertLevelColor
} from '../data/mock';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3" style={{ background: '#0f2040', border: '1px solid #1e3a5f', fontSize: 12 }}>
      <p className="font-semibold mb-1" style={{ color: '#7bacc8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  const activeVehicles  = vehicles.filter(v => v.status === 'actif').length;
  const activeMissions  = missions.filter(m => m.status === 'en_cours').length;
  const incidentMissions= missions.filter(m => m.status === 'incident' || m.status === 'retard').length;
  const avgScore        = Math.round(drivers.reduce((s, d) => s + d.scoreGlobal, 0) / drivers.length);
  const unreadAlerts    = alerts.filter(a => !a.lu).length;
  const todayDelivered  = missions.filter(m => m.status === 'livree').length;

  const recentMissions  = missions.slice(0, 5);
  const criticalAlerts  = alerts.filter(a => !a.lu).slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Dashboard Opérationnel" subtitle="Vue temps réel de la flotte — Lundi 25 Mai 2025" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard label="Véhicules actifs"  value={activeVehicles}  unit={`/${vehicles.length}`}
            icon={Truck} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
            trend={5} trendLabel="vs semaine dernière" glowClass="glow-accent"
            onClick={() => navigate('/exploitation')} />
          <KPICard label="Missions en cours" value={activeMissions}
            icon={Clock} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
            trendLabel="3 planifiées aujourd'hui"
            onClick={() => navigate('/exploitation')} />
          <KPICard label="Livrées aujourd'hui" value={todayDelivered}
            icon={CheckCircle} iconColor="#00e676" iconBg="rgba(0,230,118,0.1)"
            trend={8} trendLabel="taux ponctualité 94%" glowClass="glow-success" />
          <KPICard label="Score sécurité moy." value={avgScore} unit="/100"
            icon={ShieldCheck} iconColor={avgScore >= 85 ? '#00e676' : avgScore >= 70 ? '#ffb300' : '#ff4444'}
            iconBg={avgScore >= 85 ? 'rgba(0,230,118,0.1)' : 'rgba(255,179,0,0.1)'}
            trend={3} trendLabel="amélioration ce mois" glowClass="glow-success"
            onClick={() => navigate('/securite')} />
          <KPICard label="Alertes actives"   value={unreadAlerts}
            icon={AlertTriangle} iconColor="#ff4444" iconBg="rgba(255,68,68,0.1)"
            trendLabel={`${alerts.filter(a => a.level === 'critique' && !a.lu).length} critiques`} glowClass="glow-danger"
            onClick={() => navigate('/securite')} />
          <KPICard label="Incidents / retards" value={incidentMissions}
            icon={Zap} iconColor="#ffb300" iconBg="rgba(255,179,0,0.1)"
            trendLabel="sur missions du jour" glowClass="glow-warning" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Activity Chart */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Activité Flotte — 7 derniers jours</h3>
                <p className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>Missions planifiées vs livrées</p>
              </div>
              <TrendingUp size={16} style={{ color: '#00d4ff' }} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="day" tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#7bacc8' }} />
                <Area type="monotone" dataKey="missions" name="Missions" stroke="#00d4ff" strokeWidth={2} fill="url(#gradMissions)" />
                <Area type="monotone" dataKey="livrees" name="Livrées" stroke="#00e676" strokeWidth={2} fill="url(#gradLivrees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fuel Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Consommation carburant</h3>
                <p className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>6 derniers mois (litres)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fuelData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="month" tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="litres" name="Litres" fill="#00d4ff" radius={[4,4,0,0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Missions + Alerts + Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Missions */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Missions du jour</h3>
              <button onClick={() => navigate('/exploitation')} className="flex items-center gap-1 text-xs"
                style={{ color: '#00d4ff' }}>Voir tout <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-2">
              {recentMissions.map(m => {
                const driver = drivers.find(d => d.id === m.chauffeurId);
                return (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg table-row-hover"
                    style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f1a' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold" style={{ color: '#00d4ff' }}>{m.reference}</span>
                        <Badge label={statusLabel[m.status]} className={statusColor[m.status]} />
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: '#4a7a9b' }}>
                        <MapPin size={9} className="inline mr-0.5" />{m.origine} → {m.destination}
                        {driver && <span className="ml-2">· {driver.prenom} {driver.nom}</span>}
                      </div>
                    </div>
                    {m.status === 'en_cours' && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold" style={{ color: '#e8f4fd' }}>{m.progression}%</div>
                        <div className="w-16 h-1.5 rounded-full mt-1" style={{ background: '#1e3a5f' }}>
                          <div className="h-full rounded-full" style={{ width: `${m.progression}%`, background: '#00d4ff' }} />
                        </div>
                      </div>
                    )}
                    {m.status === 'livree' && <CheckCircle size={16} style={{ color: '#00e676', flexShrink: 0 }} />}
                    {(m.status === 'incident' || m.status === 'retard') && <AlertTriangle size={16} style={{ color: '#ff4444', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Alertes récentes</h3>
              <button onClick={() => navigate('/securite')} className="flex items-center gap-1 text-xs"
                style={{ color: '#00d4ff' }}>Voir tout <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map(a => (
                <div key={a.id} className="px-3 py-2.5 rounded-lg"
                  style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f1a' }}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <Badge label={a.type} className={alertLevelColor[a.level]} />
                    </div>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: '#7bacc8' }}>{a.message}</p>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#2a5070' }}>{a.timestamp}</p>
                </div>
              ))}
            </div>

            {/* Incidents chart mini */}
            <div className="mt-4">
              <p className="text-xs font-medium mb-2" style={{ color: '#4a7a9b' }}>Incidents 6 mois</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={incidentData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fill: '#2a5070', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="accidents" name="Accidents" stackId="a" fill="#ff4444" fillOpacity={0.8} radius={[0,0,0,0]} />
                  <Bar dataKey="infractions" name="Infractions" stackId="a" fill="#ffb300" fillOpacity={0.8} />
                  <Bar dataKey="pannes" name="Pannes" stackId="a" fill="#7bacc8" fillOpacity={0.6} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Driver scores quick view */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Score conducteurs — classement</h3>
            <button onClick={() => navigate('/securite')} className="flex items-center gap-1 text-xs" style={{ color: '#00d4ff' }}>
              Détail <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...drivers].sort((a, b) => b.scoreGlobal - a.scoreGlobal).slice(0, 8).map((d, i) => {
              const color = d.scoreGlobal >= 90 ? '#00e676' : d.scoreGlobal >= 75 ? '#00d4ff' : d.scoreGlobal >= 60 ? '#ffb300' : '#ff4444';
              return (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f1a' }}>
                  <span className="text-xs font-bold w-4 text-center" style={{ color: i < 3 ? '#00d4ff' : '#2a5070' }}>#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: '#e8f4fd' }}>{d.prenom} {d.nom}</div>
                    <div className="w-full h-1 rounded-full mt-1" style={{ background: '#1e3a5f' }}>
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
