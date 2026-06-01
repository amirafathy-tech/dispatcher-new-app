import { D_TOK } from '../tokens.js';

export const Pill = ({ label, bg, color, style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
    borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    background: bg, color, whiteSpace: 'nowrap', ...style,
  }}>
    {label}
  </span>
);

export const Btn = ({ children, onClick, variant = 'ghost', size = 'md', disabled, style }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'default' : 'pointer',
    border: 'none', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontWeight: 600,
    fontSize: size === 'sm' ? 12 : 13, padding: size === 'sm' ? '4px 10px' : '7px 14px',
    opacity: disabled ? 0.5 : 1, transition: 'background 0.15s',
  };
  const variants = {
    ghost:   { background: 'transparent', color: D_TOK.ink2 },
    outline: { background: 'transparent', color: D_TOK.ink, border: `1.5px solid ${D_TOK.line}` },
    primary: { background: D_TOK.accent, color: '#fff' },
    danger:  { background: '#FEE2E2', color: D_TOK.bad },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

export const Mono = ({ children, style }) => (
  <span style={{ fontFamily: "'JetBrains Mono', monospace", ...style }}>{children}</span>
);

export const Avatar = ({ initials, status, size = 36, style }) => {
  const dotColor = {
    'on-route': '#16A34A', 'idle': '#9CA3AF', 'late': '#DC2626',
    'break': '#D97706', 'depot': '#CA8A04',
  }[status] ?? '#9CA3AF';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', background: D_TOK.ink,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.33, fontWeight: 700, letterSpacing: '0.02em',
      }}>
        {initials}
      </div>
      {status && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%', background: dotColor,
          border: '1.5px solid #fff',
        }} />
      )}
    </div>
  );
};

export const Mini = ({ label, value, dot, style }) => (
  <div style={{
    background: '#fff', border: `1px solid ${D_TOK.line}`, borderRadius: 8,
    padding: '8px 12px', flex: 1, minWidth: 0, ...style,
  }}>
    <div style={{ fontSize: 11, color: D_TOK.mute, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block' }} />}
      {value}
    </div>
  </div>
);

export const KPI = ({ label, value, dot, large, style }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '6px 14px', background: '#fff', borderRadius: 8,
    border: `1px solid ${D_TOK.line}`, ...style,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />}
      <span style={{ fontSize: 11, color: D_TOK.mute, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
    <span style={{
      fontSize: large ? 22 : 20, fontWeight: 700, color: D_TOK.ink,
      fontFamily: "'JetBrains Mono', monospace", marginTop: 2,
    }}>
      {value}
    </span>
  </div>
);

export const Progress = ({ done, total, style }) => {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div style={{ height: 4, background: D_TOK.line, borderRadius: 4, overflow: 'hidden', ...style }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: D_TOK.accent,
        borderRadius: 4, transition: 'width 0.3s',
      }} />
    </div>
  );
};

export const Divider = ({ style }) => (
  <div style={{ height: 1, background: D_TOK.line, ...style }} />
);
