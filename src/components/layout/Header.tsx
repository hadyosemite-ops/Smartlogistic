import { Bell, RefreshCw, Search } from 'lucide-react';
import { alerts } from '../../data/mock';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const unread = alerts.filter(a => !a.lu).length;

export default function Header({ title, subtitle }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex items-center justify-between px-6 py-4"
      style={{ background: 'rgba(5,14,31,0.9)', borderBottom: '1px solid #1e3a5f', backdropFilter: 'blur(10px)' }}>

      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold leading-tight" style={{ color: '#e8f4fd' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#4a7a9b' }}>{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#4a7a9b' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-8 pr-4 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: '#0a1628', border: '1px solid #1e3a5f', color: '#7bacc8', width: 180 }}
          />
        </div>

        {/* Date/time */}
        <div className="hidden lg:block text-right">
          <div className="text-xs font-medium capitalize" style={{ color: '#7bacc8' }}>{dateStr}</div>
          <div className="text-xs font-mono" style={{ color: '#4a7a9b' }}>{timeStr}</div>
        </div>

        {/* Refresh */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: '#0a1628', border: '1px solid #1e3a5f' }}
          title="Actualiser">
          <RefreshCw size={14} style={{ color: '#4a7a9b' }} />
        </button>

        {/* Alerts */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: unread > 0 ? 'rgba(255,68,68,0.12)' : '#0a1628', border: `1px solid ${unread > 0 ? 'rgba(255,68,68,0.3)' : '#1e3a5f'}` }}>
          <Bell size={14} style={{ color: unread > 0 ? '#ff6666' : '#4a7a9b' }} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: '#ff4444', color: '#fff' }}>{unread}</span>
          )}
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00e676' }} />
          <span className="text-xs font-medium" style={{ color: '#00e676' }}>Live</span>
        </div>
      </div>
    </header>
  );
}
