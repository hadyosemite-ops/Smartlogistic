import { useState } from 'react';
import {
  FileText, Shield, Briefcase, Receipt,
  AlertTriangle, CheckCircle, Clock, ChevronRight, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import Badge from '../components/ui/Badge';
import {
  documentsVehicules, contratsClients, factures, vehicles,
  type TypeDocument, type StatutDocument
} from '../data/mock';

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

// ─── Contract Detail Panel ────────────────────────────────────────────────────

function ContratPanel({ contratId, onClose }: { contratId: string; onClose: () => void }) {
  const c = contratsClients.find(x => x.id === contratId);
  if (!c) return null;

  const today     = new Date('2025-05-25');
  const finDate   = new Date(c.dateFin);
  const joursRestants = Math.round((finDate.getTime() - today.getTime()) / 86400000);
  const finClr    = joursRestants < 0 ? '#ff4444' : joursRestants < 90 ? '#ffb300' : '#00e676';
  const contratFact = factures.filter(f => f.client === c.client);
  const caReel    = contratFact.reduce((s, f) => s + f.montantHT, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: 'rgba(2,8,23,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-lg h-full overflow-y-auto p-6"
        style={{ border: '1px solid #234878', borderRadius: '16px 0 0 16px' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-base" style={{ color: '#e8f4fd' }}>{c.client}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge label={c.type} className={contratTypeColor[c.type]} />
              <Badge label={c.statut} className={
                c.statut === 'actif' ? 'text-[#00e676] bg-[#00e67612] border-[#00e67640]' :
                c.statut === 'en_negociation' ? 'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]' :
                'text-[#ff4444] bg-[#ff444412] border-[#ff444440]'
              } />
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#4a7a9b' }}><X size={18} /></button>
        </div>

        {/* Durée restante */}
        <div className="px-4 py-4 rounded-xl mb-5"
          style={{ background: `${finClr}0a`, border: `1px solid ${finClr}25` }}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm" style={{ color: '#7bacc8' }}>Fin de contrat</span>
            <span className="font-bold text-lg" style={{ color: finClr }}>{c.dateFin}</span>
          </div>
          <p className="text-xs" style={{ color: finClr }}>
            {joursRestants < 0
              ? `Expiré depuis ${Math.abs(joursRestants)} jours`
              : `${joursRestants} jours restants`}
          </p>
        </div>

        {/* Détails contrat */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a7a9b' }}>
            Conditions contractuelles
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tarif / km',       value: `${c.tarifKm} MAD/km`,           color: '#00d4ff' },
              { label: 'Volume mensuel',   value: `${c.volumeMensuel} missions`,    color: '#e8f4fd' },
              { label: 'CA annuel estimé', value: `${(c.caAnnuelEstime/1000).toFixed(0)}K MAD`, color: '#00e676' },
              { label: 'CA réel (mois)',   value: `${caReel.toLocaleString()} MAD`, color: '#ffb300' },
              { label: 'Date début',       value: c.dateDebut,                      color: '#7bacc8' },
              { label: 'Date fin',         value: c.dateFin,                        color: finClr },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f' }}>
                <div className="text-xs" style={{ color: '#4a7a9b' }}>{label}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="px-3 py-2.5 rounded-lg mb-5"
          style={{ background: 'rgba(10,22,40,0.4)', border: '1px solid #1e3a5f' }}>
          <div className="text-xs mb-1" style={{ color: '#4a7a9b' }}>Contact</div>
          <div className="text-sm font-medium" style={{ color: '#e8f4fd' }}>{c.contact}</div>
          {c.conditions && (
            <div className="text-xs mt-1 italic" style={{ color: '#4a7a9b' }}>{c.conditions}</div>
          )}
        </div>

        {/* Factures liées */}
        {contratFact.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a7a9b' }}>
              Factures associées
            </h4>
            <div className="space-y-2">
              {contratFact.map(f => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid #1e3a5f' }}>
                  <div>
                    <div className="text-xs font-mono font-semibold" style={{ color: '#00d4ff' }}>{f.reference}</div>
                    <div className="text-xs" style={{ color: '#4a7a9b' }}>Échéance : {f.dateEcheance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#e8f4fd' }}>
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
  const [activeTab, setActiveTab] = useState<TabAdmin>('documents');
  const [selectedContrat, setSelectedContrat] = useState<string | null>(null);

  const today = new Date('2025-05-25');

  // KPIs
  const docsExpires     = documentsVehicules.filter(d => d.statut === 'expire').length;
  const docsExpBientot  = documentsVehicules.filter(d => d.statut === 'expire_bientot').length;
  const contratsActifs  = contratsClients.filter(c => c.statut === 'actif').length;
  const facturesRetard  = factures.filter(f => f.statut === 'retard').length;
  const caEnAttente     = factures
    .filter(f => f.statut === 'en_attente' || f.statut === 'retard')
    .reduce((s, f) => s + f.montantTTC, 0);

  // Échéances calendar — tous les docs triés par date expiration
  const allEcheances = documentsVehicules
    .map(d => {
      const v = vehicles.find(x => x.id === d.vehiculeId);
      const expDate = new Date(d.dateExpiration);
      const jours   = Math.round((expDate.getTime() - today.getTime()) / 86400000);
      return { ...d, vehicule: v, jours };
    })
    .sort((a, b) => a.jours - b.jours);

  // Factures pie
  const facturePie = [
    { name: 'Payées',      value: factures.filter(f=>f.statut==='payee').length },
    { name: 'En attente',  value: factures.filter(f=>f.statut==='en_attente').length },
    { name: 'En retard',   value: factures.filter(f=>f.statut==='retard').length },
    { name: 'Litige',      value: factures.filter(f=>f.statut==='litige').length },
  ].filter(x => x.value > 0);

  // CA par client (contrats)
  const caChart = contratsClients.map(c => ({
    client: c.client.split(' ')[0],
    'CA estimé': Math.round(c.caAnnuelEstime / 12),
    'CA réel':   factures.filter(f=>f.client===c.client).reduce((s,f)=>s+f.montantHT,0),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Module Administratif"
        subtitle="Documents véhicules, contrats clients, factures et échéances légales"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Documents expirés"
            value={docsExpires}
            icon={AlertTriangle}
            iconColor="#ff4444"
            iconBg="rgba(255,68,68,0.1)"
            trendLabel={`+ ${docsExpBientot} expirent bientôt`}
            glowClass={docsExpires > 0 ? 'glow-danger' : ''}
          />
          <KPICard
            label="Contrats actifs"
            value={contratsActifs}
            icon={Briefcase}
            iconColor="#00d4ff"
            iconBg="rgba(0,212,255,0.1)"
            trendLabel={`${contratsClients.length} total · 1 en négociation`}
          />
          <KPICard
            label="Factures en retard"
            value={facturesRetard}
            icon={Receipt}
            iconColor="#ffb300"
            iconBg="rgba(255,179,0,0.1)"
            trendLabel="paiement dépassé"
            glowClass={facturesRetard > 0 ? 'glow-warning' : ''}
          />
          <KPICard
            label="Créances en cours"
            value={`${(caEnAttente/1000).toFixed(0)}K`}
            unit="MAD TTC"
            icon={Shield}
            iconColor="#00e676"
            iconBg="rgba(0,230,118,0.1)"
            trendLabel="en attente + retard"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(10,22,40,0.6)', border: '1px solid #1e3a5f' }}>
          {([
            { key: 'documents',  label: '📄 Documents véhicules' },
            { key: 'echeances',  label: '📅 Échéances' },
            { key: 'contrats',   label: '🤝 Contrats clients' },
            { key: 'factures',   label: '🧾 Factures' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t.key ? 'rgba(0,212,255,0.12)' : 'transparent',
                color:      activeTab === t.key ? '#00d4ff' : '#4a7a9b',
                border:     `1px solid ${activeTab === t.key ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1 : DOCUMENTS VÉHICULES ══ */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Alert banner */}
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
              {vehicles.map(v => {
                const vDocs     = documentsVehicules.filter(d => d.vehiculeId === v.id);
                const hasExpire = vDocs.some(d => d.statut === 'expire');
                const hasSoon   = vDocs.some(d => d.statut === 'expire_bientot');
                const borderClr = hasExpire ? 'rgba(255,68,68,0.35)' : hasSoon ? 'rgba(255,179,0,0.3)' : undefined;

                return (
                  <div key={v.id} className="glass-card p-4"
                    style={{ borderColor: borderClr }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono text-sm font-bold" style={{ color: '#00d4ff' }}>
                          {v.immatriculation}
                        </div>
                        <div className="text-xs" style={{ color: '#7bacc8' }}>
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
                      {vDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg"
                          style={{
                            background: doc.statut === 'expire' ? 'rgba(255,68,68,0.08)' :
                                        doc.statut === 'expire_bientot' ? 'rgba(255,179,0,0.06)' :
                                        'rgba(10,22,40,0.4)',
                            border: `1px solid ${
                              doc.statut === 'expire' ? 'rgba(255,68,68,0.25)' :
                              doc.statut === 'expire_bientot' ? 'rgba(255,179,0,0.2)' :
                              '#1e3a5f'
                            }`,
                          }}>
                          <span style={{ color: '#7bacc8' }}>{docTypeLabel[doc.type]}</span>
                          <span style={{
                            color: doc.statut === 'expire' ? '#ff4444' :
                                   doc.statut === 'expire_bientot' ? '#ffb300' : '#00e676',
                          }}>
                            {doc.dateExpiration}
                          </span>
                        </div>
                      ))}
                      {vDocs.length === 0 && (
                        <p className="text-xs italic" style={{ color: '#2a5070' }}>Aucun document enregistré</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table complète */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>
                  Tous les documents ({documentsVehicules.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                      {['Véhicule', 'Type', 'Libellé', 'Organisme', 'Émission', 'Expiration', 'Montant', 'Statut'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#2a5070', background: 'rgba(5,14,31,0.4)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documentsVehicules
                      .sort((a, b) => {
                        const order = { expire: 0, expire_bientot: 1, valide: 2 };
                        return order[a.statut] - order[b.statut];
                      })
                      .map(doc => {
                        const v = vehicles.find(x => x.id === doc.vehiculeId);
                        const expDate = new Date(doc.dateExpiration);
                        const jours   = Math.round((expDate.getTime() - today.getTime()) / 86400000);
                        const expClr  = jours < 0 ? '#ff4444' : jours < 60 ? '#ffb300' : '#00e676';
                        return (
                          <tr key={doc.id} className="table-row-hover" style={{ borderBottom: '1px solid #1e3a5f26' }}>
                            <td className="px-4 py-3">
                              <div className="font-mono text-xs font-semibold" style={{ color: '#00d4ff' }}>
                                {v?.immatriculation}
                              </div>
                              <div className="text-xs" style={{ color: '#4a7a9b' }}>{v?.marque} {v?.modele}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={docTypeLabel[doc.type]} className={docTypeColor[doc.type]} />
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#7bacc8' }}>{doc.libelle}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#4a7a9b' }}>{doc.organisme}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#4a7a9b' }}>{doc.dateEmission}</td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-semibold" style={{ color: expClr }}>{doc.dateExpiration}</div>
                              <div className="text-xs" style={{ color: expClr }}>
                                {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `dans ${jours}j`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#7bacc8' }}>
                              {doc.montant ? `${doc.montant.toLocaleString()} MAD` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={statutDocLabel[doc.statut]} className={statutDocColor[doc.statut]} />
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
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
                  Calendrier des renouvellements
                </h3>
                <div className="space-y-2">
                  {allEcheances.map(doc => {
                    const clr  = doc.jours < 0 ? '#ff4444' : doc.jours < 30 ? '#ff4444' : doc.jours < 90 ? '#ffb300' : '#00e676';
                    const icon = doc.jours < 0 ? '🔴' : doc.jours < 30 ? '🟠' : doc.jours < 90 ? '🟡' : '🟢';
                    return (
                      <div key={doc.id}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
                        style={{
                          background: `${clr}06`,
                          border: `1px solid ${clr}20`,
                        }}>
                        <span className="text-base w-5 flex-shrink-0">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold" style={{ color: '#00d4ff' }}>
                              {doc.vehicule?.immatriculation}
                            </span>
                            <Badge label={docTypeLabel[doc.type]} className={docTypeColor[doc.type]} />
                            <span className="text-xs truncate" style={{ color: '#7bacc8' }}>{doc.libelle}</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>{doc.organisme}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-semibold" style={{ color: clr }}>
                            {doc.dateExpiration}
                          </div>
                          <div className="text-xs font-bold" style={{ color: clr }}>
                            {doc.jours < 0
                              ? `Expiré depuis ${Math.abs(doc.jours)}j`
                              : `dans ${doc.jours}j`}
                          </div>
                          {doc.montant && (
                            <div className="text-xs" style={{ color: '#4a7a9b' }}>
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
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
                    Statut des documents
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Valides',        count: documentsVehicules.filter(d=>d.statut==='valide').length,         color: '#00e676' },
                      { label: 'Expirent < 90j', count: documentsVehicules.filter(d=>d.statut==='expire_bientot').length, color: '#ffb300' },
                      { label: 'Expirés',        count: documentsVehicules.filter(d=>d.statut==='expire').length,         color: '#ff4444' },
                    ].map(({ label, count, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#7bacc8' }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#1e3a5f' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${(count / documentsVehicules.length) * 100}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
                    Coût renouvellements
                  </h3>
                  <div className="space-y-2">
                    {documentsVehicules
                      .filter(d => d.statut !== 'valide' && d.montant)
                      .map(doc => (
                        <div key={doc.id} className="flex justify-between text-xs">
                          <span style={{ color: '#7bacc8' }}>
                            {vehicles.find(v=>v.id===doc.vehiculeId)?.immatriculation} · {docTypeLabel[doc.type]}
                          </span>
                          <span className="font-semibold" style={{ color: '#ffb300' }}>
                            {doc.montant?.toLocaleString()} MAD
                          </span>
                        </div>
                      ))}
                    <div className="pt-2 mt-1 flex justify-between text-xs font-bold"
                      style={{ borderTop: '1px solid #1e3a5f' }}>
                      <span style={{ color: '#7bacc8' }}>Total à prévoir</span>
                      <span style={{ color: '#ff4444' }}>
                        {documentsVehicules
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

            {/* Bar chart CA estimé vs réel */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
                CA mensuel estimé vs réel par client (MAD)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={caChart} margin={{ top: 5, right: 10, left: -5, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="client" tick={{ fill: '#4a7a9b', fontSize: 10, angle: -20, textAnchor: 'end' }}
                    axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: '#4a7a9b', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => `${Number(v).toLocaleString()} MAD`} />
                  <Bar dataKey="CA estimé" fill="#00d4ff" fillOpacity={0.7}  radius={[4,4,0,0]} />
                  <Bar dataKey="CA réel"   fill="#00e676" fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table contrats */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>Portefeuille clients</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                      {['Client', 'Type', 'Tarif/km', 'Volume/mois', 'CA annuel', 'Période', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#2a5070', background: 'rgba(5,14,31,0.4)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contratsClients.map(c => {
                      const finDate    = new Date(c.dateFin);
                      const jours      = Math.round((finDate.getTime() - today.getTime()) / 86400000);
                      const dateClr    = jours < 0 ? '#ff4444' : jours < 90 ? '#ffb300' : '#7bacc8';
                      return (
                        <tr key={c.id} className="table-row-hover cursor-pointer"
                          style={{ borderBottom: '1px solid #1e3a5f26' }}
                          onClick={() => setSelectedContrat(c.id)}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: '#e8f4fd' }}>
                            {c.client}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={c.type} className={contratTypeColor[c.type]} />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#00d4ff' }}>
                            {c.tarifKm} MAD
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#7bacc8' }}>
                            {c.volumeMensuel} missions
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#00e676' }}>
                            {(c.caAnnuelEstime / 1000).toFixed(0)}K MAD
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: dateClr }}>
                            {c.dateDebut} → {c.dateFin}
                            {jours < 90 && (
                              <div className="font-semibold">
                                {jours < 0 ? `Expiré ${Math.abs(jours)}j` : `dans ${jours}j`}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={c.statut} className={
                              c.statut === 'actif' ? 'text-[#00e676] bg-[#00e67612] border-[#00e67640]' :
                              c.statut === 'en_negociation' ? 'text-[#ffb300] bg-[#ffb30012] border-[#ffb30040]' :
                              'text-[#ff4444] bg-[#ff444412] border-[#ff444440]'
                            } />
                          </td>
                          <td className="px-4 py-3">
                            <button className="flex items-center gap-1 text-xs" style={{ color: '#00d4ff' }}>
                              Détail <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 flex justify-between"
                style={{ borderTop: '1px solid #1e3a5f', background: 'rgba(5,14,31,0.4)' }}>
                <div>
                  <div className="text-xs" style={{ color: '#4a7a9b' }}>CA annuel total estimé</div>
                  <div className="text-sm font-bold" style={{ color: '#00d4ff' }}>
                    {(contratsClients.reduce((s,c)=>s+c.caAnnuelEstime,0)/1000000).toFixed(2)} M MAD
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#4a7a9b' }}>Volume mensuel total</div>
                  <div className="text-sm font-bold" style={{ color: '#00e676' }}>
                    {contratsClients.reduce((s,c)=>s+c.volumeMensuel,0)} missions/mois
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
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#e8f4fd' }}>
                  Suivi facturation — Mai 2025
                </h3>
                <p className="text-xs mb-4" style={{ color: '#4a7a9b' }}>Montants en MAD TTC</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label:   'Total facturé',
                      value:   factures.reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${factures.length} factures`,
                      color:   '#e8f4fd',
                    },
                    {
                      label:   'Encaissé',
                      value:   factures.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${factures.filter(f=>f.statut==='payee').length} factures payées`,
                      color:   '#00e676',
                    },
                    {
                      label:   'En attente',
                      value:   factures.filter(f=>f.statut==='en_attente').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${factures.filter(f=>f.statut==='en_attente').length} en cours`,
                      color:   '#00d4ff',
                    },
                    {
                      label:   'En retard',
                      value:   factures.filter(f=>f.statut==='retard').reduce((s,f)=>s+f.montantTTC,0),
                      subval:  `${factures.filter(f=>f.statut==='retard').length} dépassées`,
                      color:   '#ff4444',
                    },
                  ].map(({ label, value, subval, color }) => (
                    <div key={label} className="px-4 py-3 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                      <div className="text-lg font-black" style={{ color }}>
                        {value.toLocaleString()} MAD
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>{label}</div>
                      <div className="text-xs" style={{ color: '#2a5070' }}>{subval}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#e8f4fd' }}>
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
                    <Tooltip
                      contentStyle={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {facturePie.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span style={{ color: '#7bacc8' }}>{d.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: '#e8f4fd' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table factures */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #1e3a5f' }}>
                <span className="text-sm font-semibold" style={{ color: '#e8f4fd' }}>
                  Liste des factures
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                      {['Référence', 'Client', 'Émission', 'Échéance', 'HT', 'TVA', 'TTC', 'Statut'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#2a5070', background: 'rgba(5,14,31,0.4)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...factures]
                      .sort((a, b) => {
                        const order: Record<string, number> = { retard: 0, en_attente: 1, payee: 2, litige: 3 };
                        return (order[a.statut] ?? 4) - (order[b.statut] ?? 4);
                      })
                      .map(f => {
                        const echeanceDate = new Date(f.dateEcheance);
                        const joursEch     = Math.round((echeanceDate.getTime() - today.getTime()) / 86400000);
                        const echClr       = f.statut === 'retard' ? '#ff4444' : joursEch < 7 ? '#ffb300' : '#7bacc8';
                        return (
                          <tr key={f.id} className="table-row-hover" style={{ borderBottom: '1px solid #1e3a5f26' }}>
                            <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#00d4ff' }}>
                              {f.reference}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: '#e8f4fd' }}>{f.client}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#4a7a9b' }}>{f.dateEmission}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: echClr }}>
                              {f.dateEcheance}
                              {f.statut === 'retard' && (
                                <div className="font-semibold">Retard {Math.abs(joursEch)}j</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: '#7bacc8' }}>
                              {f.montantHT.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#4a7a9b' }}>
                              {f.tva.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#e8f4fd' }}>
                              {f.montantTTC.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={f.statut} className={factureColor[f.statut]} />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 grid grid-cols-4 gap-4"
                style={{ borderTop: '1px solid #1e3a5f', background: 'rgba(5,14,31,0.4)' }}>
                {[
                  { label: 'Total HT',  value: `${factures.reduce((s,f)=>s+f.montantHT,0).toLocaleString()} MAD`,  color: '#7bacc8' },
                  { label: 'Total TVA', value: `${factures.reduce((s,f)=>s+f.tva,0).toLocaleString()} MAD`,         color: '#4a7a9b' },
                  { label: 'Total TTC', value: `${factures.reduce((s,f)=>s+f.montantTTC,0).toLocaleString()} MAD`,  color: '#00d4ff' },
                  { label: 'Encaissé',  value: `${factures.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montantTTC,0).toLocaleString()} MAD`, color: '#00e676' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="text-xs" style={{ color: '#4a7a9b' }}>{label}</div>
                    <div className="text-sm font-bold" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {selectedContrat && (
        <ContratPanel contratId={selectedContrat} onClose={() => setSelectedContrat(null)} />
      )}
    </div>
  );
}
