import Ico from './Ico.jsx';
import { D_TOK } from '../tokens.js';

const NAV = [
  { id: 'dispatch',   icon: 'grid',       label: 'Dispatch' },
  { id: 'drivers',    icon: 'truck',      label: 'Drivers' },
  { id: 'orders',     icon: 'cart',       label: 'Orders' },
  { id: 'routes',     icon: 'map',        label: 'Routes' },
  { id: 'customers',  icon: 'users',      label: 'Customers' },
  { id: 'reports',    icon: 'chart',      label: 'Reports' },
];

export default function Sidebar({ active, onNav, isMobile }) {
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 56,
        background: D_TOK.ink, display: 'flex', flexDirection: 'row',
        alignItems: 'stretch', zIndex: 10,
        boxShadow: '0 -2px 16px rgba(0,0,0,0.18)',
      }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                border: 'none', cursor: 'pointer',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
                borderTop: `2px solid ${isActive ? '#fff' : 'transparent'}`,
              }}
            >
              <Ico name={item.icon} size={17} color="currentColor" />
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      width: 72, minWidth: 72, height: '100%', background: D_TOK.ink,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 0', position: 'relative', zIndex: 10,
    }}>
      {/* SAP Logo */}
      <div style={{
        width: 40, height: 40, background: '#fff', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, color: D_TOK.ink, fontWeight: 800 }}>◨</span>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', paddingBottom: 8 }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={item.label}
              style={{
                width: '100%', height: 48, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                border: 'none', cursor: 'pointer', position: 'relative',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 28, background: '#fff', borderRadius: '0 3px 3px 0',
                }} />
              )}
              <Ico name={item.icon} size={18} color="currentColor" />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => onNav('settings')}
          title="Settings"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ico name="settings" size={18} color="currentColor" />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: D_TOK.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
        }}>
          RA
        </div>
      </div>
    </div>
  );
}
