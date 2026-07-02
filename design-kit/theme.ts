// ════════════════════════════════════════════════════════════════════════
// FleetOS Design Kit — theme.ts
// Tokens de couleur en JS/TS, pour toute app React/Vue/Svelte qui préfère
// consommer le design via des objets plutôt que des variables CSS.
// Utilisation React : voir ThemeProvider.example.tsx
// ════════════════════════════════════════════════════════════════════════

export interface ThemeColors {
  bgApp: string; bgSidebar: string; bgHeader: string; bgCard: string;
  bgElevated: string; bgHover: string; bgInput: string;
  border: string; borderStrong: string; borderFaint: string;
  textPrimary: string; textSecondary: string; textMuted: string; textFaint: string;
  accent: string; accentBg: string; accentBorder: string;
  success: string; successBg: string; successBorder: string;
  warning: string; warningBg: string; warningBorder: string;
  danger: string; dangerBg: string; dangerBorder: string;
  gridStroke: string; tooltipBg: string; tooltipBorder: string;
}

export const darkColors: ThemeColors = {
  bgApp:        '#020817',
  bgSidebar:    'linear-gradient(180deg, #050e1f 0%, #020817 100%)',
  bgHeader:     'rgba(5,14,31,0.9)',
  bgCard:       'rgba(13,27,46,0.85)',
  bgElevated:   '#0a1628',
  bgHover:      'rgba(0,212,255,0.04)',
  bgInput:      '#0a1628',
  border:       '#1e3a5f',
  borderStrong: '#234878',
  borderFaint:  'rgba(30,58,95,0.4)',
  textPrimary:   '#e8f4fd',
  textSecondary: '#7bacc8',
  textMuted:     '#4a7a9b',
  textFaint:     '#2a5070',
  accent:       '#00d4ff',
  accentBg:     'rgba(0,212,255,0.1)',
  accentBorder: 'rgba(0,212,255,0.3)',
  success:      '#00e676',
  successBg:    'rgba(0,230,118,0.1)',
  successBorder:'rgba(0,230,118,0.3)',
  warning:      '#ffb300',
  warningBg:    'rgba(255,179,0,0.1)',
  warningBorder:'rgba(255,179,0,0.3)',
  danger:       '#ff4444',
  dangerBg:     'rgba(255,68,68,0.1)',
  dangerBorder: 'rgba(255,68,68,0.3)',
  gridStroke:   '#1e3a5f',
  tooltipBg:    '#0f2040',
  tooltipBorder:'#1e3a5f',
};

export const lightColors: ThemeColors = {
  bgApp:        '#eef4fb',
  bgSidebar:    'linear-gradient(180deg, #1a3a6b 0%, #0f2040 100%)',
  bgHeader:     'rgba(255,255,255,0.95)',
  bgCard:       'rgba(255,255,255,0.95)',
  bgElevated:   '#f5f9ff',
  bgHover:      'rgba(0,120,200,0.05)',
  bgInput:      '#f0f6ff',
  border:       '#c8dff0',
  borderStrong: '#a8c4e0',
  borderFaint:  'rgba(168,196,224,0.4)',
  textPrimary:   '#0a1628',
  textSecondary: '#2a5070',
  textMuted:     '#4a7a9b',
  textFaint:     '#7bacc8',
  accent:       '#0088cc',
  accentBg:     'rgba(0,136,204,0.1)',
  accentBorder: 'rgba(0,136,204,0.35)',
  success:      '#00a854',
  successBg:    'rgba(0,168,84,0.1)',
  successBorder:'rgba(0,168,84,0.3)',
  warning:      '#d4900a',
  warningBg:    'rgba(212,144,10,0.1)',
  warningBorder:'rgba(212,144,10,0.3)',
  danger:       '#d42222',
  dangerBg:     'rgba(212,34,34,0.1)',
  dangerBorder: 'rgba(212,34,34,0.3)',
  gridStroke:   '#d0e4f0',
  tooltipBg:    '#ffffff',
  tooltipBorder:'#c8dff0',
};

// Rayons, ombres, typographie — le reste du "langage visuel" de l'app.
export const radius  = { sm: '8px', md: '12px', lg: '16px', pill: '9999px' };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 }; // px, base Tailwind
export const font = {
  family: "'Inter', system-ui, -apple-system, sans-serif",
  weights: [300, 400, 500, 600, 700, 800, 900],
  googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
};
export const gradients = {
  primaryButton: 'linear-gradient(135deg,#00d4ff,#0077aa)',
  sidebarDark:   'linear-gradient(180deg, #050e1f 0%, #020817 100%)',
  sidebarLight:  'linear-gradient(180deg, #1a3a6b 0%, #0f2040 100%)',
};
