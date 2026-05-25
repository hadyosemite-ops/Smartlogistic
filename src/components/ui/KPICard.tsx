import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number;
  trendLabel?: string;
  glowClass?: string;
  onClick?: () => void;
}

export default function KPICard({
  label, value, unit, icon: Icon, iconColor = '#00d4ff', iconBg = 'rgba(0,212,255,0.12)',
  trend, trendLabel, glowClass = '', onClick
}: KPICardProps) {
  const isPositive = trend !== undefined ? trend >= 0 : undefined;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 ${glowClass} ${onClick ? 'cursor-pointer hover:border-[#234878] transition-all' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium`}
            style={{
              background: isPositive ? 'rgba(0,230,118,0.1)' : 'rgba(255,68,68,0.1)',
              color: isPositive ? '#00e676' : '#ff4444'
            }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold leading-none" style={{ color: '#e8f4fd' }}>{value}</span>
        {unit && <span className="text-sm mb-0.5" style={{ color: '#4a7a9b' }}>{unit}</span>}
      </div>
      <div className="mt-1.5">
        <div className="text-sm font-medium" style={{ color: '#7bacc8' }}>{label}</div>
        {trendLabel && <div className="text-xs mt-0.5" style={{ color: '#2a5070' }}>{trendLabel}</div>}
      </div>
    </div>
  );
}
