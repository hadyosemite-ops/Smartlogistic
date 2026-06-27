import { useState, useEffect } from 'react';
import {
  Users, FileText, Calendar, DollarSign,
  X, ChevronRight,
  AlertTriangle, Award, Phone, Plus, Pencil, Trash2
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
  type TypeContrat, type StatutConge, type TypeConge
} from '../data/mock';
import DataState from '../components/ui/DataState';
import {
  useDrivers, useContratsConducteurs, useConges, useFormations, usePaieMensuelle,
} from '../hooks/useFleetData';
import { driverService, type DriverInput } from '../services/driverService';
import { rhService, type CongeInput, type FormationInput, type PaieInput } from '../services/rhService';

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

import type { Driver, ContratConducteur, PaieMensuelle, Formation, Conge } from '../data/mock';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function RhField({ label, children }: { label: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: c.textSecondary }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Driver Modal ─────────────────────────────────────────────────────────────

function DriverModal({ initial, onClose, onSaved }: {
  initial?: Driver;
  onClose: () => void;
  onSaved: (d: Driver) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DriverInput>({
    nom:      initial?.nom      ?? '',
    prenom:   initial?.prenom   ?? '',
    matricule:initial?.matricule?? '',
    phone:    initial?.phone    ?? '',
    status:   initial?.status   ?? 'actif',
    permisExpire: initial?.permisExpire ?? '',
    visiteExpire: initial?.visiteExpire ?? '',
    scoreGlobal:  initial?.scoreGlobal  ?? 80,
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let driver: Driver;
      if (initial) {
        await driverService.update(initial.id, form);
        driver = { ...initial, ...form } as Driver;
      } else {
        driver = await driverService.create(form);
      }
      onSaved(driver);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>
            {initial ? 'Modifier le conducteur' : 'Nouveau conducteur'}
          </h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Prénom">
              <input className={inp} style={inpStyle} value={form.prenom} required
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </RhField>
            <RhField label="Nom">
              <input className={inp} style={inpStyle} value={form.nom} required
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </RhField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Matricule">
              <input className={inp} style={inpStyle} value={form.matricule} required
                onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))} />
            </RhField>
            <RhField label="Téléphone">
              <input className={inp} style={inpStyle} value={form.phone ?? ''}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </RhField>
          </div>
          <RhField label="Statut">
            <select className={inp} style={inpStyle} value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as DriverInput['status'] }))}>
              <option value="actif">Actif</option>
              <option value="repos">Repos</option>
              <option value="conge">Congé</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </RhField>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Expiration permis">
              <input type="date" className={inp} style={inpStyle} value={form.permisExpire ?? ''}
                onChange={e => setForm(f => ({ ...f, permisExpire: e.target.value }))} />
            </RhField>
            <RhField label="Expiration visite méd.">
              <input type="date" className={inp} style={inpStyle} value={form.visiteExpire ?? ''}
                onChange={e => setForm(f => ({ ...f, visiteExpire: e.target.value }))} />
            </RhField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
              {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Congé Modal ──────────────────────────────────────────────────────────────

function CongeModal({ initial, drivers, onClose, onSaved }: {
  initial?: Conge;
  drivers: Driver[];
  onClose: () => void;
  onSaved: (cg: Conge) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CongeInput>({
    chauffeurId: initial?.chauffeurId ?? (drivers[0]?.id ?? ''),
    type:        initial?.type        ?? 'conge_annuel',
    dateDebut:   initial?.dateDebut   ?? '',
    dateFin:     initial?.dateFin     ?? '',
    jours:       initial?.jours       ?? 1,
    statut:      initial?.statut      ?? 'en_attente',
    motif:       initial?.motif       ?? '',
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let cg: Conge;
      if (initial) {
        await rhService.updateConge(initial.id, form);
        cg = { ...initial, ...form };
      } else {
        cg = await rhService.createConge(form);
      }
      onSaved(cg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>
            {initial ? 'Modifier la demande' : 'Nouvelle demande de congé'}
          </h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <RhField label="Conducteur">
            <select className={inp} style={inpStyle} value={form.chauffeurId}
              onChange={e => setForm(f => ({ ...f, chauffeurId: e.target.value }))}>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
              ))}
            </select>
          </RhField>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Type">
              <select className={inp} style={inpStyle} value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as CongeInput['type'] }))}>
                <option value="conge_annuel">Congé annuel</option>
                <option value="maladie">Maladie</option>
                <option value="sans_solde">Sans solde</option>
                <option value="formation">Formation</option>
              </select>
            </RhField>
            <RhField label="Statut">
              <select className={inp} style={inpStyle} value={form.statut}
                onChange={e => setForm(f => ({ ...f, statut: e.target.value as CongeInput['statut'] }))}>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="refuse">Refusé</option>
              </select>
            </RhField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Date début">
              <input type="date" className={inp} style={inpStyle} value={form.dateDebut} required
                onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
            </RhField>
            <RhField label="Date fin">
              <input type="date" className={inp} style={inpStyle} value={form.dateFin} required
                onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} />
            </RhField>
          </div>
          <RhField label="Nombre de jours">
            <input type="number" className={inp} style={inpStyle} value={form.jours}
              onChange={e => setForm(f => ({ ...f, jours: Number(e.target.value) }))} />
          </RhField>
          <RhField label="Motif">
            <input className={inp} style={inpStyle} value={form.motif ?? ''}
              onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} />
          </RhField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
              {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Formation Modal ──────────────────────────────────────────────────────────

function FormationModal({ initial, drivers, onClose, onSaved }: {
  initial?: Formation;
  drivers: Driver[];
  onClose: () => void;
  onSaved: (f: Formation) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormationInput>({
    chauffeurId: initial?.chauffeurId ?? (drivers[0]?.id ?? ''),
    intitule:    initial?.intitule    ?? '',
    organisme:   initial?.organisme   ?? '',
    date:        initial?.date        ?? '',
    dureeJours:  initial?.dureeJours  ?? 1,
    certificat:  initial?.certificat  ?? false,
    expiration:  initial?.expiration  ?? '',
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fm: Formation;
      if (initial) {
        await rhService.updateFormation(initial.id, form);
        fm = { ...initial, ...form };
      } else {
        fm = await rhService.createFormation(form);
      }
      onSaved(fm);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>
            {initial ? 'Modifier la formation' : 'Nouvelle formation'}
          </h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <RhField label="Conducteur">
            <select className={inp} style={inpStyle} value={form.chauffeurId}
              onChange={e => setForm(f => ({ ...f, chauffeurId: e.target.value }))}>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
              ))}
            </select>
          </RhField>
          <RhField label="Intitulé">
            <input className={inp} style={inpStyle} value={form.intitule} required
              onChange={e => setForm(f => ({ ...f, intitule: e.target.value }))} />
          </RhField>
          <RhField label="Organisme">
            <input className={inp} style={inpStyle} value={form.organisme ?? ''}
              onChange={e => setForm(f => ({ ...f, organisme: e.target.value }))} />
          </RhField>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Date">
              <input type="date" className={inp} style={inpStyle} value={form.date} required
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </RhField>
            <RhField label="Durée (jours)">
              <input type="number" className={inp} style={inpStyle} value={form.dureeJours ?? 1}
                onChange={e => setForm(f => ({ ...f, dureeJours: Number(e.target.value) }))} />
            </RhField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Certificat">
              <select className={inp} style={inpStyle} value={form.certificat ? 'oui' : 'non'}
                onChange={e => setForm(f => ({ ...f, certificat: e.target.value === 'oui' }))}>
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </RhField>
            <RhField label="Expiration certificat">
              <input type="date" className={inp} style={inpStyle} value={form.expiration ?? ''}
                onChange={e => setForm(f => ({ ...f, expiration: e.target.value }))} />
            </RhField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
              {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Paie Modal ───────────────────────────────────────────────────────────────

function PaieModal({ drivers, onClose, onSaved }: {
  drivers: Driver[];
  onClose: () => void;
  onSaved: (p: PaieInput) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaieInput>({
    chauffeurId: drivers[0]?.id ?? '',
    mois: new Date().toISOString().slice(0, 7),
    salaireBase: 0, primeKm: 0, primeRendement: 0, heuresSupp: 0, retenues: 0, netAPayer: 0,
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rhService.createPaie(form);
      onSaved(form);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>Saisir un bulletin de paie</h3>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <RhField label="Conducteur">
            <select className={inp} style={inpStyle} value={form.chauffeurId}
              onChange={e => setForm(f => ({ ...f, chauffeurId: e.target.value }))}>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>)}
            </select>
          </RhField>
          <RhField label="Mois">
            <input type="month" className={inp} style={inpStyle} value={form.mois}
              onChange={e => setForm(f => ({ ...f, mois: e.target.value }))} />
          </RhField>
          <div className="grid grid-cols-2 gap-3">
            <RhField label="Salaire base">
              <input type="number" className={inp} style={inpStyle} value={form.salaireBase}
                onChange={e => setForm(f => ({ ...f, salaireBase: Number(e.target.value) }))} />
            </RhField>
            <RhField label="Prime km">
              <input type="number" className={inp} style={inpStyle} value={form.primeKm ?? 0}
                onChange={e => setForm(f => ({ ...f, primeKm: Number(e.target.value) }))} />
            </RhField>
            <RhField label="Prime rend.">
              <input type="number" className={inp} style={inpStyle} value={form.primeRendement ?? 0}
                onChange={e => setForm(f => ({ ...f, primeRendement: Number(e.target.value) }))} />
            </RhField>
            <RhField label="Heures supp.">
              <input type="number" className={inp} style={inpStyle} value={form.heuresSupp ?? 0}
                onChange={e => setForm(f => ({ ...f, heuresSupp: Number(e.target.value) }))} />
            </RhField>
            <RhField label="Retenues">
              <input type="number" className={inp} style={inpStyle} value={form.retenues ?? 0}
                onChange={e => setForm(f => ({ ...f, retenues: Number(e.target.value) }))} />
            </RhField>
            <RhField label="Net à payer">
              <input type="number" className={inp} style={inpStyle} value={form.netAPayer}
                onChange={e => setForm(f => ({ ...f, netAPayer: Number(e.target.value) }))} />
            </RhField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
              {saving ? 'Enregistrement…' : 'Saisir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Driver Detail Panel ──────────────────────────────────────────────────────

function DriverPanel({ driverId, onClose, drivers, contratsConducteurs, paieMensuelle, formations, conges }: {
  driverId: string; onClose: () => void;
  drivers: Driver[]; contratsConducteurs: ContratConducteur[];
  paieMensuelle: PaieMensuelle[]; formations: Formation[]; conges: Conge[];
}) {
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

  const { data: drivers,             loading: ld, error: ed, refetch: refetchDrivers } = useDrivers();
  const { data: contratsConducteurs, loading: lc, error: ec } = useContratsConducteurs();
  const { data: conges,              loading: lcg, error: ecg, refetch: refetchConges } = useConges();
  const { data: formations,          loading: lf, error: ef,  refetch: refetchFormations } = useFormations();
  const { data: paieMensuelle,       loading: lp, error: ep,  refetch: refetchPaie } = usePaieMensuelle();

  const loading = ld || lc || lcg || lf || lp;
  const error   = ed || ec || ecg || ef || ep;

  // Local state
  const [localDrivers,    setLocalDrivers]    = useState<Driver[]>([]);
  const [localConges,     setLocalConges]     = useState<Conge[]>([]);
  const [localFormations, setLocalFormations] = useState<Formation[]>([]);
  const [localPaie,       setLocalPaie]       = useState<PaieMensuelle[]>([]);

  useEffect(() => { if (drivers)        setLocalDrivers(drivers); },    [drivers]);
  useEffect(() => { if (conges)         setLocalConges(conges); },      [conges]);
  useEffect(() => { if (formations)     setLocalFormations(formations); },[formations]);
  useEffect(() => { if (paieMensuelle)  setLocalPaie(paieMensuelle); }, [paieMensuelle]);

  const safeCt   = contratsConducteurs ?? [];

  // CRUD state — Drivers
  const [showDriverModal,  setShowDriverModal]  = useState(false);
  const [editDriverId,     setEditDriverId]     = useState<string | null>(null);
  const [deleteDriverId,   setDeleteDriverId]   = useState<string | null>(null);
  const [deletingDriver,   setDeletingDriver]   = useState(false);

  // CRUD state — Congés
  const [showCongeModal,   setShowCongeModal]   = useState(false);
  const [editCongeId,      setEditCongeId]      = useState<string | null>(null);
  const [deleteCongeId,    setDeleteCongeId]    = useState<string | null>(null);
  const [deletingConge,    setDeletingConge]    = useState(false);

  // CRUD state — Formations
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editFormationId,    setEditFormationId]    = useState<string | null>(null);
  const [deleteFormationId,  setDeleteFormationId]  = useState<string | null>(null);
  const [deletingFormation,  setDeletingFormation]  = useState(false);

  // CRUD state — Paie
  const [showPaieModal,    setShowPaieModal]    = useState(false);
  const [deletePaieKey,    setDeletePaieKey]    = useState<{ chauffeurId: string; mois: string } | null>(null);
  const [deletingPaie,     setDeletingPaie]     = useState(false);

  const editDriver    = localDrivers.find(d => d.id === editDriverId);
  const editConge     = localConges.find(cg => cg.id === editCongeId);
  const editFormation = localFormations.find(f => f.id === editFormationId);

  // Handlers
  const handleDriverSaved = (d: Driver) => {
    setLocalDrivers(prev => editDriverId ? prev.map(x => x.id === d.id ? d : x) : [d, ...prev]);
    setShowDriverModal(false); setEditDriverId(null); refetchDrivers();
  };
  const handleDriverDelete = () => {
    if (!deleteDriverId) return;
    const id = deleteDriverId; setDeleteDriverId(null);
    setLocalDrivers(prev => prev.filter(d => d.id !== id));
    driverService.delete(id).catch(e => console.error('delete driver', e)); refetchDrivers();
  };

  const handleCongeSaved = (cg: Conge) => {
    setLocalConges(prev => editCongeId ? prev.map(x => x.id === cg.id ? cg : x) : [cg, ...prev]);
    setShowCongeModal(false); setEditCongeId(null); refetchConges();
  };
  const handleCongeDelete = () => {
    if (!deleteCongeId) return;
    const id = deleteCongeId; setDeleteCongeId(null);
    setLocalConges(prev => prev.filter(cg => cg.id !== id));
    rhService.deleteConge(id).catch(e => console.error('delete conge', e)); refetchConges();
  };

  const handleFormationSaved = (fm: Formation) => {
    setLocalFormations(prev => editFormationId ? prev.map(x => x.id === fm.id ? fm : x) : [fm, ...prev]);
    setShowFormationModal(false); setEditFormationId(null); refetchFormations();
  };
  const handleFormationDelete = () => {
    if (!deleteFormationId) return;
    const id = deleteFormationId; setDeleteFormationId(null);
    setLocalFormations(prev => prev.filter(f => f.id !== id));
    rhService.deleteFormation(id).catch(e => console.error('delete formation', e)); refetchFormations();
  };

  const handlePaieSaved = (p: PaieInput) => {
    const newEntry: PaieMensuelle = { chauffeurId: p.chauffeurId, mois: p.mois, salaireBase: p.salaireBase, primeKm: p.primeKm ?? 0, primeRendement: p.primeRendement ?? 0, heuresSupp: p.heuresSupp ?? 0, retenues: p.retenues ?? 0, netAPayer: p.netAPayer };
    setLocalPaie(prev => [newEntry, ...prev]); setShowPaieModal(false); refetchPaie();
  };
  const handlePaieDelete = () => {
    if (!deletePaieKey) return;
    const key = deletePaieKey; setDeletePaieKey(null);
    setLocalPaie(prev => prev.filter(p => !(p.chauffeurId === key.chauffeurId && p.mois === key.mois)));
    rhService.deletePaie(key.chauffeurId, key.mois).catch(e => console.error('delete paie', e)); refetchPaie();
  };

  const safeDrv  = localDrivers;
  const safeCg   = localConges;
  const safeFm   = localFormations;
  const safePaie = localPaie;

  // KPIs
  const actifs          = safeDrv.filter(d => d.status === 'actif').length;
  const enConge         = safeDrv.filter(d => d.status === 'conge').length;
  const enAttente       = safeCg.filter(cg => cg.statut === 'en_attente').length;
  const today           = new Date();
  const docsExpirant    = safeDrv.filter(d => {
    const permis = Math.round((new Date(d.permisExpire).getTime() - today.getTime()) / 86400000);
    const visite = Math.round((new Date(d.visiteExpire).getTime() - today.getTime()) / 86400000);
    return permis < 90 || visite < 90;
  }).length;
  const masseSalariale  = safePaie.reduce((s, p) => s + p.netAPayer, 0);

  // Paie bar chart data
  const paieChartData = safePaie.map(p => {
    const d = safeDrv.find(x => x.id === p.chauffeurId);
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

      <DataState loading={loading} error={error}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Conducteurs actifs" value={actifs}
            icon={Users} iconColor="#00e676" iconBg={c.successBg}
            trendLabel={`${safeDrv.length} total · ${enConge} en congé`} glowClass="glow-success" />
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
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Liste des conducteurs</span>
                <button onClick={() => { setEditDriverId(null); setShowDriverModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
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
                    {safeDrv.map(d => {
                      const contrat      = safeCt.find(ct => ct.chauffeurId === d.id);
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
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSelectedDriver(d.id)} style={{ color: c.accent }}>
                                <ChevronRight size={13} />
                              </button>
                              <button onClick={() => { setEditDriverId(d.id); setShowDriverModal(true); }}
                                style={{ color: c.accent }}><Pencil size={13} /></button>
                              <button onClick={() => setDeleteDriverId(d.id)}
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
          </div>
        )}

        {/* ══ TAB 2 : CONGÉS ══ */}
        {activeTab === 'conges' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Approuvés',    count: safeCg.filter(cg=>cg.statut==='approuve').length,   color: '#00e676' },
                { label: 'En attente',   count: safeCg.filter(cg=>cg.statut==='en_attente').length,  color: '#ffb300' },
                { label: 'Refusés',      count: safeCg.filter(cg=>cg.statut==='refuse').length,      color: '#ff4444' },
              ].map(({ label, count, color }) => (
                <div key={label} className="glass-card p-4 text-center"
                  style={{ borderColor: `${color}30` }}>
                  <div className="text-3xl font-black mb-1" style={{ color }}>{count}</div>
                  <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Demandes de congés</span>
                <button onClick={() => { setEditCongeId(null); setShowCongeModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Type', 'Période', 'Durée', 'Motif', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeCg.map(cg => {
                      const d = safeDrv.find(x => x.id === cg.chauffeurId);
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditCongeId(cg.id); setShowCongeModal(true); }}
                                style={{ color: c.accent }}><Pencil size={13} /></button>
                              <button onClick={() => setDeleteCongeId(cg.id)}
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
          </div>
        )}

        {/* ══ TAB 3 : FORMATIONS ══ */}
        {activeTab === 'formations' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {safeDrv.map(d => {
                const driverForms = safeFm.filter(f => f.chauffeurId === d.id);
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
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  Toutes les formations ({safeFm.length})
                </span>
                <button onClick={() => { setEditFormationId(null); setShowFormationModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Formation', 'Organisme', 'Date', 'Durée', 'Certificat', 'Expiration', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeFm.map(f => {
                      const d = safeDrv.find(x => x.id === f.chauffeurId);
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditFormationId(f.id); setShowFormationModal(true); }}
                                style={{ color: c.accent }}><Pencil size={13} /></button>
                              <button onClick={() => setDeleteFormationId(f.id)}
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
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Bulletin de paie — Mai 2025</span>
                <button onClick={() => setShowPaieModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Saisir
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Conducteur', 'Base', 'Prime km', 'Prime rend.', 'Heures supp.', 'Retenues', 'Net à payer', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safePaie.map(p => {
                      const d = safeDrv.find(x => x.id === p.chauffeurId);
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
                          <td className="px-4 py-3">
                            <button onClick={() => setDeletePaieKey({ chauffeurId: p.chauffeurId, mois: p.mois })}
                              style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
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
                    { label: 'Total brut', value: safePaie.reduce((s,p)=>s+p.salaireBase+p.primeKm+p.primeRendement+p.heuresSupp, 0), color: c.textSecondary },
                    { label: 'Total retenues', value: safePaie.reduce((s,p)=>s+p.retenues, 0), color: '#ff4444' },
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
                { label: 'Salaires de base',   value: safePaie.reduce((s,p)=>s+p.salaireBase,0),                              color: c.accent },
                { label: 'Primes & HS',        value: safePaie.reduce((s,p)=>s+p.primeKm+p.primeRendement+p.heuresSupp,0),    color: '#00e676' },
                { label: 'Retenues CNSS/IR',   value: safePaie.reduce((s,p)=>s+p.retenues,0),                                  color: '#ff4444' },
              ].map(item => {
                const totalBrut = safePaie.reduce((s,p)=>s+p.salaireBase+p.primeKm+p.primeRendement+p.heuresSupp,0);
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
      </DataState>

      {selectedDriver && (
        <DriverPanel
          driverId={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          drivers={safeDrv}
          contratsConducteurs={safeCt}
          paieMensuelle={safePaie}
          formations={safeFm}
          conges={safeCg}
        />
      )}

      {showDriverModal && (
        <DriverModal
          initial={editDriverId ? editDriver : undefined}
          onClose={() => { setShowDriverModal(false); setEditDriverId(null); }}
          onSaved={handleDriverSaved}
        />
      )}

      {showCongeModal && (
        <CongeModal
          initial={editCongeId ? editConge : undefined}
          drivers={safeDrv}
          onClose={() => { setShowCongeModal(false); setEditCongeId(null); }}
          onSaved={handleCongeSaved}
        />
      )}

      {showFormationModal && (
        <FormationModal
          initial={editFormationId ? editFormation : undefined}
          drivers={safeDrv}
          onClose={() => { setShowFormationModal(false); setEditFormationId(null); }}
          onSaved={handleFormationSaved}
        />
      )}

      {showPaieModal && (
        <PaieModal
          drivers={safeDrv}
          onClose={() => setShowPaieModal(false)}
          onSaved={handlePaieSaved}
        />
      )}

      {/* Delete confirms */}
      {deleteDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer le conducteur ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteDriverId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleDriverDelete} disabled={deletingDriver} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                {deletingDriver ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCongeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer la demande de congé ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteCongeId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleCongeDelete} disabled={deletingConge} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                {deletingConge ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFormationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer la formation ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteFormationId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handleFormationDelete} disabled={deletingFormation} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                {deletingFormation ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePaieKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer le bulletin ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletePaieKey(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>Annuler</button>
              <button onClick={handlePaieDelete} disabled={deletingPaie} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                {deletingPaie ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
