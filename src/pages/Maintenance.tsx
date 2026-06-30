import { useState, useEffect } from 'react';
import {
  Wrench, AlertTriangle, CheckCircle, Clock,
  X, ChevronRight, Plus, Pencil, Trash2
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { vehicleService } from '../services/vehicleService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import {
  type InterventionType, type Intervention,
} from '../data/mock';
import DataState from '../components/ui/DataState';
import { useVehicles, useInterventions, useMaintenanceAlerts, useMaintenanceCosts } from '../hooks/useFleetData';

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

import type { Vehicle, MaintenanceAlert } from '../data/mock';

interface VehicleDetailProps {
  vehiculeId: string;
  onClose: () => void;
  vehicles: Vehicle[];
  interventions: Intervention[];
  maintenanceAlerts: MaintenanceAlert[];
}

function VehicleDetail({ vehiculeId, onClose, vehicles, interventions, maintenanceAlerts }: VehicleDetailProps) {
  const { c } = useTheme();
  const v = vehicles.find(x => x.id === vehiculeId);
  if (!v) return null;

  const vehicleInterventions = interventions
    .filter(i => i.vehiculeId === vehiculeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCost = vehicleInterventions
    .filter(i => i.status === 'terminee')
    .reduce((s, i) => s + i.coutPieces + i.coutMainOeuvre, 0);

  const coutKm = v.kmActuel > 0 ? (totalCost / v.kmActuel * 100).toFixed(1) : '0';
  const vAlerts = maintenanceAlerts.filter(a => a.vehiculeId === vehiculeId);

  const scoreColor = v.scoreEtat >= 80 ? '#00e676' : v.scoreEtat >= 60 ? '#ffb300' : '#ff4444';

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
              <span className="font-mono font-bold text-lg" style={{ color: c.accent }}>{v.immatriculation}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                v.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                v.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
                'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
              }`}>{v.status}</span>
            </div>
            <p className="font-semibold" style={{ color: c.textPrimary }}>{v.marque} {v.modele} — {v.annee}</p>
            <p className="text-xs" style={{ color: c.textMuted }}>{v.type} · {v.kmActuel.toLocaleString()} km</p>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Score état */}
        <div className="px-4 py-4 rounded-xl mb-5"
          style={{ background: `${scoreColor}0a`, border: `1px solid ${scoreColor}25` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: c.textSecondary }}>Score état véhicule</span>
            <span className="text-2xl font-black" style={{ color: scoreColor }}>{v.scoreEtat}/100</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: c.border }}>
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
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <div className="text-sm font-bold" style={{ color: c.textPrimary }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Prochaines échéances */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Prochaines échéances
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.textSecondary }}>Prochaine vidange</span>
              <span style={{ color: '#ffb300' }}>{v.prochaineVidange.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.textSecondary }}>Contrôle technique</span>
              <span style={{ color: c.accent }}>{v.prochainCT}</span>
            </div>
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.textSecondary }}>Consommation moy.</span>
              <span style={{ color: c.textPrimary }}>{v.carburant} L/100km</span>
            </div>
          </div>
        </div>

        {/* Active alerts */}
        {vAlerts.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              Alertes actives
            </h4>
            {vAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1.5"
                style={{ background: `${urgenceColor[a.urgence]}08`, border: `1px solid ${urgenceColor[a.urgence]}25` }}>
                <AlertTriangle size={12} style={{ color: urgenceColor[a.urgence], flexShrink: 0 }} />
                <span className="text-xs flex-1" style={{ color: c.textSecondary }}>{a.message}</span>
                <span className="text-xs font-mono" style={{ color: urgenceColor[a.urgence] }}>{a.echeance}</span>
              </div>
            ))}
          </div>
        )}

        {/* Intervention history */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Historique interventions
          </h4>
          <div className="space-y-2">
            {vehicleInterventions.map(i => (
              <div key={i.id} className="px-3 py-2.5 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge label={typeLabel[i.type]} className={typeColor[i.type]} />
                    <Badge label={i.status} className={statusColor[i.status]} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: c.textPrimary }}>
                    {(i.coutPieces + i.coutMainOeuvre).toLocaleString()} MAD
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: c.textSecondary }}>{i.libelle}</p>
                <p className="text-xs mt-0.5" style={{ color: c.textFaint }}>
                  {i.date} · {i.kmIntervention.toLocaleString()} km · {i.garage}
                </p>
                {i.notes && <p className="text-xs mt-1 italic" style={{ color: c.textMuted }}>📝 {i.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire Nouvelle Intervention ────────────────────────────────────────

interface IntervFormData {
  vehiculeId: string; type: InterventionType; libelle: string;
  date: string; kmIntervention: string;
  coutPieces: string; coutMainOeuvre: string; garage: string;
  status: Intervention['status']; notes: string;
}

const emptyInterv: IntervFormData = {
  vehiculeId: '', type: 'preventive', libelle: '',
  date: '', kmIntervention: '',
  coutPieces: '', coutMainOeuvre: '', garage: '',
  status: 'planifiee' as Intervention['status'], notes: '',
};

function NouvelleInterventionModal({ onClose, onSave, vehicles, initial }: {
  onClose: () => void;
  onSave: (i: Intervention) => void;
  vehicles: Vehicle[];
  initial?: Intervention;
}) {
  const { c } = useTheme();
  const isEdit = !!initial;
  const [form, setForm] = useState<IntervFormData>(initial ? {
    vehiculeId: initial.vehiculeId, type: initial.type, libelle: initial.libelle,
    date: initial.date, kmIntervention: String(initial.kmIntervention ?? ''),
    coutPieces: String(initial.coutPieces ?? ''), coutMainOeuvre: String(initial.coutMainOeuvre ?? ''),
    garage: initial.garage ?? '', status: initial.status, notes: initial.notes ?? '',
  } : emptyInterv);
  const [errors, setErrors] = useState<Partial<Record<keyof IntervFormData, string>>>({});

  const set = (k: keyof IntervFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.vehiculeId)                      e.vehiculeId = 'Requis';
    if (!form.libelle.trim())                  e.libelle = 'Requis';
    if (!form.date)                            e.date = 'Requis';
    if (!form.garage.trim())                   e.garage = 'Requis';
    if (!form.kmIntervention || isNaN(Number(form.kmIntervention))) e.kmIntervention = 'Nombre requis';
    if (form.coutPieces && isNaN(Number(form.coutPieces)))         e.coutPieces = 'Nombre invalide';
    if (form.coutMainOeuvre && isNaN(Number(form.coutMainOeuvre))) e.coutMainOeuvre = 'Nombre invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setSaveErr(null);
    try {
      if (isEdit && initial) {
        await maintenanceService.updateIntervention(initial.id, {
          type: form.type, libelle: form.libelle, date: form.date,
          kmIntervention: Number(form.kmIntervention), coutPieces: Number(form.coutPieces) || 0,
          coutMainOeuvre: Number(form.coutMainOeuvre) || 0, garage: form.garage,
          status: form.status as Intervention['status'], notes: form.notes || undefined,
        });
        onSave({ ...initial, type: form.type, libelle: form.libelle, date: form.date,
          kmIntervention: Number(form.kmIntervention), coutPieces: Number(form.coutPieces) || 0,
          coutMainOeuvre: Number(form.coutMainOeuvre) || 0, garage: form.garage,
          status: form.status as Intervention['status'], notes: form.notes || undefined });
      } else {
        const created = await maintenanceService.createIntervention({
          vehiculeId: form.vehiculeId, type: form.type, libelle: form.libelle, date: form.date,
          kmIntervention: Number(form.kmIntervention), coutPieces: Number(form.coutPieces) || 0,
          coutMainOeuvre: Number(form.coutMainOeuvre) || 0, garage: form.garage,
          status: 'planifiee', notes: form.notes || undefined,
        });
        onSave(created);
      }
      onClose();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: c.bgInput, border: `1px solid ${c.border}`,
    color: c.textSecondary, borderRadius: 8, padding: '7px 10px',
    fontSize: 12, width: '100%', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: c.textMuted, marginBottom: 4, display: 'block' };
  const errStyle: React.CSSProperties   = { fontSize: 10, color: '#ff4444', marginTop: 2 };

  const typeOptions: { value: InterventionType; label: string }[] = [
    { value: 'preventive',  label: 'Préventive' },
    { value: 'corrective',  label: 'Corrective' },
    { value: 'ct',          label: 'Contrôle Technique' },
    { value: 'pneus',       label: 'Pneumatiques' },
    { value: 'carrosserie', label: 'Carrosserie' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-2xl mx-4 flex flex-col overflow-hidden"
        style={{ border: `1px solid ${c.borderStrong}`, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <div className="font-semibold" style={{ color: c.textPrimary }}>{isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention'}</div>
            <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{isEdit ? initial?.libelle : 'Planifier une intervention de maintenance'}</div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Véhicule *</label>
              <select value={form.vehiculeId} onChange={set('vehiculeId')} style={inputStyle}>
                <option value="">— Sélectionner —</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque} {v.modele}</option>
                ))}
              </select>
              {errors.vehiculeId && <div style={errStyle}>{errors.vehiculeId}</div>}
            </div>
            <div>
              <label style={labelStyle}>Type d'intervention *</label>
              <select value={form.type} onChange={set('type')} style={inputStyle}>
                {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Libellé / Description *</label>
            <input value={form.libelle} onChange={set('libelle')} style={inputStyle} placeholder="ex : Vidange + filtre huile + filtre air" />
            {errors.libelle && <div style={errStyle}>{errors.libelle}</div>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
              {errors.date && <div style={errStyle}>{errors.date}</div>}
            </div>
            <div>
              <label style={labelStyle}>Kilométrage *</label>
              <input type="number" value={form.kmIntervention} onChange={set('kmIntervention')} style={inputStyle} placeholder="km actuel" min="0" />
              {errors.kmIntervention && <div style={errStyle}>{errors.kmIntervention}</div>}
            </div>
            <div>
              <label style={labelStyle}>Garage *</label>
              <input value={form.garage} onChange={set('garage')} style={inputStyle} placeholder="Nom du garage" />
              {errors.garage && <div style={errStyle}>{errors.garage}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Coût pièces (MAD)</label>
              <input type="number" value={form.coutPieces} onChange={set('coutPieces')} style={inputStyle} placeholder="0" min="0" />
              {errors.coutPieces && <div style={errStyle}>{errors.coutPieces}</div>}
            </div>
            <div>
              <label style={labelStyle}>Coût main d'œuvre (MAD)</label>
              <input type="number" value={form.coutMainOeuvre} onChange={set('coutMainOeuvre')} style={inputStyle} placeholder="0" min="0" />
              {errors.coutMainOeuvre && <div style={errStyle}>{errors.coutMainOeuvre}</div>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <input value={form.notes} onChange={set('notes')} style={inputStyle} placeholder="Observations, pièces à commander..." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${c.border}` }}>
          {saveErr && <span className="text-xs flex-1" style={{ color: '#ff4444' }}>{saveErr}</span>}
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: c.accentBg, border: `1px solid ${c.accentBorder}`, color: c.accent, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Planifier l\'intervention'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicle Edit Modal ───────────────────────────────────────────────────────

function VehicleEditModal({ vehicle, onSaved, onClose }: {
  vehicle: Vehicle | null; onSaved: (v: Vehicle) => void; onClose: () => void;
}) {
  const { c } = useTheme();
  const isNew = !vehicle;
  const [immat,   setImmat]   = useState(vehicle?.immatriculation ?? '');
  const [marque,  setMarque]  = useState(vehicle?.marque ?? '');
  const [modele,  setModele]  = useState(vehicle?.modele ?? '');
  const [annee,   setAnnee]   = useState(String(vehicle?.annee ?? new Date().getFullYear()));
  const [type,    setType]    = useState(vehicle?.type ?? 'Camion');
  const [status,  setStatus]  = useState<Vehicle['status']>(vehicle?.status ?? 'actif');
  const [km,      setKm]      = useState(String(vehicle?.kmActuel ?? 0));
  const [vidange, setVidange] = useState(String(vehicle?.prochaineVidange ?? 0));
  const [ct,      setCt]      = useState(vehicle?.prochainCT ?? '');
  const [score,   setScore]   = useState(vehicle?.scoreEtat ?? 80);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      if (isNew) {
        const created = await vehicleService.create({
          immatriculation: immat, marque, modele, annee: +annee, type,
          status, kmActuel: +km, prochaineVidange: +vidange, prochainCT: ct || undefined,
        });
        onSaved(created);
      } else {
        await vehicleService.update(vehicle.id, {
          immatriculation: immat, marque, modele, annee: +annee, type,
          status, kmActuel: +km, prochaineVidange: +vidange, prochainCT: ct || undefined,
        });
        onSaved({ ...vehicle, immatriculation: immat, marque, modele, annee: +annee, type,
          status, kmActuel: +km, prochaineVidange: +vidange, prochainCT: ct, scoreEtat: score });
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? String(err));
    } finally { setSaving(false); }
  };

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>{label}</label>
      {children}
    </div>
  );
  const inp = "w-full px-3 py-2 rounded-lg text-sm";
  const inpStyle = { background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6 mx-4 rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: `1px solid ${c.borderStrong}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold" style={{ color: c.textPrimary }}>
              {isNew ? 'Nouveau véhicule' : `Modifier — ${vehicle.immatriculation}`}
            </h3>
            {!isNew && <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{vehicle.marque} {vehicle.modele}</div>}
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <F label="IMMATRICULATION">
            <input value={immat} onChange={e => setImmat(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="STATUT">
            <select value={status} onChange={e => setStatus(e.target.value as Vehicle['status'])} className={inp} style={inpStyle}>
              <option value="actif">Actif</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactif">Inactif</option>
            </select>
          </F>
          <F label="MARQUE">
            <input value={marque} onChange={e => setMarque(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="MODÈLE">
            <input value={modele} onChange={e => setModele(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="ANNÉE">
            <input type="number" value={annee} onChange={e => setAnnee(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="TYPE">
            <input value={type} onChange={e => setType(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="KM ACTUEL">
            <input type="number" value={km} onChange={e => setKm(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="PROCH. VIDANGE (km)">
            <input type="number" value={vidange} onChange={e => setVidange(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label="PROCHAIN CT">
            <input type="date" value={ct} onChange={e => setCt(e.target.value)} className={inp} style={inpStyle} />
          </F>
          <F label={`SCORE ÉTAT : ${score}/100`}>
            <input type="range" min={0} max={100} value={score}
              onChange={e => setScore(+e.target.value)} className="w-full mt-2 accent-cyan-400" />
          </F>
        </div>

        {error && <p style={{ color: '#ff4444', fontSize: 12, background: 'rgba(255,68,68,0.1)', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Maintenance() {
  const { c } = useTheme();
  const [selectedVehicle, setSelectedVehicle]         = useState<string | null>(null);
  const [activeTab, setActiveTab]                     = useState<'flotte' | 'interventions' | 'couts'>('flotte');
  const [showForm, setShowForm]   = useState(false);
  const [editId,   setEditId]     = useState<string | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting]   = useState(false);

  const { data: vehicles,          loading: lv, error: ev } = useVehicles();
  const { data: interventionsData, loading: li, error: ei, refetch } = useInterventions();
  const { data: maintenanceAlerts, loading: la, error: ea } = useMaintenanceAlerts();
  const { data: costByMonth,       loading: lc, error: ec } = useMaintenanceCosts();

  const loading = lv || li || la || lc;
  const error   = ev || ei || ea || ec;

  const [localInterventions, setLocalInterventions] = useState<Intervention[]>([]);
  useEffect(() => { if (interventionsData) setLocalInterventions(interventionsData); }, [interventionsData]);

  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>([]);
  useEffect(() => { if (vehicles) setLocalVehicles(vehicles); }, [vehicles]);

  const [editVehicleId,   setEditVehicleId]   = useState<string | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [showNewVehicle,  setShowNewVehicle]  = useState(false);

  const handleVehicleSaved = (v: Vehicle) => {
    setLocalVehicles(prev => {
      const exists = prev.some(x => x.id === v.id);
      return exists ? prev.map(x => x.id === v.id ? v : x) : [v, ...prev];
    });
    setEditVehicleId(null);
    setShowNewVehicle(false);
  };
  const handleDeleteVehicle = () => {
    if (!deleteVehicleId) return;
    const id = deleteVehicleId; setDeleteVehicleId(null);
    setLocalVehicles(prev => prev.filter(v => v.id !== id));
    vehicleService.delete(id).catch(e => console.error('delete vehicle', e));
  };

  const safeVehicles    = localVehicles;
  const safeMAlerts     = maintenanceAlerts ?? [];
  const safeCostByMonth = costByMonth       ?? [];

  const totalCostMois   = safeCostByMonth.length > 0 ? safeCostByMonth[safeCostByMonth.length - 1].total : 0;
  const alertsCritiques = safeMAlerts.filter(a => a.urgence === 'critique').length;
  const alertsWarning   = safeMAlerts.filter(a => a.urgence === 'warning').length;
  const enMaintenance   = safeVehicles.filter(v => v.status === 'maintenance').length;
  const tauxDispo       = safeVehicles.length > 0
    ? Math.round(((safeVehicles.length - enMaintenance) / safeVehicles.length) * 100) : 0;

  const pieData = [
    { name: 'Préventive',   value: safeCostByMonth.reduce((s, m) => s + Number(m.preventive), 0) },
    { name: 'Corrective',   value: safeCostByMonth.reduce((s, m) => s + Number(m.corrective), 0) },
    { name: 'Pneumatiques', value: safeCostByMonth.reduce((s, m) => s + Number(m.pneus),      0) },
  ];

  const pendingInterventions = localInterventions.filter(i => i.status === 'planifiee' || i.status === 'en_cours');

  const tooltipStyle = { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Module Maintenance" subtitle="Gestion préventive, corrective et suivi état de la flotte" />
      <DataState loading={loading} error={error}>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Taux de disponibilité" value={tauxDispo} unit="%"
            icon={CheckCircle} iconColor="#00e676" iconBg={c.successBg}
            trend={2} trendLabel={`${enMaintenance} véhicule(s) en atelier`} glowClass="glow-success" />
          <KPICard label="Alertes critiques" value={alertsCritiques}
            icon={AlertTriangle} iconColor="#ff4444" iconBg={c.dangerBg}
            trendLabel={`+ ${alertsWarning} avertissements`} glowClass={alertsCritiques > 0 ? 'glow-danger' : ''} />
          <KPICard label="Coût maintenance (Mai)" value={`${(totalCostMois/1000).toFixed(0)}K`} unit="MAD"
            icon={Wrench} iconColor="#ffb300" iconBg={c.warningBg}
            trend={-12} trendLabel="vs avril" />
          <KPICard label="Interventions en attente" value={pendingInterventions.length}
            icon={Clock} iconColor={c.accent} iconBg={c.accentBg}
            trendLabel="planifiées + en cours" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          {([
            { key: 'flotte',        label: '🚛 État de la flotte' },
            { key: 'interventions', label: '🔧 Interventions' },
            { key: 'couts',         label: '📊 Analyse coûts' },
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

        {/* ── TAB 1 : FLOTTE ── */}
        {activeTab === 'flotte' && (
          <div className="space-y-4">
            {/* Alerts banner */}
            {safeMAlerts.filter(a => a.urgence === 'critique').length > 0 && (
              <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.25)' }}>
                <AlertTriangle size={16} style={{ color: '#ff4444', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#ff8888' }}>
                  <strong>{alertsCritiques} alerte(s) critique(s)</strong> nécessitent une action immédiate
                </div>
              </div>
            )}

            {/* Vehicle list table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Immatriculation', 'Marque / Modèle', 'État', 'Km actuel', 'Proch. vidange', 'CT', 'Statut', 'Alertes', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeVehicles.map(v => {
                    const vAlerts     = safeMAlerts.filter(a => a.vehiculeId === v.id);
                    const hasCritical = vAlerts.some(a => a.urgence === 'critique');
                    const scoreClr    = v.scoreEtat >= 80 ? '#00e676' : v.scoreEtat >= 60 ? '#ffb300' : '#ff4444';
                    const kmToVidange = v.prochaineVidange - v.kmActuel;
                    return (
                      <tr key={v.id} className="table-row-hover cursor-pointer"
                        style={{ borderBottom: `1px solid ${c.borderFaint}`, background: hasCritical ? 'rgba(255,68,68,0.03)' : undefined }}
                        onClick={() => setSelectedVehicle(v.id)}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-bold" style={{ color: c.accent }}>{v.immatriculation}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{v.annee}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{v.marque}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{v.modele}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: c.border }}>
                              <div className="h-full rounded-full" style={{ width: `${v.scoreEtat}%`, background: scoreClr }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: scoreClr }}>{v.scoreEtat}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: c.textPrimary }}>{v.kmActuel.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: kmToVidange < 2000 ? '#ffb300' : kmToVidange < 0 ? '#ff4444' : c.textPrimary }}>
                          {kmToVidange > 0 ? `dans ${kmToVidange.toLocaleString()} km` : 'Dépassée'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textPrimary }}>{v.prochainCT ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            v.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                            v.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
                            'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
                          }`}>{v.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {vAlerts.length > 0
                            ? <div className="flex flex-col gap-0.5">
                                {vAlerts.slice(0, 2).map((a, i) => (
                                  <div key={i} className="flex items-center gap-1 text-xs">
                                    <span style={{ color: urgenceColor[a.urgence] }}>●</span>
                                    <span className="truncate max-w-[140px]" style={{ color: c.textMuted }}>{a.message}</span>
                                  </div>
                                ))}
                              </div>
                            : <span className="text-xs" style={{ color: c.textFaint }}>—</span>}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedVehicle(v.id)}
                              style={{ color: c.textMuted }}><ChevronRight size={14} /></button>
                            <button onClick={() => setEditVehicleId(v.id)}
                              style={{ color: c.accent }}><Pencil size={13} /></button>
                            <button onClick={() => setDeleteVehicleId(v.id)}
                              style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2 : INTERVENTIONS ── */}
        {activeTab === 'interventions' && (
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
              <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Toutes les interventions</span>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: c.accentBg, border: `1px solid ${c.accentBorder}`, color: c.accent }}>
                <Plus size={12} /> Nouvelle intervention
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Véhicule', 'Type', 'Intervention', 'Date', 'Kilométrage', 'Garage', 'Coût total', 'Statut', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...localInterventions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(i => {
                    const v = safeVehicles.find(x => x.id === i.vehiculeId);
                    return (
                      <tr key={i.id} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-semibold" style={{ color: c.accent }}>{v?.immatriculation}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{v?.marque} {v?.modele}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={typeLabel[i.type]} className={typeColor[i.type]} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm" style={{ color: c.textPrimary }}>{i.libelle}</div>
                          {i.notes && <div className="text-xs mt-0.5 italic" style={{ color: c.textMuted }}>{i.notes}</div>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{i.date}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: c.textSecondary }}>{i.kmIntervention.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{i.garage}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                            {(i.coutPieces + i.coutMainOeuvre).toLocaleString()} MAD
                          </div>
                          <div className="text-xs" style={{ color: c.textMuted }}>
                            P: {i.coutPieces.toLocaleString()} · MO: {i.coutMainOeuvre.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={i.status} className={statusColor[i.status]} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={e => { e.stopPropagation(); setEditId(i.id); }}
                              className="p-1.5 rounded-lg" style={{ color: c.accent, background: c.accentBg }}>
                              <Pencil size={12} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeleteId(i.id); }}
                              className="p-1.5 rounded-lg" style={{ color: c.danger, background: c.dangerBg }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
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
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                  Coûts de maintenance par mois (MAD)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={safeCostByMonth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                    <XAxis dataKey="month" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: c.textSecondary }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]}
                    />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: c.textSecondary }} />
                    <Bar dataKey="preventive"  name="Préventive"  stackId="a" fill="#00d4ff" fillOpacity={0.85} />
                    <Bar dataKey="corrective"  name="Corrective"  stackId="a" fill="#ff4444" fillOpacity={0.85} />
                    <Bar dataKey="pneus"       name="Pneus"       stackId="a" fill="#ffb300" fillOpacity={0.85} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart répartition */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>Répartition annuelle</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} MAD`}
                      contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span style={{ color: c.textSecondary }}>{d.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: c.textPrimary }}>{d.value.toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coût par véhicule */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>Coût de maintenance par véhicule</h3>
              <div className="space-y-3">
                {safeVehicles.map(v => {
                  const vCost = localInterventions
                    .filter(i => i.vehiculeId === v.id && i.status === 'terminee')
                    .reduce((s, i) => s + i.coutPieces + i.coutMainOeuvre, 0);
                  const maxCost = 50000;
                  const pct = Math.min((vCost / maxCost) * 100, 100);
                  const clr = pct > 70 ? '#ff4444' : pct > 40 ? '#ffb300' : c.accent;

                  return (
                    <div key={v.id} className="flex items-center gap-4">
                      <div className="w-28 text-xs font-mono flex-shrink-0" style={{ color: c.accent }}>{v.immatriculation}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full" style={{ background: c.border }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: clr }} />
                          </div>
                          <span className="text-xs font-semibold w-24 text-right flex-shrink-0" style={{ color: c.textPrimary }}>
                            {vCost.toLocaleString()} MAD
                          </span>
                        </div>
                      </div>
                      <div className="text-xs w-20 text-right flex-shrink-0" style={{ color: c.textMuted }}>
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

      {selectedVehicle && (
        <VehicleDetail
          vehiculeId={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          vehicles={safeVehicles}
          interventions={localInterventions}
          maintenanceAlerts={safeMAlerts}
        />
      )}

      {showForm && (
        <NouvelleInterventionModal
          onClose={() => setShowForm(false)}
          onSave={i => { setLocalInterventions(prev => [i, ...prev]); refetch(); }}
          vehicles={safeVehicles}
        />
      )}

      {editId && (
        <NouvelleInterventionModal
          initial={localInterventions.find(i => i.id === editId)}
          onClose={() => setEditId(null)}
          onSave={() => { setEditId(null); refetch(); }}
          vehicles={safeVehicles}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="glass-card p-6 w-full max-w-sm mx-4" style={{ border: `1px solid ${c.dangerBorder}` }}>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={20} style={{ color: c.danger }} />
              <span className="font-semibold" style={{ color: c.textPrimary }}>Supprimer l'intervention ?</span>
            </div>
            <p className="text-sm mb-5" style={{ color: c.textSecondary }}>
              {localInterventions.find(i => i.id === deleteId)?.libelle} sera définitivement supprimée.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
                Annuler
              </button>
              <button disabled={deleting}
                onClick={() => {
                  const id = deleteId; setDeleteId(null);
                  setLocalInterventions(prev => prev.filter(i => i.id !== id));
                  maintenanceService.deleteIntervention(id).catch(e => console.error('delete intervention', e));
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: c.dangerBg, border: `1px solid ${c.dangerBorder}`, color: c.danger, opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showNewVehicle && (
        <VehicleEditModal
          vehicle={null}
          onSaved={handleVehicleSaved}
          onClose={() => setShowNewVehicle(false)}
        />
      )}

      {editVehicleId && (
        <VehicleEditModal
          vehicle={safeVehicles.find(v => v.id === editVehicleId) ?? null}
          onSaved={handleVehicleSaved}
          onClose={() => setEditVehicleId(null)}
        />
      )}

      {deleteVehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="glass-card p-6 w-full max-w-sm mx-4" style={{ border: `1px solid ${c.dangerBorder}` }}>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={20} style={{ color: c.danger }} />
              <span className="font-semibold" style={{ color: c.textPrimary }}>Supprimer le véhicule ?</span>
            </div>
            <p className="text-sm mb-5" style={{ color: c.textSecondary }}>
              {safeVehicles.find(v => v.id === deleteVehicleId)?.immatriculation} sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteVehicleId(null)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
                Annuler
              </button>
              <button onClick={handleDeleteVehicle}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: c.dangerBg, border: `1px solid ${c.dangerBorder}`, color: c.danger }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      </DataState>
    </div>
  );
}
