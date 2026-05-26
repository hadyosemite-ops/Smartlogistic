import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  label, value, unit, icon: Icon, iconColor = '#00d4ff', iconBg,
  trend, trendLabel, glowClass = '', onClick
}: KPICardProps) {
  const { c } = useTheme();
  const isPositive = trend !== undefined ? trend >= 0 : undefined;
  const defaultIconBg = iconBg ?? c.accentBg;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 ${glowClass} ${onClick ? 'cursor-pointer transition-all' : ''}`}
      style={{ transition: 'all 0.3s ease' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: defaultIconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: isPositive ? c.successBg : c.dangerBg,
              color: isPositive ? c.success : c.danger,
            }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold leading-none" style={{ color: c.textPrimary }}>{value}</span>
        {unit && <span className="text-sm mb-0.5" style={{ color: c.textMuted }}>{unit}</span>}
      </div>
      <div className="mt-1.5">
        <div className="text-sm font-medium" style={{ color: c.textSecondary }}>{label}</div>
        {trendLabel && <div className="text-xs mt-0.5" style={{ color: c.textFaint }}>{trendLabel}</div>}
      </div>
    </div>
  );
}
