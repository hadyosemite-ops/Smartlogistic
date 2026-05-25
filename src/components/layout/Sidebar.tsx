import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, ShieldCheck, Wrench,
  BarChart3, Users, FileText, Bell, Settings, ChevronRight
} from 'lucide-react';
import { alerts } from '../../data/mock';

const unreadCount = alerts.filter(a => !a.lu).length;

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',       sub: 'Vue d\'ensemble' },
  { to: '/exploitation',icon: Truck,           label: 'Exploitation',    sub: 'Missions & Transport' },
  { to: '/securite',    icon: ShieldCheck,     label: 'Sécurité',        sub: 'Conducteurs & Alertes' },
  { to: '/maintenance', icon: Wrench,          label: 'Maintenance',     sub: 'Véhicules & Entretien' },
  { to: '/controle',    icon: BarChart3,       label: 'Contrôle Gestion',sub: 'Coûts & Rentabilité' },
  { to: '/rh',          icon: Users,           label: 'Ressources Hum.', sub: 'Personnel & Planning' },
  { to: '/administratif',icon: FileText,       label: 'Administratif',   sub: 'Documents & Conformité' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="flex flex-col w-64 min-h-screen"
      style={{ background: 'linear-gradient(180deg, #050e1f 0%, #020817 100%)', borderRight: '1px solid #1e3a5f' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #1e3a5f' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #0077aa)', boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}>
          <Truck size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider" style={{ color: '#e8f4fd' }}>FLEET<span style={{ color: '#00d4ff' }}>OS</span></div>
          <div className="text-xs" style={{ color: '#4a7a9b' }}>Gestion de Flotte</div>
        </div>
      </div>

      {/* Alerts badge */}
      <div className="mx-4 my-3 flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
        style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)' }}>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: '#ff4444' }} />
          <span className="text-xs font-medium" style={{ color: '#ff8888' }}>Alertes actives</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#ff4444', color: '#fff' }}>
          {unreadCount}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-widest mb-3 px-2" style={{ color: '#2a5070' }}>
          Modules
        </div>
        {nav.map(({ to, icon: Icon, label, sub }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <NavLink key={to} to={to}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 group ${isActive ? 'active' : 'border-transparent'}`}
              style={isActive ? { borderLeftColor: '#00d4ff', background: 'rgba(0,212,255,0.1)' } : { borderLeftColor: 'transparent' }}>
              <Icon size={17} style={{ color: isActive ? '#00d4ff' : '#4a7a9b', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight truncate"
                  style={{ color: isActive ? '#e8f4fd' : '#7bacc8' }}>{label}</div>
                <div className="text-xs truncate" style={{ color: '#2a5070' }}>{sub}</div>
              </div>
              {isActive && <ChevronRight size={13} style={{ color: '#00d4ff', flexShrink: 0 }} />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid #1e3a5f' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #1a3366, #0f2040)', border: '1px solid #234878', color: '#00d4ff' }}>
            DG
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: '#e8f4fd' }}>Direction Générale</div>
            <div className="text-xs truncate" style={{ color: '#4a7a9b' }}>Administrateur</div>
          </div>
          <Settings size={15} style={{ color: '#4a7a9b', cursor: 'pointer' }} />
        </div>
      </div>
    </aside>
  );
}
