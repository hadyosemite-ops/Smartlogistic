import { useTheme } from '../../context/ThemeContext';

interface Props {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export default function DataState({ loading, error, children }: Props) {
  const { c } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: c.accent, borderTopColor: 'transparent' }}
          />
          <p className="text-xs" style={{ color: c.textMuted }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: '#ff444415', border: '1px solid #ff444440', color: '#ff4444' }}
        >
          Erreur : {error}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
