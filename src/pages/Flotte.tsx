import { useState, useMemo } from 'react';
import {
  Truck, Plus, Pencil, Trash2, X, Search, FileText,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  UserMinus, Fuel, Gauge, CalendarCheck,
} from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import DataState from '../components/ui/DataState';
import { useTheme } from '../context/ThemeContext';
import { useVehicles, useDrivers, useInterventions, useMaintenanceAlerts, useDocuments } from '../hooks/useFleetData';
import { vehicleService } from '../services/vehicleService';
import { driverService }  from '../services/driverService';
import { adminService }   from '../services/adminService';
import type { Vehicle, Driver, DocumentVehicule, Intervention, MaintenanceAlert } from '../data/mock';
import type { DocumentInput } from '../services/adminService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DOC_LABELS: Record<string, string> = {
  carte_grise: 'Carte grise', assurance: 'Assurance', vignette: 'Vignette',
  autorisation: 'Autorisation', controle_technique: 'Contrôle technique',
};
const DOC_TYPES = Object.keys(DOC_LABELS) as DocumentVehicule['type'][];

const daysUntil = (dateStr: string) => {
  const d = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(d / 86400000);
};

const statutDocColor = (s: string) =>
  s === 'valide' ? '#00e676' : s === 'expire_bientot' ? '#ffb300' : '#ff4444';

// Hoisted outside the modals: defining this inline inside a component body
// creates a brand-new component type on every render, which makes React
// remount the wrapped <input>/<select> each keystroke and drop focus.
function F({ label, muted, children }: { label: string; muted: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color: muted }}>{label}</label>
      {children}
    </div>
  );
}

// ─── VehicleFormModal ────────────────────────────────────────────────────────

function VehicleFormModal({ vehicle, onSaved, onClose }: {
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
  const [carb,    setCarb]    = useState(String(vehicle?.carburant ?? 0));
  const [score,   setScore]   = useState(vehicle?.scoreEtat ?? 80);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!immat || !marque) return;
    setSaving(true); setError(null);
    try {
      if (isNew) {
        const created = await vehicleService.create({
          immatriculation: immat, marque, modele, annee: +annee, type,
          status, kmActuel: +km, prochaineVidange: +vidange,
          prochainCT: ct || undefined, carburant: +carb || undefined,
        });
        onSaved(created);
      } else {
        await vehicleService.update(vehicle.id, {
          immatriculation: immat, marque, modele, annee: +annee, type,
          status, kmActuel: +km, prochaineVidange: +vidange,
          prochainCT: ct || undefined, carburant: +carb || undefined,
        });
        onSaved({ ...vehicle, immatriculation: immat, marque, modele, annee: +annee,
          type, status, kmActuel: +km, prochaineVidange: +vidange,
          prochainCT: ct, carburant: +carb, scoreEtat: score });
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? String(err));
    } finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2 rounded-lg text-sm';
  const is  = { background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="glass-card w-full max-w-xl mx-4 p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: `1px solid ${c.borderStrong}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg" style={{ color: c.textPrimary }}>
            {isNew ? '+ Nouveau véhicule' : `Modifier — ${vehicle.immatriculation}`}
          </h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <F label="IMMATRICULATION *" muted={c.textMuted}>
            <input value={immat} onChange={e => setImmat(e.target.value)} placeholder="12345-A-7" className={inp} style={is} />
          </F>
          <F label="STATUT" muted={c.textMuted}>
            <select value={status} onChange={e => setStatus(e.target.value as Vehicle['status'])} className={inp} style={is}>
              <option value="actif">Actif</option>
              <option value="maintenance">Maintenance</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </F>
          <F label="MARQUE *" muted={c.textMuted}>
            <input value={marque} onChange={e => setMarque(e.target.value)} placeholder="Mercedes" className={inp} style={is} />
          </F>
          <F label="MODÈLE" muted={c.textMuted}>
            <input value={modele} onChange={e => setModele(e.target.value)} placeholder="Actros 1845" className={inp} style={is} />
          </F>
          <F label="ANNÉE" muted={c.textMuted}>
            <input type="number" value={annee} onChange={e => setAnnee(e.target.value)} className={inp} style={is} />
          </F>
          <F label="TYPE" muted={c.textMuted}>
            <select value={type} onChange={e => setType(e.target.value)} className={inp} style={is}>
              {['Camion', 'Semi-remorque', 'Tracteur', 'Remorque', 'Fourgon', 'Benne', 'Citerne', 'Frigorifique'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </F>
          <F label="KM ACTUEL" muted={c.textMuted}>
            <input type="number" value={km} onChange={e => setKm(e.target.value)} className={inp} style={is} />
          </F>
          <F label="PROCH. VIDANGE (km)" muted={c.textMuted}>
            <input type="number" value={vidange} onChange={e => setVidange(e.target.value)} className={inp} style={is} />
          </F>
          <F label="PROCHAIN CT" muted={c.textMuted}>
            <input type="date" value={ct} onChange={e => setCt(e.target.value)} className={inp} style={is} />
          </F>
          <F label="CONSO. (L/100km)" muted={c.textMuted}>
            <input type="number" step="0.1" value={carb} onChange={e => setCarb(e.target.value)} className={inp} style={is} />
          </F>
          {!isNew && (
            <div className="col-span-2">
              <F label={`SCORE ÉTAT : ${score}/100`} muted={c.textMuted}>
                <input type="range" min={0} max={100} value={score}
                  onChange={e => setScore(+e.target.value)} className="w-full mt-2 accent-cyan-400" />
              </F>
            </div>
          )}
        </div>

        {error && <p style={{ color: '#ff4444', fontSize: 12, background: 'rgba(255,68,68,0.1)', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>{error}</p>}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textSecondary, border: `1px solid ${c.border}` }}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving || !immat || !marque}
            className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817',
              opacity: (!immat || !marque) ? 0.5 : 1 }}>
            {saving ? 'Enregistrement…' : isNew ? 'Créer le véhicule' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DocFormModal ─────────────────────────────────────────────────────────────

function DocFormModal({ vehicleId, vehicles, onSaved, onClose }: {
  vehicleId: string | null; vehicles: Vehicle[];
  onSaved: (d: DocumentVehicule) => void; onClose: () => void;
}) {
  const { c } = useTheme();
  const [vId,    setVId]    = useState(vehicleId ?? (vehicles[0]?.id ?? ''));
  const [type,   setType]   = useState<DocumentVehicule['type']>('carte_grise');
  const [lib,    setLib]    = useState('');
  const [org,    setOrg]    = useState('');
  const [emis,   setEmis]   = useState('');
  const [expir,  setExpir]  = useState('');
  const [ref,    setRef]    = useState('');
  const [mont,   setMont]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!lib || !vId) return;
    setSaving(true); setError(null);
    try {
      const statut: DocumentVehicule['statut'] = (() => {
        if (!expir) return 'valide';
        const days = daysUntil(expir);
        return days < 0 ? 'expire' : days < 30 ? 'expire_bientot' : 'valide';
      })();
      const input: DocumentInput = {
        vehiculeId: vId, type, libelle: lib, organisme: org || undefined,
        dateEmission: emis || undefined, dateExpiration: expir || undefined,
        statut, montant: mont ? +mont : undefined, reference: ref || undefined,
      };
      const created = await adminService.createDocument(input);
      onSaved(created);
    } catch (err: unknown) {
      setError((err as Error).message ?? String(err));
    } finally { setSaving(false); }
  };

  const inp = 'w-full px-3 py-2 rounded-lg text-sm';
  const is  = { background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="glass-card w-full max-w-lg mx-4 p-6 rounded-2xl"
        style={{ border: `1px solid ${c.borderStrong}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold" style={{ color: c.textPrimary }}>Ajouter un document</h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="VÉHICULE *" muted={c.textMuted}>
            <select value={vId} onChange={e => setVId(e.target.value)} className={inp} style={is}>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque}</option>)}
            </select>
          </F>
          <F label="TYPE *" muted={c.textMuted}>
            <select value={type} onChange={e => setType(e.target.value as DocumentVehicule['type'])} className={inp} style={is}>
              {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
            </select>
          </F>
          <div className="col-span-2">
            <F label="LIBELLÉ *" muted={c.textMuted}>
              <input value={lib} onChange={e => setLib(e.target.value)} placeholder="ex: Assurance tous risques 2025"
                className={inp} style={is} />
            </F>
          </div>
          <F label="ORGANISME" muted={c.textMuted}>
            <input value={org} onChange={e => setOrg(e.target.value)} className={inp} style={is} />
          </F>
          <F label="RÉFÉRENCE" muted={c.textMuted}>
            <input value={ref} onChange={e => setRef(e.target.value)} className={inp} style={is} />
          </F>
          <F label="DATE D'ÉMISSION" muted={c.textMuted}>
            <input type="date" value={emis} onChange={e => setEmis(e.target.value)} className={inp} style={is} />
          </F>
          <F label="DATE D'EXPIRATION" muted={c.textMuted}>
            <input type="date" value={expir} onChange={e => setExpir(e.target.value)} className={inp} style={is} />
          </F>
          <F label="COÛT (MAD)" muted={c.textMuted}>
            <input type="number" value={mont} onChange={e => setMont(e.target.value)} className={inp} style={is} />
          </F>
        </div>
        {error && <p style={{ color: '#ff4444', fontSize: 12, background: 'rgba(255,68,68,0.1)', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>{error}</p>}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textSecondary, border: `1px solid ${c.border}` }}>Annuler</button>
          <button onClick={handleSubmit} disabled={saving || !lib}
            className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817', opacity: !lib ? 0.5 : 1 }}>
            {saving ? 'Enregistrement…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VehicleDetailPanel ───────────────────────────────────────────────────────

function VehicleDetailPanel({ vehicle, drivers, interventions, mAlerts, documents, onClose, onEdit, onAssign }: {
  vehicle: Vehicle; drivers: Driver[]; interventions: Intervention[];
  mAlerts: MaintenanceAlert[]; documents: DocumentVehicule[];
  onClose: () => void; onEdit: () => void; onAssign: (driverId: string | null) => void;
}) {
  const { c } = useTheme();
  const [tab, setTab]         = useState<'info' | 'maintenance' | 'docs'>('info');
  const [assigning, setAssign] = useState(false);

  const driver      = drivers.find(d => d.id === vehicle.chauffeurId);
  const vInterv     = interventions.filter(i => i.vehiculeId === vehicle.id).slice(0, 5);
  const vAlerts     = mAlerts.filter(a => a.vehiculeId === vehicle.id);
  const vDocs       = documents.filter(d => d.vehiculeId === vehicle.id);
  const scoreClr    = vehicle.scoreEtat >= 80 ? '#00e676' : vehicle.scoreEtat >= 60 ? '#ffb300' : '#ff4444';
  const availDrivers = drivers.filter(d => !d.vehiculeId || d.vehiculeId === vehicle.id);

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1" />
      <div className="w-full max-w-md h-full overflow-y-auto shadow-2xl"
        style={{ background: c.bgCard, borderLeft: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-mono text-xl font-bold" style={{ color: c.accent }}>{vehicle.immatriculation}</div>
              <div className="text-sm mt-0.5" style={{ color: c.textSecondary }}>{vehicle.marque} {vehicle.modele} · {vehicle.annee}</div>
              <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{vehicle.type}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="p-2 rounded-lg" style={{ background: c.bgElevated, color: c.accent }}><Pencil size={14} /></button>
              <button onClick={onClose} className="p-2 rounded-lg" style={{ background: c.bgElevated, color: c.textMuted }}><X size={14} /></button>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            vehicle.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
            vehicle.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
            'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
          }`}>{vehicle.status}</span>
        </div>

        {/* Score + KPIs */}
        <div className="p-5" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: c.textMuted }}>ÉTAT GÉNÉRAL</span>
            <span className="text-lg font-bold" style={{ color: scoreClr }}>{vehicle.scoreEtat}/100</span>
          </div>
          <div className="h-2 rounded-full mb-4" style={{ background: c.border }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${vehicle.scoreEtat}%`, background: scoreClr }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg" style={{ background: c.bgElevated }}>
              <Gauge size={14} className="mx-auto mb-1" style={{ color: c.accent }} />
              <div className="text-xs font-bold" style={{ color: c.textPrimary }}>{vehicle.kmActuel.toLocaleString()}</div>
              <div className="text-xs" style={{ color: c.textMuted }}>km actuel</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: c.bgElevated }}>
              <Fuel size={14} className="mx-auto mb-1" style={{ color: '#ffb300' }} />
              <div className="text-xs font-bold" style={{ color: c.textPrimary }}>{vehicle.carburant ?? '—'}</div>
              <div className="text-xs" style={{ color: c.textMuted }}>L/100km</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: c.bgElevated }}>
              <CalendarCheck size={14} className="mx-auto mb-1" style={{ color: '#00e676' }} />
              <div className="text-xs font-bold" style={{ color: c.textPrimary }}>{vehicle.prochainCT ?? '—'}</div>
              <div className="text-xs" style={{ color: c.textMuted }}>prochain CT</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: `1px solid ${c.border}` }}>
          {(['info', 'maintenance', 'docs'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ color: tab === t ? c.accent : c.textMuted,
                borderBottom: tab === t ? `2px solid ${c.accent}` : '2px solid transparent' }}>
              {t === 'info' ? 'Infos' : t === 'maintenance' ? 'Maintenance' : 'Documents'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Tab Info */}
          {tab === 'info' && (
            <div className="space-y-4">
              {/* Conducteur */}
              <div className="p-4 rounded-xl" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold" style={{ color: c.textMuted }}>CONDUCTEUR AFFECTÉ</div>
                  <button onClick={() => setAssign(!assigning)} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: c.bgCard, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                    {assigning ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
                {assigning ? (
                  <select className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: c.bgInput, border: `1px solid ${c.borderStrong}`, color: c.textPrimary }}
                    value={vehicle.chauffeurId ?? ''}
                    onChange={e => { onAssign(e.target.value || null); setAssign(false); }}>
                    <option value="">— Aucun —</option>
                    {availDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.prenom} {d.nom} ({d.matricule})</option>
                    ))}
                  </select>
                ) : driver ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: c.accentBg, color: c.accent }}>
                      {driver.prenom[0]}{driver.nom[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: c.textPrimary }}>{driver.prenom} {driver.nom}</div>
                      <div className="text-xs" style={{ color: c.textMuted }}>{driver.matricule} · Score {driver.scoreGlobal}/100</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: c.textMuted }}>Aucun conducteur affecté</div>
                )}
              </div>

              {/* Alertes */}
              {vAlerts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold" style={{ color: c.textMuted }}>ALERTES</div>
                  {vAlerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg text-sm"
                      style={{ background: a.urgence === 'critique' ? 'rgba(255,68,68,0.06)' : 'rgba(255,179,0,0.06)',
                        border: `1px solid ${a.urgence === 'critique' ? 'rgba(255,68,68,0.2)' : 'rgba(255,179,0,0.2)'}` }}>
                      <AlertTriangle size={14} style={{ color: a.urgence === 'critique' ? '#ff4444' : '#ffb300', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: c.textSecondary }}>{a.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Maintenance */}
          {tab === 'maintenance' && (
            <div className="space-y-2">
              {vInterv.length === 0
                ? <p className="text-sm text-center py-8" style={{ color: c.textMuted }}>Aucune intervention</p>
                : vInterv.map(i => (
                  <div key={i.id} className="p-3 rounded-lg" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{i.libelle}</div>
                        <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{i.date} · {i.garage ?? 'Interne'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: c.accent }}>{(i.coutPieces + i.coutMainOeuvre).toLocaleString()} MAD</div>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${
                          i.status === 'terminee' ? 'text-[#00e676] border-[#00e67640]' :
                          i.status === 'en_cours'  ? 'text-[#ffb300] border-[#ffb30040]' :
                                                     'text-[#7bacc8] border-[#7bacc840]'
                        }`}>{i.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Tab Documents */}
          {tab === 'docs' && (
            <div className="space-y-2">
              {vDocs.length === 0
                ? <p className="text-sm text-center py-8" style={{ color: c.textMuted }}>Aucun document</p>
                : vDocs.map(d => (
                  <div key={d.id} className="p-3 rounded-lg flex items-start justify-between"
                    style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{d.libelle}</div>
                      <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                        {DOC_LABELS[d.type]} {d.organisme ? `· ${d.organisme}` : ''}
                      </div>
                      {d.dateExpiration && (
                        <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                          Expire : {d.dateExpiration}
                          {daysUntil(d.dateExpiration) < 60 && (
                            <span style={{ color: daysUntil(d.dateExpiration) < 0 ? '#ff4444' : '#ffb300' }}>
                              {' '}({daysUntil(d.dateExpiration) < 0 ? 'expiré' : `dans ${daysUntil(d.dateExpiration)}j`})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: statutDocColor(d.statut), background: `${statutDocColor(d.statut)}18` }}>
                      {d.statut.replace('_', ' ')}
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Flotte() {
  const { c } = useTheme();
  const { data: vehicles,   loading: lv, error: ev, refetch: rfV } = useVehicles();
  const { data: drivers,    loading: ld, error: ed }               = useDrivers();
  const { data: intervs,    loading: li, error: ei }               = useInterventions();
  const { data: mAlerts,    loading: lm, error: em }               = useMaintenanceAlerts();
  const { data: documents,  loading: ldo, error: edo, refetch: rfD } = useDocuments();

  const loading = lv || ld || li || lm || ldo;
  const error   = ev || ed || ei || em || edo;

  const [tab,             setTab]           = useState<'parc' | 'documents' | 'affectation'>('parc');
  const [search,          setSearch]        = useState('');
  const [filterStatus,    setFilterStatus]  = useState<'tous' | Vehicle['status']>('tous');
  const [filterType,      setFilterType]    = useState('tous');
  const [detailVehicle,   setDetailVehicle] = useState<Vehicle | null>(null);
  const [formVehicle,     setFormVehicle]   = useState<Vehicle | null | 'new'>('new' as const);
  const [showForm,        setShowForm]      = useState(false);
  const [showDocForm,     setShowDocForm]   = useState(false);
  const [docVehicleId,    setDocVehicleId]  = useState<string | null>(null);
  const [deleteVehicleId, setDeleteId]      = useState<string | null>(null);
  const [localVehicles,   setLocalVehicles] = useState<Vehicle[]>([]);
  const [localDocs,       setLocalDocs]     = useState<DocumentVehicule[]>([]);
  const [localDrivers,    setLocalDrivers]  = useState<Driver[]>([]);

  // Sync remote → local
  useState(() => { if (vehicles) setLocalVehicles(vehicles); });
  useState(() => { if (documents) setLocalDocs(documents); });
  useState(() => { if (drivers) setLocalDrivers(drivers); });

  // Sync on data changes
  useMemo(() => { if (vehicles) setLocalVehicles(vehicles); }, [vehicles]);
  useMemo(() => { if (documents) setLocalDocs(documents); }, [documents]);
  useMemo(() => { if (drivers) setLocalDrivers(drivers); }, [drivers]);

  const safeVehicles = localVehicles;
  const safeDocs     = localDocs;
  const safeDrivers  = localDrivers;
  const safeAlerts   = mAlerts ?? [];
  const safeIntervs  = intervs ?? [];

  // KPIs
  const total         = safeVehicles.length;
  const enMaint       = safeVehicles.filter(v => v.status === 'maintenance').length;
  const disponibles   = safeVehicles.filter(v => v.status === 'actif').length;
  const tauxDispo     = total > 0 ? Math.round((disponibles / total) * 100) : 0;
  const ctAlertes     = safeVehicles.filter(v => v.prochainCT && daysUntil(v.prochainCT) < 30).length;
  const vidangeAlertes = safeVehicles.filter(v => v.prochaineVidange - v.kmActuel < 2000).length;
  const docsExpires   = safeDocs.filter(d => d.statut === 'expire').length;
  const docsExpBientot = safeDocs.filter(d => d.statut === 'expire_bientot').length;

  // Filters
  const vehicleTypes = ['tous', ...Array.from(new Set(safeVehicles.map(v => v.type)))];
  const filtered = useMemo(() => safeVehicles.filter(v => {
    if (filterStatus !== 'tous' && v.status !== filterStatus) return false;
    if (filterType !== 'tous' && v.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.immatriculation.toLowerCase().includes(q) &&
          !v.marque.toLowerCase().includes(q) &&
          !v.modele.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [safeVehicles, filterStatus, filterType, search]);

  // Handlers
  const handleVehicleSaved = (v: Vehicle) => {
    setLocalVehicles(prev => {
      const exists = prev.some(x => x.id === v.id);
      return exists ? prev.map(x => x.id === v.id ? v : x) : [v, ...prev];
    });
    if (detailVehicle?.id === v.id) setDetailVehicle(v);
    setShowForm(false);
    rfV();
  };

  const handleDeleteVehicle = () => {
    if (!deleteVehicleId) return;
    const id = deleteVehicleId; setDeleteId(null);
    if (detailVehicle?.id === id) setDetailVehicle(null);
    setLocalVehicles(prev => prev.filter(v => v.id !== id));
    vehicleService.delete(id).catch(e => console.error('delete vehicle', e));
  };

  const handleDocSaved = (d: DocumentVehicule) => {
    setLocalDocs(prev => [d, ...prev]);
    setShowDocForm(false);
    rfD();
  };

  const handleDeleteDoc = (id: string) => {
    setLocalDocs(prev => prev.filter(d => d.id !== id));
    adminService.deleteDocument(id).catch(e => console.error('delete doc', e));
  };

  const handleAssign = async (vehicleId: string, driverId: string | null) => {
    const vehicle = safeVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const prevDriverId = vehicle.chauffeurId;
    // Update local state
    setLocalVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, chauffeurId: driverId } : v));
    setLocalDrivers(prev => prev.map(d => {
      if (d.id === prevDriverId) return { ...d, vehiculeId: null };
      if (d.id === driverId)     return { ...d, vehiculeId: vehicleId };
      return d;
    }));
    if (detailVehicle?.id === vehicleId) setDetailVehicle(v => v ? { ...v, chauffeurId: driverId } : v);
    // Persist
    await vehicleService.update(vehicleId, { chauffeurId: driverId });
    if (prevDriverId) await driverService.update(prevDriverId, { vehiculeId: null });
    if (driverId)     await driverService.update(driverId, { vehiculeId: vehicleId });
  };

  const scoreClr = (s: number) => s >= 80 ? '#00e676' : s >= 60 ? '#ffb300' : '#ff4444';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Gestion de la Flotte" subtitle="Véhicules, documents et affectations" />
      <DataState loading={loading} error={error}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard label="Total véhicules" value={total} icon={Truck} iconColor="#00d4ff" iconBg={c.accentBg} />
          <KPICard label="Disponibles" value={disponibles} icon={CheckCircle} iconColor="#00e676" iconBg={c.successBg} />
          <KPICard label="En maintenance" value={enMaint} icon={Clock} iconColor="#ffb300" iconBg={c.warningBg} />
          <KPICard label="Taux de dispo." value={tauxDispo} unit="%" icon={Gauge} iconColor="#00d4ff" iconBg={c.accentBg} />
          <KPICard label="Docs à renouveler" value={docsExpires + docsExpBientot}
            icon={FileText} iconColor="#ff4444" iconBg={c.dangerBg} />
        </div>

        {/* Alertes banner */}
        {(ctAlertes > 0 || vidangeAlertes > 0) && (
          <div className="px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.25)' }}>
            <AlertTriangle size={16} style={{ color: '#ffb300', flexShrink: 0 }} />
            <div className="text-sm" style={{ color: '#ffd060' }}>
              {ctAlertes > 0 && <><strong>{ctAlertes} CT</strong> à renouveler dans les 30 jours · </>}
              {vidangeAlertes > 0 && <><strong>{vidangeAlertes} vidange(s)</strong> approchant la limite</>}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: c.bgElevated }}>
          {(['parc', 'documents', 'affectation'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{ background: tab === t ? c.bgCard : 'transparent',
                color: tab === t ? c.textPrimary : c.textMuted,
                border: tab === t ? `1px solid ${c.border}` : '1px solid transparent' }}>
              {t === 'parc' ? 'Parc Véhicules' : t === 'documents' ? 'Documents' : 'Affectation'}
            </button>
          ))}
        </div>

        {/* ── Tab Parc ── */}
        {tab === 'parc' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.textMuted }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher…" className="pl-9 pr-4 py-2 rounded-lg text-sm w-56"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary }} />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
                <option value="tous">Tous statuts</option>
                <option value="actif">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="indisponible">Indisponible</option>
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
                {vehicleTypes.map(t => <option key={t} value={t}>{t === 'tous' ? 'Tous types' : t}</option>)}
              </select>
              <div className="ml-auto">
                <button onClick={() => { setFormVehicle(null); setShowForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817' }}>
                  <Plus size={15} /> Nouveau véhicule
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Immatriculation', 'Marque / Modèle', 'Type', 'Conducteur', 'État', 'Km actuel', 'Proch. vidange', 'CT', 'Statut', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="py-12 text-center text-sm" style={{ color: c.textMuted }}>
                      {total === 0 ? 'Aucun véhicule — ajoutez-en un !' : 'Aucun résultat pour ces filtres'}
                    </td></tr>
                  )}
                  {filtered.map(v => {
                    const driv      = safeDrivers.find(d => d.id === v.chauffeurId);
                    const kmRestant = v.prochaineVidange - v.kmActuel;
                    const ctDays    = v.prochainCT ? daysUntil(v.prochainCT) : null;
                    return (
                      <tr key={v.id} className="table-row-hover cursor-pointer"
                        style={{ borderBottom: `1px solid ${c.borderFaint}` }}
                        onClick={() => setDetailVehicle(v)}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-bold" style={{ color: c.accent }}>{v.immatriculation}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{v.annee}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{v.marque}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{v.modele}</div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{v.type}</td>
                        <td className="px-4 py-3">
                          {driv ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: c.accentBg, color: c.accent }}>
                                {driv.prenom[0]}{driv.nom[0]}
                              </div>
                              <span className="text-xs" style={{ color: c.textSecondary }}>{driv.prenom} {driv.nom}</span>
                            </div>
                          ) : <span className="text-xs" style={{ color: c.textFaint }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full" style={{ background: c.border }}>
                              <div className="h-full rounded-full" style={{ width: `${v.scoreEtat}%`, background: scoreClr(v.scoreEtat) }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: scoreClr(v.scoreEtat) }}>{v.scoreEtat}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textPrimary }}>{v.kmActuel.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: kmRestant < 0 ? '#ff4444' : kmRestant < 2000 ? '#ffb300' : c.textPrimary }}>
                          {kmRestant > 0 ? `dans ${kmRestant.toLocaleString()} km` : 'Dépassée'}
                        </td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: ctDays !== null && ctDays < 0 ? '#ff4444' : ctDays !== null && ctDays < 30 ? '#ffb300' : c.textPrimary }}>
                          {v.prochainCT ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            v.status === 'actif' ? 'text-[#00e676] bg-[#00e67610] border-[#00e67640]' :
                            v.status === 'maintenance' ? 'text-[#ff4444] bg-[#ff444410] border-[#ff444440]' :
                            'text-[#ffb300] bg-[#ffb30010] border-[#ffb30040]'
                          }`}>{v.status}</span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDetailVehicle(v)} style={{ color: c.textMuted }}><ChevronRight size={14} /></button>
                            <button onClick={() => { setFormVehicle(v); setShowForm(true); }} style={{ color: c.accent }}><Pencil size={13} /></button>
                            <button onClick={() => setDeleteId(v.id)} style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
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

        {/* ── Tab Documents ── */}
        {tab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { setDocVehicleId(null); setShowDocForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#00d4ff,#0077aa)', color: '#020817' }}>
                <Plus size={15} /> Ajouter un document
              </button>
            </div>

            {/* Alertes docs */}
            {(docsExpires > 0 || docsExpBientot > 0) && (
              <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
                <AlertTriangle size={15} style={{ color: '#ff4444' }} />
                <span className="text-sm" style={{ color: '#ff8888' }}>
                  {docsExpires > 0 && <><strong>{docsExpires} document(s)</strong> expiré(s) — </>}
                  {docsExpBientot > 0 && <><strong>{docsExpBientot}</strong> expir{docsExpBientot > 1 ? 'ent' : 'e'} bientôt</>}
                </span>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Véhicule', 'Type', 'Libellé', 'Organisme', 'Expiration', 'Coût (MAD)', 'Statut', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeDocs.length === 0 && (
                    <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: c.textMuted }}>
                      Aucun document — ajoutez-en un !
                    </td></tr>
                  )}
                  {safeDocs.map(d => {
                    const veh = safeVehicles.find(v => v.id === d.vehiculeId);
                    const days = d.dateExpiration ? daysUntil(d.dateExpiration) : null;
                    return (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-bold" style={{ color: c.accent }}>{veh?.immatriculation ?? '—'}</div>
                          <div className="text-xs" style={{ color: c.textMuted }}>{veh?.marque} {veh?.modele}</div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{DOC_LABELS[d.type]}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: c.textPrimary }}>{d.libelle}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{d.organisme ?? '—'}</td>
                        <td className="px-4 py-3 text-xs"
                          style={{ color: days !== null && days < 0 ? '#ff4444' : days !== null && days < 30 ? '#ffb300' : c.textPrimary }}>
                          {d.dateExpiration ?? '—'}
                          {days !== null && days < 60 && (
                            <div style={{ color: days < 0 ? '#ff4444' : '#ffb300' }}>
                              {days < 0 ? `expiré depuis ${-days}j` : `dans ${days}j`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: c.textPrimary }}>
                          {d.montant ? d.montant.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ color: statutDocColor(d.statut), background: `${statutDocColor(d.statut)}18` }}>
                            {d.statut.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteDoc(d.id)} style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab Affectation ── */}
        {tab === 'affectation' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                  {['Véhicule', 'Type', 'Statut', 'Conducteur affecté', 'Score conducteur', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeVehicles.map(v => {
                  const driv = safeDrivers.find(d => d.id === v.chauffeurId);
                  const free = safeDrivers.filter(d => !d.vehiculeId || d.vehiculeId === v.id);
                  return (
                    <tr key={v.id} style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-bold" style={{ color: c.accent }}>{v.immatriculation}</div>
                        <div className="text-xs" style={{ color: c.textMuted }}>{v.marque} {v.modele}</div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{v.type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          v.status === 'actif' ? 'text-[#00e676] border-[#00e67640]' :
                          v.status === 'maintenance' ? 'text-[#ff4444] border-[#ff444440]' :
                          'text-[#ffb300] border-[#ffb30040]'
                        }`}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {driv ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: c.accentBg, color: c.accent }}>
                              {driv.prenom[0]}{driv.nom[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{driv.prenom} {driv.nom}</div>
                              <div className="text-xs" style={{ color: c.textMuted }}>{driv.matricule}</div>
                            </div>
                          </div>
                        ) : <span className="text-xs italic" style={{ color: c.textFaint }}>Non affecté</span>}
                      </td>
                      <td className="px-4 py-3">
                        {driv ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: c.border }}>
                              <div className="h-full rounded-full" style={{ width: `${driv.scoreGlobal}%`, background: scoreClr(driv.scoreGlobal) }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: scoreClr(driv.scoreGlobal) }}>{driv.scoreGlobal}</span>
                          </div>
                        ) : <span style={{ color: c.textFaint }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select className="px-2 py-1.5 rounded-lg text-xs"
                            style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}
                            value={v.chauffeurId ?? ''}
                            onChange={e => handleAssign(v.id, e.target.value || null)}>
                            <option value="">— Aucun —</option>
                            {free.map(d => (
                              <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
                            ))}
                          </select>
                          {v.chauffeurId && (
                            <button onClick={() => handleAssign(v.id, null)}
                              className="p-1.5 rounded-lg" title="Désaffecter"
                              style={{ background: c.dangerBg, color: c.danger }}>
                              <UserMinus size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Vehicle detail panel */}
      {detailVehicle && (
        <VehicleDetailPanel
          vehicle={detailVehicle}
          drivers={safeDrivers}
          interventions={safeIntervs}
          mAlerts={safeAlerts}
          documents={safeDocs}
          onClose={() => setDetailVehicle(null)}
          onEdit={() => { setFormVehicle(detailVehicle); setShowForm(true); }}
          onAssign={driverId => handleAssign(detailVehicle.id, driverId)}
        />
      )}

      {/* Vehicle form modal */}
      {showForm && (
        <VehicleFormModal
          vehicle={formVehicle === 'new' ? null : formVehicle}
          onSaved={handleVehicleSaved}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Doc form modal */}
      {showDocForm && (
        <DocFormModal
          vehicleId={docVehicleId}
          vehicles={safeVehicles}
          onSaved={handleDocSaved}
          onClose={() => setShowDocForm(false)}
        />
      )}

      {/* Delete confirm */}
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
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>
                Annuler
              </button>
              <button onClick={handleDeleteVehicle} className="flex-1 py-2 rounded-lg text-sm font-semibold"
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
