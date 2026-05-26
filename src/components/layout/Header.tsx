import { Bell, RefreshCw, Search, Sun, Moon } from 'lucide-react';
import { alerts } from '../../data/mock';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const unread = alerts.filter(a => !a.lu).length;

export default function Header({ title, subtitle }: HeaderProps) {
  const { c, isDark, toggle } = useTheme();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

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
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: c.bgInput, border: `1px solid ${c.border}`, color: c.textSecondary, width: 180 }}
          />
        </div>

        {/* Date/time */}
        <div className="hidden lg:block text-right">
          <div className="text-xs font-medium capitalize" style={{ color: c.textSecondary }}>{dateStr}</div>
          <div className="text-xs font-mono" style={{ color: c.textMuted }}>{timeStr}</div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}
          title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
          {isDark
            ? <Sun size={14} style={{ color: '#ffb300' }} />
            : <Moon size={14} style={{ color: '#4a7a9b' }} />}
        </button>

        {/* Refresh */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}
          title="Actualiser">
          <RefreshCw size={14} style={{ color: c.textMuted }} />
        </button>

        {/* Alerts */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: unread > 0 ? 'rgba(255,68,68,0.12)' : c.bgElevated, border: `1px solid ${unread > 0 ? 'rgba(255,68,68,0.3)' : c.border}` }}>
          <Bell size={14} style={{ color: unread > 0 ? '#ff6666' : c.textMuted }} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: '#ff4444', color: '#fff' }}>{unread}</span>
          )}
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: c.success }} />
          <span className="text-xs font-medium" style={{ color: c.success }}>Live</span>
        </div>
      </div>
    </header>
  );
}
