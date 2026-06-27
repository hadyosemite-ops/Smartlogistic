import { useState, useEffect } from 'react';
import {
  Shield, Briefcase, Receipt,
  AlertTriangle, CheckCircle, Clock, ChevronRight, X, Plus, Pencil, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { type TypeDocument, type StatutDocument, type ContratClient, type Facture, type DocumentVehicule } from '../data/mock';
import DataState from '../components/ui/DataState';
import { useDocuments, useContratsClient, useFactures, useVehicles } from '../hooks/useFleetData';
import { adminService, type DocumentInput, type ContratClientInput, type FactureInput } from '../services/adminService';

// ─── Labels & Colors ──────────────────────────────────────────────────────────

const docTypeLabel: Record<TypeDocument, string> = {
  carte_grise:         'Carte grise',
  assurance:           'Assurance',
  vignette:            'Vignette',
  autorisation:        'Autorisation',
  controle_technique:  'Contrôle tech.',
};
const docTypeColor: Record<TypeDocument, string> = {
  carte_grise:         'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
  assurance:           'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  vignette:            'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  autorisation:        'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  controle_technique:  'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
};
const statutDocColor: Record<StatutDocument, string> = {
  valide:          'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  expire_bientot:  'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
  expire:          'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
};
const statutDocLabel: Record<StatutDocument, string> = {
  valide:          'Valide',
  expire_bientot:  'Expire bientôt',
  expire:          'Expiré',
};
const factureColor: Record<string, string> = {
  payee:       'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
  en_attente:  'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  retard:      'text-[#ff4444] bg-[#ff444412] border-[#ff444440]',
  litige:      'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]',
};
const contratTypeColor: Record<string, string> = {
  spot:      'text-[#7bacc8] bg-[#7bacc812] border-[#7bacc840]',
  cadre:     'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff40]',
  exclusif:  'text-[#00e676] bg-[#00e67612] border-[#00e67640]',
};
const PIE_COLORS = ['#00e676', '#ff4444', '#ffb300', '#00d4ff'];

// ─── Shared modal backdrop ────────────────────────────────────────────────────

function ModalBackdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const { c } = useTheme();
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>{title}</h3>
      <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: c.textSecondary }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Document Modal ───────────────────────────────────────────────────────────

function DocumentModal({ initial, vehicles, onClose, onSaved }: {
  initial?: DocumentVehicule;
  vehicles: { id: string; immatriculation: string; marque: string; modele: string }[];
  onClose: () => void;
  onSaved: (doc: DocumentVehicule) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DocumentInput>({
    vehiculeId:    initial?.vehiculeId    ?? (vehicles[0]?.id ?? ''),
    type:          initial?.type          ?? 'assurance',
    libelle:       initial?.libelle       ?? '',
    organisme:     initial?.organisme     ?? '',
    dateEmission:  initial?.dateEmission  ?? '',
    dateExpiration:initial?.dateExpiration?? '',
    statut:        initial?.statut        ?? 'valide',
    montant:       initial?.montant,
    reference:     initial?.reference     ?? '',
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let doc: DocumentVehicule;
      if (initial) {
        await adminService.updateDocument(initial.id, form);
        doc = { ...initial, ...form };
      } else {
        doc = await adminService.createDocument(form);
      }
      onSaved(doc);
    } finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalHeader title={initial ? 'Modifier le document' : 'Nouveau document véhicule'} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Véhicule">
          <select className={inp} style={inpStyle} value={form.vehiculeId}
            onChange={e => setForm(f => ({ ...f, vehiculeId: e.target.value }))}>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.immatriculation} — {v.marque} {v.modele}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inp} style={inpStyle} value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as DocumentInput['type'] }))}>
              <option value="assurance">Assurance</option>
              <option value="carte_grise">Carte grise</option>
              <option value="vignette">Vignette</option>
              <option value="autorisation">Autorisation</option>
              <option value="controle_technique">Contrôle technique</option>
            </select>
          </Field>
          <Field label="Statut">
            <select className={inp} style={inpStyle} value={form.statut}
              onChange={e => setForm(f => ({ ...f, statut: e.target.value as DocumentInput['statut'] }))}>
              <option value="valide">Valide</option>
              <option value="expire_bientot">Expire bientôt</option>
              <option value="expire">Expiré</option>
            </select>
          </Field>
        </div>
        <Field label="Libellé">
          <input className={inp} style={inpStyle} value={form.libelle} required
            onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} />
        </Field>
        <Field label="Organisme">
          <input className={inp} style={inpStyle} value={form.organisme ?? ''}
            onChange={e => setForm(f => ({ ...f, organisme: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date émission">
            <input type="date" className={inp} style={inpStyle} value={form.dateEmission ?? ''}
              onChange={e => setForm(f => ({ ...f, dateEmission: e.target.value }))} />
          </Field>
          <Field label="Date expiration">
            <input type="date" className={inp} style={inpStyle} value={form.dateExpiration ?? ''}
              onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Montant (MAD)">
            <input type="number" className={inp} style={inpStyle} value={form.montant ?? ''}
              onChange={e => setForm(f => ({ ...f, montant: e.target.value ? Number(e.target.value) : undefined }))} />
          </Field>
          <Field label="Référence">
            <input className={inp} style={inpStyle} value={form.reference ?? ''}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
            Annuler
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
            {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ─── Contrat Modal ────────────────────────────────────────────────────────────

function ContratModal({ initial, onClose, onSaved }: {
  initial?: ContratClient;
  onClose: () => void;
  onSaved: (ct: ContratClient) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContratClientInput>({
    client:         initial?.client         ?? '',
    type:           initial?.type           ?? 'cadre',
    dateDebut:      initial?.dateDebut      ?? '',
    dateFin:        initial?.dateFin        ?? '',
    tarifKm:        initial?.tarifKm        ?? 0,
    volumeMensuel:  initial?.volumeMensuel  ?? 0,
    caAnnuelEstime: initial?.caAnnuelEstime ?? 0,
    statut:         initial?.statut         ?? 'actif',
    contact:        initial?.contact        ?? '',
    conditions:     initial?.conditions     ?? '',
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let ct: ContratClient;
      if (initial) {
        await adminService.updateContrat(initial.id, form);
        ct = { ...initial, ...form };
      } else {
        ct = await adminService.createContrat(form);
      }
      onSaved(ct);
    } finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalHeader title={initial ? 'Modifier le contrat' : 'Nouveau contrat client'} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Client">
          <input className={inp} style={inpStyle} value={form.client} required
            onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inp} style={inpStyle} value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as ContratClientInput['type'] }))}>
              <option value="spot">Spot</option>
              <option value="cadre">Cadre</option>
              <option value="exclusif">Exclusif</option>
            </select>
          </Field>
          <Field label="Statut">
            <select className={inp} style={inpStyle} value={form.statut}
              onChange={e => setForm(f => ({ ...f, statut: e.target.value as ContratClientInput['statut'] }))}>
              <option value="actif">Actif</option>
              <option value="en_negociation">En négociation</option>
              <option value="expire">Expiré</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date début">
            <input type="date" className={inp} style={inpStyle} value={form.dateDebut} required
              onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
          </Field>
          <Field label="Date fin">
            <input type="date" className={inp} style={inpStyle} value={form.dateFin} required
              onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tarif/km (MAD)">
            <input type="number" step="0.01" className={inp} style={inpStyle} value={form.tarifKm ?? 0}
              onChange={e => setForm(f => ({ ...f, tarifKm: Number(e.target.value) }))} />
          </Field>
          <Field label="Vol. mensuel">
            <input type="number" className={inp} style={inpStyle} value={form.volumeMensuel ?? 0}
              onChange={e => setForm(f => ({ ...f, volumeMensuel: Number(e.target.value) }))} />
          </Field>
          <Field label="CA annuel (MAD)">
            <input type="number" className={inp} style={inpStyle} value={form.caAnnuelEstime ?? 0}
              onChange={e => setForm(f => ({ ...f, caAnnuelEstime: Number(e.target.value) }))} />
          </Field>
        </div>
        <Field label="Contact">
          <input className={inp} style={inpStyle} value={form.contact ?? ''}
            onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
        </Field>
        <Field label="Conditions">
          <textarea className={inp} style={inpStyle} rows={2} value={form.conditions ?? ''}
            onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
            Annuler
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
            {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ─── Facture Modal ────────────────────────────────────────────────────────────

function FactureModal({ initial, onClose, onSaved }: {
  initial?: Facture;
  onClose: () => void;
  onSaved: (f: Facture) => void;
}) {
  const { c } = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FactureInput>({
    client:       initial?.client       ?? '',
    dateEmission: initial?.dateEmission ?? '',
    dateEcheance: initial?.dateEcheance ?? '',
    montantHT:    initial?.montantHT    ?? 0,
    tva:          initial?.tva          ?? 0,
    montantTTC:   initial?.montantTTC   ?? 0,
    statut:       initial?.statut       ?? 'en_attente',
  });

  const inp = `w-full px-3 py-2 rounded-lg text-sm outline-none`;
  const inpStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let facture: Facture;
      if (initial) {
        await adminService.updateFacture(initial.id, form);
        facture = { ...initial, ...form };
      } else {
        facture = await adminService.createFacture(form);
      }
      onSaved(facture);
    } finally { setSaving(false); }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalHeader title={initial ? 'Modifier la facture' : 'Nouvelle facture'} onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Client">
          <input className={inp} style={inpStyle} value={form.client} required
            onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date émission">
            <input type="date" className={inp} style={inpStyle} value={form.dateEmission} required
              onChange={e => setForm(f => ({ ...f, dateEmission: e.target.value }))} />
          </Field>
          <Field label="Date échéance">
            <input type="date" className={inp} style={inpStyle} value={form.dateEcheance} required
              onChange={e => setForm(f => ({ ...f, dateEcheance: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Montant HT (MAD)">
            <input type="number" step="0.01" className={inp} style={inpStyle} value={form.montantHT}
              onChange={e => setForm(f => ({ ...f, montantHT: Number(e.target.value) }))} />
          </Field>
          <Field label="TVA (MAD)">
            <input type="number" step="0.01" className={inp} style={inpStyle} value={form.tva}
              onChange={e => setForm(f => ({ ...f, tva: Number(e.target.value) }))} />
          </Field>
          <Field label="Montant TTC (MAD)">
            <input type="number" step="0.01" className={inp} style={inpStyle} value={form.montantTTC}
              onChange={e => setForm(f => ({ ...f, montantTTC: Number(e.target.value) }))} />
          </Field>
        </div>
        <Field label="Statut">
          <select className={inp} style={inpStyle} value={form.statut}
            onChange={e => setForm(f => ({ ...f, statut: e.target.value as FactureInput['statut'] }))}>
            <option value="en_attente">En attente</option>
            <option value="payee">Payée</option>
            <option value="retard">En retard</option>
            <option value="litige">Litige</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm"
            style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
            Annuler
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
            {saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ─── Contract Detail Panel ────────────────────────────────────────────────────

function ContratPanel({ contratId, onClose, contratsClients, factures }: {
  contratId: string; onClose: () => void;
  contratsClients: ContratClient[]; factures: Facture[];
}) {
  const { c } = useTheme();
  const ct = contratsClients.find(x => x.id === contratId);
  if (!ct) return null;

  const today     = new Date();
  const finDate   = new Date(ct.dateFin);
  const joursRestants = Math.round((finDate.getTime() - today.getTime()) / 86400000);
  const finClr    = joursRestants < 0 ? '#ff4444' : joursRestants < 90 ? '#ffb300' : '#00e676';
  const contratFact = factures.filter(f => f.client === ct.client);
  const caReel    = contratFact.reduce((s, f) => s + f.montantHT, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto p-6"
        style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}`, borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>{ct.client}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge label={ct.type} className={contratTypeColor[ct.type]} />
              <Badge label={ct.statut} className={
                ct.statut === 'actif' ? 'text-[#00e676] bg-[#00e67612] border-[#00e67640]' :
                ct.statut === 'en_negociation' ? 'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]' :
                'text-[#ff4444] bg-[#ff444412] border-[#ff444440]'
              } />
            </div>
          </div>
          <button onClick={onClose} style={{ color: c.textMuted }}><X size={18} /></button>
        </div>

        {/* Durée restante */}
        <div className="px-4 py-4 rounded-xl mb-5"
          style={{ background: `${finClr}0a`, border: `1px solid ${finClr}25` }}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm" style={{ color: c.textSecondary }}>Fin de contrat</span>
            <span className="font-bold text-lg" style={{ color: finClr }}>{ct.dateFin}</span>
          </div>
          <p className="text-xs" style={{ color: finClr }}>
            {joursRestants < 0
              ? `Expiré depuis ${Math.abs(joursRestants)} jours`
              : `${joursRestants} jours restants`}
          </p>
        </div>

        {/* Détails contrat */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Conditions contractuelles
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tarif / km',       value: `${ct.tarifKm} MAD/km`,           color: c.accent },
              { label: 'Volume mensuel',   value: `${ct.volumeMensuel} missions`,    color: c.textPrimary },
              { label: 'CA annuel estimé', value: `${(ct.caAnnuelEstime/1000).toFixed(0)}K MAD`, color: '#00e676' },
              { label: 'CA réel (mois)',   value: `${caReel.toLocaleString()} MAD`, color: '#ffb300' },
              { label: 'Date début',       value: ct.dateDebut,                      color: c.textSecondary },
              { label: 'Date fin',         value: ct.dateFin,                        color: finClr },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg"
                style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="text-xs" style={{ color: c.textMuted }}>{label}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="px-3 py-2.5 rounded-lg mb-5"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          <div className="text-xs mb-1" style={{ color: c.textMuted }}>Contact</div>
          <div className="text-sm font-medium" style={{ color: c.textPrimary }}>{ct.contact}</div>
          {ct.conditions && (
            <div className="text-xs mt-1 italic" style={{ color: c.textMuted }}>{ct.conditions}</div>
          )}
        </div>

        {/* Factures liées */}
        {contratFact.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              Factures associées
            </h4>
            <div className="space-y-2">
              {contratFact.map(f => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div>
                    <div className="text-xs font-mono font-semibold" style={{ color: c.accent }}>{f.reference}</div>
                    <div className="text-xs" style={{ color: c.textMuted }}>Échéance : {f.dateEcheance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: c.textPrimary }}>
                      {f.montantTTC.toLocaleString()} MAD TTC
                    </div>
                    <Badge label={f.statut} className={factureColor[f.statut]} />
                  </div>
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

type TabAdmin = 'documents' | 'echeances' | 'contrats' | 'factures';

export default function Administratif() {
  const { c } = useTheme();
  const [activeTab, setActiveTab] = useState<TabAdmin>('documents');
  const [selectedContrat, setSelectedContrat] = useState<string | null>(null);

  const { data: documentsVehicules, loading: ldoc, error: edoc, refetch: refetchDocs } = useDocuments();
  const { data: contratsClients,    loading: lcc,  error: ecc,  refetch: refetchContrats } = useContratsClient();
  const { data: factures,           loading: lf,   error: ef,   refetch: refetchFactures } = useFactures();
  const { data: vehicles,           loading: lv,   error: ev   } = useVehicles();

  const loading = ldoc || lcc || lf || lv;
  const error   = edoc || ecc || ef || ev;

  // Local state for optimistic updates
  const [localDocs,     setLocalDocs]     = useState<DocumentVehicule[]>([]);
  const [localContrats, setLocalContrats] = useState<ContratClient[]>([]);
  const [localFactures, setLocalFactures] = useState<Facture[]>([]);

  useEffect(() => { if (documentsVehicules) setLocalDocs(documentsVehicules); }, [documentsVehicules]);
  useEffect(() => { if (contratsClients)    setLocalContrats(contratsClients); }, [contratsClients]);
  useEffect(() => { if (factures)           setLocalFactures(factures); }, [factures]);

  const safeVehicles = vehicles ?? [];

  // CRUD modal state
  const [showDocModal,     setShowDocModal]     = useState(false);
  const [editDocId,        setEditDocId]        = useState<string | null>(null);
  const [deleteDocId,      setDeleteDocId]      = useState<string | null>(null);

  const [showContratModal, setShowContratModal] = useState(false);
  const [editContratId,    setEditContratId]    = useState<string | null>(null);
  const [deleteContratId,  setDeleteContratId]  = useState<string | null>(null);

  const [showFactureModal, setShowFactureModal] = useState(false);
  const [editFactureId,    setEditFactureId]    = useState<string | null>(null);
  const [deleteFactureId,  setDeleteFactureId]  = useState<string | null>(null);

  const editDoc     = localDocs.find(d => d.id === editDocId);
  const editContrat = localContrats.find(ct => ct.id === editContratId);
  const editFacture = localFactures.find(f => f.id === editFactureId);

  // Handlers: Documents
  const handleDocSaved = (doc: DocumentVehicule) => {
    setLocalDocs(prev => editDocId ? prev.map(d => d.id === doc.id ? doc : d) : [doc, ...prev]);
    setShowDocModal(false); setEditDocId(null);
    refetchDocs();
  };
  const handleDocDelete = () => {
    if (!deleteDocId) return;
    const id = deleteDocId; setDeleteDocId(null);
    setLocalDocs(prev => prev.filter(d => d.id !== id));
    adminService.deleteDocument(id).catch(e => console.error('delete doc', e)); refetchDocs();
  };

  // Handlers: Contrats
  const handleContratSaved = (ct: ContratClient) => {
    setLocalContrats(prev => editContratId ? prev.map(c => c.id === ct.id ? ct : c) : [ct, ...prev]);
    setShowContratModal(false); setEditContratId(null);
    refetchContrats();
  };
  const handleContratDelete = () => {
    if (!deleteContratId) return;
    const id = deleteContratId; setDeleteContratId(null);
    setLocalContrats(prev => prev.filter(ct => ct.id !== id));
    adminService.deleteContrat(id).catch(e => console.error('delete contrat', e)); refetchContrats();
  };

  // Handlers: Factures
  const handleFactureSaved = (f: Facture) => {
    setLocalFactures(prev => editFactureId ? prev.map(x => x.id === f.id ? f : x) : [f, ...prev]);
    setShowFactureModal(false); setEditFactureId(null);
    refetchFactures();
  };
  const handleFactureDelete = () => {
    if (!deleteFactureId) return;
    const id = deleteFactureId; setDeleteFactureId(null);
    setLocalFactures(prev => prev.filter(f => f.id !== id));
    adminService.deleteFacture(id).catch(e => console.error('delete facture', e)); refetchFactures();
  };

  const safeDocs     = localDocs;
  const safeContrats = localContrats;
  const safeFactures = localFactures;

  const today = new Date();

  // KPIs
  const docsExpires     = safeDocs.filter(d => d.statut === 'expire').length;
  const docsExpBientot  = safeDocs.filter(d => d.statut === 'expire_bientot').length;
  const contratsActifs  = safeContrats.filter(ct => ct.statut === 'actif').length;
  const facturesRetard  = safeFactures.filter(f => f.statut === 'retard').length;
  const caEnAttente     = safeFactures
    .filter(f => f.statut === 'en_attente' || f.statut === 'retard')
    .reduce((s, f) => s + f.montantTTC, 0);

  const allEcheances = safeDocs
    .map(d => {
      const v = safeVehicles.find(x => x.id === d.vehiculeId);
      const expDate = new Date(d.dateExpiration);
      const jours   = Math.round((expDate.getTime() - today.getTime()) / 86400000);
      return { ...d, vehicule: v, jours };
    })
    .sort((a, b) => a.jours - b.jours);

  const facturePie = [
    { name: 'Payées',      value: safeFactures.filter(f=>f.statut==='payee').length },
    { name: 'En attente',  value: safeFactures.filter(f=>f.statut==='en_attente').length },
    { name: 'En retard',   value: safeFactures.filter(f=>f.statut==='retard').length },
    { name: 'Litige',      value: safeFactures.filter(f=>f.statut==='litige').length },
  ].filter(x => x.value > 0);

  const caChart = safeContrats.map(ct => ({
    client: ct.client.split(' ')[0],
    'CA estimé': Math.round(ct.caAnnuelEstime / 12),
    'CA réel':   safeFactures.filter(f=>f.client===ct.client).reduce((s,f)=>s+f.montantHT,0),
  }));

  const tooltipStyle = { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12 };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Module Administratif"
        subtitle="Documents véhicules, contrats clients, factures et échéances légales"
      />

      <DataState loading={loading} error={error}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Documents expirés"
            value={docsExpires}
            icon={AlertTriangle}
            iconColor="#ff4444"
            iconBg={c.dangerBg}
            trendLabel={`+ ${docsExpBientot} expirent bientôt`}
            glowClass={docsExpires > 0 ? 'glow-danger' : ''}
          />
          <KPICard
            label="Contrats actifs"
            value={contratsActifs}
            icon={Briefcase}
            iconColor={c.accent}
            iconBg={c.accentBg}
            trendLabel={`${safeContrats.length} total · 1 en négociation`}
          />
          <KPICard
            label="Factures en retard"
            value={facturesRetard}
            icon={Receipt}
            iconColor="#ffb300"
            iconBg={c.warningBg}
            trendLabel="paiement dépassé"
            glowClass={facturesRetard > 0 ? 'glow-warning' : ''}
          />
          <KPICard
            label="Créances en cours"
            value={`${(caEnAttente/1000).toFixed(0)}K`}
            unit="MAD TTC"
            icon={Shield}
            iconColor="#00e676"
            iconBg={c.successBg}
            trendLabel="en attente + retard"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          {([
            { key: 'documents',  label: '📄 Documents véhicules' },
            { key: 'echeances',  label: '📅 Échéances' },
            { key: 'contrats',   label: '🤝 Contrats clients' },
            { key: 'factures',   label: '🧾 Factures' },
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

        {/* ══ TAB 1 : DOCUMENTS VÉHICULES ══ */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {(docsExpires + docsExpBientot) > 0 && (
              <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.25)' }}>
                <AlertTriangle size={16} style={{ color: '#ff4444', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: '#ff8888' }}>
                  <strong>{docsExpires} document(s) expiré(s)</strong> et{' '}
                  <strong>{docsExpBientot} expirant bientôt</strong> — renouvellements requis
                </span>
              </div>
            )}

            {/* Cards par véhicule */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {safeVehicles.map(v => {
                const vDocs     = safeDocs.filter(d => d.vehiculeId === v.id);
                const hasExpire = vDocs.some(d => d.statut === 'expire');
                const hasSoon   = vDocs.some(d => d.statut === 'expire_bientot');
                const borderClr = hasExpire ? 'rgba(255,68,68,0.35)' : hasSoon ? 'rgba(255,179,0,0.3)' : undefined;

                return (
                  <div key={v.id} className="glass-card p-4"
                    style={{ borderColor: borderClr }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-sm font-bold" style={{ color: c.accent }}>
                          {v.immatriculation}
                        </div>
                        <div className="text-xs" style={{ color: c.textSecondary }}>
                          {v.marque} {v.modele} · {v.annee}
                        </div>
                      </div>
                      {hasExpire
                        ? <AlertTriangle size={14} style={{ color: '#ff4444' }} />
                        : hasSoon
                        ? <Clock size={14} style={{ color: '#ffb300' }} />
                        : <CheckCircle size={14} style={{ color: '#00e676' }} />}
                    </div>
                    <div className="space-y-1.5">
                      {vDocs.map(doc => {
                        const docBg = doc.statut === 'expire' ? 'rgba(255,68,68,0.08)' :
                                      doc.statut === 'expire_bientot' ? 'rgba(255,179,0,0.06)' :
                                      c.bgElevated;
                        const docBorder = doc.statut === 'expire' ? 'rgba(255,68,68,0.25)' :
                                          doc.statut === 'expire_bientot' ? 'rgba(255,179,0,0.2)' :
                                          c.border;
                        const docColor = doc.statut === 'expire' ? '#ff4444' :
                                         doc.statut === 'expire_bientot' ? '#ffb300' : '#00e676';
                        return (
                          <div key={doc.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg"
                            style={{ background: docBg, border: `1px solid ${docBorder}` }}>
                            <span style={{ color: c.textSecondary }}>{docTypeLabel[doc.type]}</span>
                            <span style={{ color: docColor }}>{doc.dateExpiration}</span>
                          </div>
                        );
                      })}
                      {vDocs.length === 0 && (
                        <p className="text-xs italic" style={{ color: c.textFaint }}>Aucun document enregistré</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table complète */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  Tous les documents ({safeDocs.length})
                </span>
                <button onClick={() => { setEditDocId(null); setShowDocModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Véhicule', 'Type', 'Libellé', 'Organisme', 'Émission', 'Expiration', 'Montant', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeDocs
                      .slice()
                      .sort((a, b) => {
                        const order = { expire: 0, expire_bientot: 1, valide: 2 };
                        return order[a.statut] - order[b.statut];
                      })
                      .map(doc => {
                        const v = safeVehicles.find(x => x.id === doc.vehiculeId);
                        const expDate = new Date(doc.dateExpiration);
                        const jours   = Math.round((expDate.getTime() - today.getTime()) / 86400000);
                        const expClr  = jours < 0 ? '#ff4444' : jours < 60 ? '#ffb300' : '#00e676';
                        return (
                          <tr key={doc.id} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                            <td className="px-4 py-3">
                              <div className="font-mono text-xs font-semibold" style={{ color: c.accent }}>
                                {v?.immatriculation}
                              </div>
                              <div className="text-xs" style={{ color: c.textMuted }}>{v?.marque} {v?.modele}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={docTypeLabel[doc.type]} className={docTypeColor[doc.type]} />
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>{doc.libelle}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textMuted }}>{doc.organisme}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textMuted }}>{doc.dateEmission}</td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-semibold" style={{ color: expClr }}>{doc.dateExpiration}</div>
                              <div className="text-xs" style={{ color: expClr }}>
                                {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `dans ${jours}j`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textSecondary }}>
                              {doc.montant ? `${doc.montant.toLocaleString()} MAD` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={statutDocLabel[doc.statut]} className={statutDocColor[doc.statut]} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setEditDocId(doc.id); setShowDocModal(true); }}
                                  style={{ color: c.accent }}><Pencil size={13} /></button>
                                <button onClick={() => setDeleteDocId(doc.id)}
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

        {/* ══ TAB 2 : ÉCHÉANCES ══ */}
        {activeTab === 'echeances' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Timeline */}
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                  Calendrier des renouvellements
                </h3>
                <div className="space-y-2">
                  {allEcheances.map(doc => {
                    const clr  = doc.jours < 0 ? '#ff4444' : doc.jours < 30 ? '#ff4444' : doc.jours < 90 ? '#ffb300' : '#00e676';
                    const icon = doc.jours < 0 ? '🔴' : doc.jours < 30 ? '🟠' : doc.jours < 90 ? '🟡' : '🟢';
                    return (
                      <div key={doc.id}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
                        style={{ background: `${clr}06`, border: `1px solid ${clr}20` }}>
                        <span className="text-base w-5 flex-shrink-0">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold" style={{ color: c.accent }}>
                              {doc.vehicule?.immatriculation}
                            </span>
                            <Badge label={docTypeLabel[doc.type]} className={docTypeColor[doc.type]} />
                            <span className="text-xs truncate" style={{ color: c.textSecondary }}>{doc.libelle}</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{doc.organisme}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-semibold" style={{ color: clr }}>{doc.dateExpiration}</div>
                          <div className="text-xs font-bold" style={{ color: clr }}>
                            {doc.jours < 0
                              ? `Expiré depuis ${Math.abs(doc.jours)}j`
                              : `dans ${doc.jours}j`}
                          </div>
                          {doc.montant && (
                            <div className="text-xs" style={{ color: c.textMuted }}>
                              {doc.montant.toLocaleString()} MAD
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Résumé statuts */}
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                    Statut des documents
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Valides',        count: safeDocs.filter(d=>d.statut==='valide').length,         color: '#00e676' },
                      { label: 'Expirent < 90j', count: safeDocs.filter(d=>d.statut==='expire_bientot').length, color: '#ffb300' },
                      { label: 'Expirés',        count: safeDocs.filter(d=>d.statut==='expire').length,         color: '#ff4444' },
                    ].map(({ label, count, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: c.textSecondary }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${safeDocs.length ? (count / safeDocs.length) * 100 : 0}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                    Coût renouvellements
                  </h3>
                  <div className="space-y-2">
                    {safeDocs
                      .filter(d => d.statut !== 'valide' && d.montant)
                      .map(doc => (
                        <div key={doc.id} className="flex justify-between text-xs">
                          <span style={{ color: c.textSecondary }}>
                            {safeVehicles.find(v=>v.id===doc.vehiculeId)?.immatriculation} · {docTypeLabel[doc.type]}
                          </span>
                          <span className="font-semibold" style={{ color: '#ffb300' }}>
                            {doc.montant?.toLocaleString()} MAD
                          </span>
                        </div>
                      ))}
                    <div className="pt-2 mt-1 flex justify-between text-xs font-bold"
                      style={{ borderTop: `1px solid ${c.border}` }}>
                      <span style={{ color: c.textSecondary }}>Total à prévoir</span>
                      <span style={{ color: '#ff4444' }}>
                        {safeDocs
                          .filter(d => d.statut !== 'valide' && d.montant)
                          .reduce((s, d) => s + (d.montant ?? 0), 0)
                          .toLocaleString()} MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3 : CONTRATS CLIENTS ══ */}
        {activeTab === 'contrats' && (
          <div className="space-y-4">

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                CA mensuel estimé vs réel par client (MAD)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={caChart} margin={{ top: 5, right: 10, left: -5, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
                  <XAxis dataKey="client" tick={{ fill: c.textMuted, fontSize: 10, angle: -20, textAnchor: 'end' }}
                    axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: c.textSecondary }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} MAD`, undefined]} />
                  <Bar dataKey="CA estimé" fill="#00d4ff" fillOpacity={0.7}  radius={[4,4,0,0]} />
                  <Bar dataKey="CA réel"   fill="#00e676" fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table contrats */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Portefeuille clients</span>
                <button onClick={() => { setEditContratId(null); setShowContratModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Client', 'Type', 'Tarif/km', 'Volume/mois', 'CA annuel', 'Période', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeContrats.map(ct => {
                      const finDate    = new Date(ct.dateFin);
                      const jours      = Math.round((finDate.getTime() - today.getTime()) / 86400000);
                      const dateClr    = jours < 0 ? '#ff4444' : jours < 90 ? '#ffb300' : c.textSecondary;
                      return (
                        <tr key={ct.id} className="table-row-hover cursor-pointer"
                          style={{ borderBottom: `1px solid ${c.borderFaint}` }}
                          onClick={() => setSelectedContrat(ct.id)}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: c.textPrimary }}>
                            {ct.client}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={ct.type} className={contratTypeColor[ct.type]} />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.accent }}>
                            {ct.tarifKm} MAD
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>
                            {ct.volumeMensuel} missions
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#00e676' }}>
                            {(ct.caAnnuelEstime / 1000).toFixed(0)}K MAD
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: dateClr }}>
                            {ct.dateDebut} → {ct.dateFin}
                            {jours < 90 && (
                              <div className="font-semibold">
                                {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `dans ${jours}j`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={ct.statut} className={
                              ct.statut === 'actif' ? 'text-[#00e676] bg-[#00e67612] border-[#00e67640]' :
                              ct.statut === 'en_negociation' ? 'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]' :
                              'text-[#ff4444] bg-[#ff444412] border-[#ff444440]'
                            } />
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-1 text-xs" style={{ color: c.accent }}
                                onClick={() => setSelectedContrat(ct.id)}>
                                <ChevronRight size={12} />
                              </button>
                              <button onClick={() => { setEditContratId(ct.id); setShowContratModal(true); }}
                                style={{ color: c.accent }}><Pencil size={13} /></button>
                              <button onClick={() => setDeleteContratId(ct.id)}
                                style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 flex justify-between"
                style={{ borderTop: `1px solid ${c.border}`, background: c.bgElevated }}>
                <div>
                  <div className="text-xs" style={{ color: c.textMuted }}>CA annuel total estimé</div>
                  <div className="text-sm font-bold" style={{ color: c.accent }}>
                    {(safeContrats.reduce((s,ct)=>s+ct.caAnnuelEstime,0)/1000000).toFixed(2)} M MAD
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: c.textMuted }}>Volume mensuel total</div>
                  <div className="text-sm font-bold" style={{ color: '#00e676' }}>
                    {safeContrats.reduce((s,ct)=>s+ct.volumeMensuel,0)} missions/mois
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 4 : FACTURES ══ */}
        {activeTab === 'factures' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Stats */}
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-1" style={{ color: c.textPrimary }}>
                  Suivi facturation — Mai 2025
                </h3>
                <p className="text-xs mb-4" style={{ color: c.textMuted }}>Montants en MAD TTC</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label:   'Total facturé',
                      value:   safeFactures.reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${safeFactures.length} factures`,
                      color:   c.textPrimary,
                    },
                    {
                      label:   'Encaissé',
                      value:   safeFactures.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${safeFactures.filter(f=>f.statut==='payee').length} factures payées`,
                      color:   '#00e676',
                    },
                    {
                      label:   'En attente',
                      value:   safeFactures.filter(f=>f.statut==='en_attente').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${safeFactures.filter(f=>f.statut==='en_attente').length} en cours`,
                      color:   c.accent,
                    },
                    {
                      label:   'En retard',
                      value:   safeFactures.filter(f=>f.statut==='retard').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${safeFactures.filter(f=>f.statut==='retard').length} dépassées`,
                      color:   '#ff4444',
                    },
                  ].map(({ label, value, subval, color }) => (
                    <div key={label} className="px-4 py-3 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                      <div className="text-lg font-black" style={{ color }}>
                        {value.toLocaleString()} MAD
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{label}</div>
                      <div className="text-xs" style={{ color: c.textFaint }}>{subval}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.textPrimary }}>
                  Répartition statuts
                </h3>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={facturePie} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                      dataKey="value" paddingAngle={3}>
                      {facturePie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {facturePie.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span style={{ color: c.textSecondary }}>{d.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: c.textPrimary }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table factures */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  Liste des factures
                </span>
                <button onClick={() => { setEditFactureId(null); setShowFactureModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: c.accentBg, color: c.accent, border: `1px solid ${c.accentBorder}` }}>
                  <Plus size={13} /> Nouveau
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      {['Référence', 'Client', 'Émission', 'Échéance', 'HT', 'TVA', 'TTC', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: c.textFaint, background: c.bgElevated }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...safeFactures]
                      .sort((a, b) => {
                        const order: Record<string, number> = { retard: 0, en_attente: 1, payee: 2, litige: 3 };
                        return (order[a.statut] ?? 4) - (order[b.statut] ?? 4);
                      })
                      .map(f => {
                        const echeanceDate = new Date(f.dateEcheance);
                        const joursEch     = Math.round((echeanceDate.getTime() - today.getTime()) / 86400000);
                        const echClr       = f.statut === 'retard' ? '#ff4444' : joursEch < 7 ? '#ffb300' : c.textSecondary;
                        return (
                          <tr key={f.id} className="table-row-hover" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
                            <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: c.accent }}>
                              {f.reference}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: c.textPrimary }}>{f.client}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textMuted }}>{f.dateEmission}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: echClr }}>
                              {f.dateEcheance}
                              {f.statut === 'retard' && (
                                <div className="font-semibold">Retard {Math.abs(joursEch)}j</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: c.textSecondary }}>
                              {f.montantHT.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: c.textMuted }}>
                              {f.tva.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.textPrimary }}>
                              {f.montantTTC.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={f.statut} className={factureColor[f.statut]} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setEditFactureId(f.id); setShowFactureModal(true); }}
                                  style={{ color: c.accent }}><Pencil size={13} /></button>
                                <button onClick={() => setDeleteFactureId(f.id)}
                                  style={{ color: '#ff4444' }}><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 grid grid-cols-4 gap-4"
                style={{ borderTop: `1px solid ${c.border}`, background: c.bgElevated }}>
                {[
                  { label: 'Total HT',  value: `${safeFactures.reduce((s,f)=>s+f.montantHT,0).toLocaleString()} MAD`,  color: c.textSecondary },
                  { label: 'Total TVA', value: `${safeFactures.reduce((s,f)=>s+f.tva,0).toLocaleString()} MAD`,         color: c.textMuted },
                  { label: 'Total TTC', value: `${safeFactures.reduce((s,f)=>s+f.montantTTC,0).toLocaleString()} MAD`,  color: c.accent },
                  { label: 'Encaissé',  value: `${safeFactures.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montantTTC,0).toLocaleString()} MAD`, color: '#00e676' },
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

      </div>
      </DataState>

      {selectedContrat && (
        <ContratPanel
          contratId={selectedContrat}
          onClose={() => setSelectedContrat(null)}
          contratsClients={safeContrats}
          factures={safeFactures}
        />
      )}

      {/* Document Modal */}
      {showDocModal && (
        <DocumentModal
          initial={editDocId ? editDoc : undefined}
          vehicles={safeVehicles}
          onClose={() => { setShowDocModal(false); setEditDocId(null); }}
          onSaved={handleDocSaved}
        />
      )}

      {/* Contrat Modal */}
      {showContratModal && (
        <ContratModal
          initial={editContratId ? editContrat : undefined}
          onClose={() => { setShowContratModal(false); setEditContratId(null); }}
          onSaved={handleContratSaved}
        />
      )}

      {/* Facture Modal */}
      {showFactureModal && (
        <FactureModal
          initial={editFactureId ? editFacture : undefined}
          onClose={() => { setShowFactureModal(false); setEditFactureId(null); }}
          onSaved={handleFactureSaved}
        />
      )}

      {/* Delete confirm — Document */}
      {deleteDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer le document ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteDocId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
                Annuler
              </button>
              <button onClick={handleDocDelete} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm — Contrat */}
      {deleteContratId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer le contrat ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteContratId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
                Annuler
              </button>
              <button onClick={handleContratDelete} className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm — Facture */}
      {deleteFactureId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full"
            style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>
            <h3 className="font-bold mb-2" style={{ color: c.textPrimary }}>Supprimer la facture ?</h3>
            <p className="text-sm mb-4" style={{ color: c.textSecondary }}>Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteFactureId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ background: c.bgElevated, color: c.textMuted, border: `1px solid ${c.border}` }}>
                Annuler
              </button>
              <button onClick={handleFactureDelete} className="px-4 py-2 rounded-lg text-sm font-semibold"
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
