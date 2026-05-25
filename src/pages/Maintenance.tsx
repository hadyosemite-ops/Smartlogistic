import { useState } from 'react';
import {
  Wrench, AlertTriangle, CheckCircle, Clock,
  X, ChevronRight, Plus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import {
  vehicles, interventions, maintenanceAlerts, maintenanceCostByMonth,
  type InterventionType
} from '../data/mock';

const typeLabel: Record<InterventionType, string> = {
  preventive:  'Préventive',
  corrective:  'Corrective',
  ct:          'Contrôle Tech.',
  pneus:       'Pneumatiques',
  carrosserie: 'Carrosserie',
};
const typeColor: Record<InterventionType, string> = {
  preventive:  'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  corrective:  'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
  ct:          'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
  pneus:       'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  carrosserie: 'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
};
const statusColor: Record<string, string> = {
  planifiee: 'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
  en_cours:  'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  terminee:  'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
};
const urgenceColor: Record<string, string> = {
  critique: '#ff4444',
  warning:  '#ffb300',
  ok:       '#00e676',
};

const PIE_COLORS = ['#00d4ff', '#ff4444', '#ffb300', '#00e676', '#7bacc8'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3" style={{ background: '#0f2040', border: '1px solid #1e3a5f', fontSize: 12 }}>
      <p className="font-semibold mb-1" style={{ color: '#7bacc8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value?.toLocaleString()} MAD</strong></p>
      ))}
    </div>
  );
};

interface VehicleDetailProps {
  vehiculeId: string;
  onClose: () => void;
}

function VehicleDetail({ vehiculeId, onClose }: VehicleDetailProps) {
  const v = vehicles.find(x => x.id === vehiculeId);
  if (!v) return null;

  const vehicleInterventions = interventions
    .filter(i => i.vehiculeId === vehiculeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCost = vehicleInterventions
    .filter(i => i.status === 'terminee')
    .reduce((s, i) => s + i.coutPieces + i.coutMainOeuvre, 0);

  const coutKm = v.kmActuel > 0 ? (totalCost / v.kmActuel * 100).toFixed(1) : '0';
  const alerts = maintenanceAlerts.filter(a => a.vehiculeId === vehiculeId);

  const scoreColor = v.scoreEtat >= 80 ? '#00e676' : v.scoreEtat >= 60 ? '#ffb300' : '#ff4444';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(2,8,23,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-lg h-full overflow-y-auto p-6"
        style={{ border: '1px solid #234878', borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-lg" style={{ color: '#00d4ff' }}>{v.immatriculation}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                v.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                v.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
                'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
              }`}>{v.status}</span>
            </div>
            <p className="font-semibold" style={{ color: '#e8f4fd' }}>{v.marque} {v.modele} — {v.annee}</p>
            <p className="text-xs" style={{ color: '#4a7a9b' }}>{v.type} · {v.kmActuel.toLocaleString()} km</p>
          </div>
          <button onClick={onClose} style={{ color: '#4a7a9b' }}><X size={18} /></button>
        </div>

        {/* Score état */}
        <div className="px-4 py-4 rounded-xl mb-5"
          style={{ background: `${scoreColor}0a`, border: `1px solid ${scoreColor}25` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#7bacc8' }}>Score état véhicule</span>
            <span className="text-2xl font-black" style={{ color: scoreColor }}>{v.scoreEtat}/100</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: '#1e3a5f' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${v.scoreEtat}%`, background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Coût total maint.', value: `${totalCost.toLocaleString()} MAD` },
            { label: 'Coût / 100 km', value: `${coutKm} MAD` },
            { label: 'Interventions', value: vehicleInterventions.length },
          ].map(({ label, value }) => (
            <div key={label} className="px-3 py-2.5 rounded-lg text-center"
              style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid #1e3a5f' }}>
              <div className="text-sm font-bold" style={{ color: '#e8f4fd' }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Prochaines échéances */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a7a9b' }}>
            Prochaines échéances
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
              <span style={{ color: '#7bacc8' }}>Prochaine vidange</span>
              <span style={{ color: '#ffb300' }}>{v.prochaineVidange.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
              <span style={{ color: '#7bacc8' }}>Contrôle technique</span>
              <span style={{ color: '#00d4ff' }}>{v.prochainCT}</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
              <span style={{ color: '#7bacc8' }}>Consommation moy.</span>
              <span style={{ color: '#e8f4fd' }}>{v.carburant} L/100km</span>
            </div>
          </div>
        </div>

        {/* Active alerts */}
        {alerts.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a7a9b' }}>
              Alertes actives
            </h4>
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1.5"
                style={{ background: `${urgenceColor[a.urgence]}08`, border: `1px solid ${urgenceColor[a.urgence]}25` }}>
                <AlertTriangle size={12} style={{ color: urgenceColor[a.urgence], flexShrink: 0 }} />
                <span className="text-xs flex-1" style={{ color: '#7bacc8' }}>{a.message}</span>
                <span className="text-xs font-mono" style={{ color: urgenceColor[a.urgence] }}>{a.echeance}</span>
              </div>
            ))}
          </div>
        )}

        {/* Intervention history */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a7a9b' }}>
            Historique interventions
          </h4>
          <div className="space-y-2">
            {vehicleInterventions.map(i => (
              <div key={i.id} className="px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge label={typeLabel[i.type]} className={typeColor[i.type]} />
                    <Badge label={i.status} className={statusColor[i.status]} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#e8f4fd' }}>
                    {(i.coutPieces + i.coutMainOeuvre).toLocaleString()} MAD
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: '#7bacc8' }}>{i.libelle}</p>
                <p className="text-xs mt-0.5" style={{ color: '#2a5070' }}>
                  {i.date} · {i.kmIntervention.toLocaleString()} km · {i.garage}
                </p>
                {i.notes && <p className="text-xs mt-1 italic" style={{ color: '#4a7a9b' }}>📝 {i.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flotte' | 'interventions' | 'couts'>('flotte');

  const totalCostMois = maintenanceCostByMonth[maintenanceCostByMonth.length - 1].total;
  const alertsCritiques = maintenanceAlerts.filter(a => a.urgence === 'critique').length;
  const alertsWarning   = maintenanceAlerts.filter(a => a.urgence === 'warning').length;
  const enMaintenance   = vehicles.filter(v => v.status === 'maintenance').length;
  const tauxDispo       = Math.round(((vehicles.length - enMaintenance) / vehicles.length) * 100);

  const pieData = [
    { name: 'Préventive', value: maintenanceCostByMonth.reduce((s, m) => s + m.preventive, 0) },
    { name: 'Corrective', value: maintenanceCostByMonth.reduce((s, m) => s + m.corrective, 0) },
    { name: 'Pneumatiques', value: maintenanceCostByMonth.reduce((s, m) => s + m.pneus, 0) },
  ];

  const pendingInterventions = interventions.filter(i => i.status === 'planifiee' || i.status === 'en_cours');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Module Maintenance" subtitle="Gestion préventive, corrective et suivi état de la flotte" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Taux de disponibilité" value={tauxDispo} unit="%"
            icon={CheckCircle} iconColor="#00e676" iconBg="rgba(0,230,118,0.1)"
            trend={2} trendLabel={`${enMaintenance} véhicule(s) en atelier`} glowClass="glow-success" />
          <KPICard label="Alertes critiques" value={alertsCritiques}
            icon={AlertTriangle} iconColor="#ff4444" iconBg="rgba(255,68,68,0.1)"
            trendLabel={`+ ${alertsWarning} avertissements`} glowClass={alertsCritiques > 0 ? 'glow-danger' : ''} />
          <KPICard label="Coût maintenance (Mai)" value={`${(totalCostMois/1000).toFixed(0)}K`} unit="MAD"
            icon={Wrench} iconColor="#ffb300" iconBg="rgba(255,179,0,0.1)"
            trend={-12} trendLabel="vs avril" />
          <KPICard label="Interventions en attente" value={pendingInterventions.length}
            icon={Clock} iconColor="#00d4ff" iconBg="rgba(0,212,255,0.1)"
            trendLabel="planifiées + en cours" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid #1e3a5f' }}>
          {([
            { key: 'flotte',        label: '🚛 État de la flotte' },
            { key: 'interventions', label: '🔧 Interventions' },
            { key: 'couts',         label: '📊 Analyse coûts' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t.key ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: activeTab === t.key ? '#00d4ff' : '#4a7a9b',
                border: `1px solid ${activeTab === t.key ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1 : FLOTTE ── */}
        {activeTab === 'flotte' && (
          <div className="space-y-4">
            {/* Alerts banner */}
            {maintenanceAlerts.filter(a => a.urgence === 'critique').length > 0 && (
              <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.25)' }}>
                <AlertTriangle size={16} style={{ color: '#ff4444', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#ff8888' }}>
                  <strong>{alertsCritiques} alerte(s) critique(s)</strong> nécessitent une action immédiate
                </div>
              </div>
            )}

            {/* Vehicle cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {vehicles.map(v => {
                const vAlerts = maintenanceAlerts.filter(a => a.vehiculeId === v.id);
                const hasCritical = vAlerts.some(a => a.urgence === 'critique');
                const scoreClr = v.scoreEtat >= 80 ? '#00e676' : v.scoreEtat >= 60 ? '#ffb300' : '#ff4444';
                const kmToVidange = v.prochaineVidange - v.kmActuel;

                return (
                  <div key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`glass-card p-4 cursor-pointer hover:border-[#234878] transition-all ${hasCritical ? 'glow-danger' : ''}`}
                    style={{ borderColor: hasCritical ? 'rgba(255,68,68,0.3)' : undefined }}>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-sm font-bold" style={{ color: '#00d4ff' }}>{v.immatriculation}</div>
                        <div className="text-xs" style={{ color: '#7bacc8' }}>{v.marque} {v.modele}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        v.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                        v.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
                        'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
                      }`}>{v.status}</span>
                    </div>

                    {/* Score bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#4a7a9b' }}>État général</span>
                        <span className="font-bold" style={{ color: scoreClr }}>{v.scoreEtat}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#1e3a5f' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${v.scoreEtat}%`, background: scoreClr }} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: '#4a7a9b' }}>Kilométrage</span>
                        <span style={{ color: '#e8f4fd' }}>{v.kmActuel.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#4a7a9b' }}>Proch. vidange</span>
                        <span style={{ color: kmToVidange < 2000 ? '#ffb300' : '#e8f4fd' }}>
                          {kmToVidange > 0 ? `dans ${kmToVidange.toLocaleString()} km` : 'Dépassée'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#4a7a9b' }}>CT</span>
                        <span style={{ color: '#e8f4fd' }}>{v.prochainCT}</span>
                      </div>
                    </div>

                    {/* Alerts */}
                    {vAlerts.length > 0 && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e3a5f' }}>
                        {vAlerts.map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs mb-1">
                            <span style={{ color: urgenceColor[a.urgence] }}>●</span>
                            <span style={{ color: '#7bacc8' }}>{a.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-3 text-xs" style={{ color: '#4a7a9b' }}>
                      Voir détail <ChevronRight size={12} className="ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2 : INTERVENTIONS ── */}
        {activeTab === 'interventions' && (
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
              <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Toutes les interventions</span>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
                <Plus size={12} /> Nouvelle intervention
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                    {['Véhicule', 'Type', 'Intervention', 'Date', 'Kilométrage', 'Garage', 'Coût total', 'Statut'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#2a5070', background: 'rgba(5,14,31,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...interventions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(i => {
                    const v = vehicles.find(x => x.id === i.vehiculeId);
                    return (
                      <tr key={i.id} className="table-row-hover" style={{ borderBottom: '1px solid #1e3a5f26' }}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-semibold" style={{ color: '#00d4ff' }}>{v?.immatriculation}</div>
                          <div className="text-xs" style={{ color: '#4a7a9b' }}>{v?.marque} {v?.modele}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={typeLabel[i.type]} className={typeColor[i.type]} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm" style={{ color: '#e8f4fd' }}>{i.libelle}</div>
                          {i.notes && <div className="text-xs mt-0.5 italic" style={{ color: '#4a7a9b' }}>{i.notes}</div>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#7bacc8' }}>{i.date}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#7bacc8' }}>{i.kmIntervention.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#7bacc8' }}>{i.garage}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>
                            {(i.coutPieces + i.coutMainOeuvre).toLocaleString()} MAD
                          </div>
                          <div className="text-xs" style={{ color: '#4a7a9b' }}>
                            P: {i.coutPieces.toLocaleString()} · MO: {i.coutMainOeuvre.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={i.status} className={statusColor[i.status]} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3 : COÛTS ── */}
        {activeTab === 'couts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Bar chart coûts */}
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
                  Coûts de maintenance par mois (MAD)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={maintenanceCostByMonth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis dataKey="month" tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#7bacc8' }} />
                    <Bar dataKey="preventive"  name="Préventive"  stackId="a" fill="#00d4ff" fillOpacity={0.85} />
                    <Bar dataKey="corrective"  name="Corrective"  stackId="a" fill="#ff4444" fillOpacity={0.85} />
                    <Bar dataKey="pneus"       name="Pneus"       stackId="a" fill="#ffb300" fillOpacity={0.85} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart répartition */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>Répartition annuelle</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} MAD`}
                      contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span style={{ color: '#7bacc8' }}>{d.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: '#e8f4fd' }}>{d.value.toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coût par véhicule */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>Coût de maintenance par véhicule</h3>
              <div className="space-y-3">
                {vehicles.map(v => {
                  const vCost = interventions
                    .filter(i => i.vehiculeId === v.id && i.status === 'terminee')
                    .reduce((s, i) => s + i.coutPieces + i.coutMainOeuvre, 0);
                  const maxCost = 50000;
                  const pct = Math.min((vCost / maxCost) * 100, 100);
                  const clr = pct > 70 ? '#ff4444' : pct > 40 ? '#ffb300' : '#00d4ff';

                  return (
                    <div key={v.id} className="flex items-center gap-4">
                      <div className="w-28 text-xs font-mono flex-shrink-0" style={{ color: '#00d4ff' }}>{v.immatriculation}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full" style={{ background: '#1e3a5f' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: clr }} />
                          </div>
                          <span className="text-xs font-semibold w-24 text-right flex-shrink-0" style={{ color: '#e8f4fd' }}>
                            {vCost.toLocaleString()} MAD
                          </span>
                        </div>
                      </div>
                      <div className="text-xs w-20 text-right flex-shrink-0" style={{ color: '#4a7a9b' }}>
                        {v.kmActuel > 0 ? `${((vCost / v.kmActuel) * 100).toFixed(1)} /100km` : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedVehicle && <VehicleDetail vehiculeId={selectedVehicle} onClose={() => setSelectedVehicle(null)} />}
    </div>
  );
}
