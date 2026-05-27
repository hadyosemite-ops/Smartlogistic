import { useState, useRef, useEffect } from 'react';
import { Bell, RefreshCw, Search, Sun, Moon, X, CheckCheck } from 'lucide-react';
import { alerts as initialAlerts } from '../../data/mock';
import type { Alert } from '../../data/mock';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const levelColor: Record<string, string> = {
  critique: '#ff4444',
  warning:  '#ffb300',
  info:     '#00d4ff',
};

const alertTypeIcon: Record<string, string> = {
  INCIDENT: '🚨', RETARD: '⏱️', VITESSE: '⚡', MAINTENANCE: '🔧',
  DOCUMENT: '📄', FATIGUE: '😴', CARBURANT: '⛽',
};

export default function Header({ title, subtitle }: HeaderProps) {
  const { c, isDark, toggle } = useTheme();
  const [showAlerts, setShowAlerts]   = useState(false);
  const [alertList, setAlertList]     = useState<Alert[]>(initialAlerts);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = alertList.filter(a => !a.lu).length;

  const now     = new Date();
  const dateStr = now.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

  // Ferme le panneau au clic extérieur
  useEffect(() => {
    if (!showAlerts) return;
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setShowAlerts(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showAlerts]);

  const markAllRead = () => setAlertList(prev => prev.map(a => ({ ...a, lu: true })));
  const markRead    = (id: string) => setAlertList(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a));

  return (
    <header className="flex items-center justify-between px-6 py-4"
      style={{ background: c.bgHeader, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(10px)', transition: 'background 0.3s ease, border-color 0.3s ease' }}>

      <div>
        <h1 className="text-lg font-semibold leading-tight" style={{ color: c.textPrimary }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: c.textMuted }} />
          <input type="text" placeholder="Rechercher..."
            className="pl-8 pr-4 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textSecondary, width: 180 }} />
        </div>

        {/* Date / heure */}
        <div className="hidden lg:block text-right">
          <div className="text-xs font-medium capitalize" style={{ color: c.textSecondary }}>{dateStr}</div>
          <div className="text-xs font-mono"              style={{ color: c.textMuted }}>{timeStr}</div>
        </div>

        {/* Toggle thème */}
        <button onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}
          title={isDark ? 'Mode clair' : 'Mode sombre'}>
          {isDark ? <Sun size={14} style={{ color: '#ffb300' }} /> : <Moon size={14} style={{ color: '#4a7a9b' }} />}
        </button>

        {/* Actualiser */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }} title="Actualiser">
          <RefreshCw size={14} style={{ color: c.textMuted }} />
        </button>

        {/* ── Cloche alertes ─────────────────────────────────────── */}
        <div className="relative" ref={panelRef}>
          <button onClick={() => setShowAlerts(v => !v)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: unread > 0 ? 'rgba(255,68,68,0.12)' : c.bgElevated,
              border: `1px solid ${unread > 0 ? 'rgba(255,68,68,0.3)' : c.border}`,
            }}>
            <Bell size={14} style={{ color: unread > 0 ? '#ff6666' : c.textMuted }} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#ff4444', color: '#fff' }}>{unread}</span>
            )}
          </button>

          {/* ── Panneau déroulant ── */}
          {showAlerts && (
            <div className="absolute right-0 top-10 w-96 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: c.bgCard, border: `1px solid ${c.borderStrong}` }}>

              {/* En-tête panneau */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-2">
                  <Bell size={13} style={{ color: '#ff6666' }} />
                  <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>Alertes</span>
                  {unread > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: '#ff4444', color: '#fff' }}>{unread} non lue{unread > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ color: c.accent, background: c.accentBg, border: `1px solid ${c.accentBorder}` }}>
                      <CheckCheck size={11} /> Tout lire
                    </button>
                  )}
                  <button onClick={() => setShowAlerts(false)} style={{ color: c.textMuted }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Liste alertes */}
              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {alertList.map(alert => (
                  <div key={alert.id} onClick={() => markRead(alert.id)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      background: alert.lu ? 'transparent' : (isDark ? 'rgba(255,68,68,0.04)' : 'rgba(255,68,68,0.03)'),
                      borderBottom: `1px solid ${c.borderFaint}`,
                    }}>
                    {/* Icône type */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{
                        background: alert.lu ? c.bgElevated : `${levelColor[alert.level]}18`,
                        border: `1px solid ${alert.lu ? c.border : levelColor[alert.level] + '40'}`,
                      }}>
                      {alertTypeIcon[alert.type] ?? '🔔'}
                    </div>
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold"
                          style={{ color: alert.lu ? c.textMuted : levelColor[alert.level] }}>
                          {alert.type}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: c.textFaint }}>
                          {alert.timestamp.split(' ')[1]}
                        </span>
                      </div>
                      <p className="text-xs leading-snug"
                        style={{ color: alert.lu ? c.textFaint : c.textSecondary }}>
                        {alert.message}
                      </p>
                    </div>
                    {/* Point non-lu */}
                    {!alert.lu && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: levelColor[alert.level] }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Pied panneau */}
              <div className="px-4 py-2.5 text-center" style={{ borderTop: `1px solid ${c.border}` }}>
                <span className="text-xs" style={{ color: c.textFaint }}>
                  {alertList.length} alerte{alertList.length > 1 ? 's' : ''} au total
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: c.success }} />
          <span className="text-xs font-medium" style={{ color: c.success }}>Live</span>
        </div>

      </div>
    </header>
  );
}
