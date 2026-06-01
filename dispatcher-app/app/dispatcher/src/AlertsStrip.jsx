import { D_TOK, SEV_TONE } from './tokens.js';
import { Mono } from './shell/atoms.jsx';

export default function AlertsStrip({ alerts }) {
  return (
    <div style={{
      height: 40, background: '#fff', borderTop: `1px solid ${D_TOK.line}`,
      display: 'flex', alignItems: 'center', overflowX: 'auto', overflowY: 'hidden',
      padding: '0 16px', gap: 24, flexShrink: 0,
      scrollbarWidth: 'none',
    }}>
      {alerts.map(alert => {
        const tone = SEV_TONE[alert.severity] ?? SEV_TONE.low;
        return (
          <div key={alert.alertId} style={{
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: tone.dot, display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 12, color: D_TOK.ink,
              fontWeight: tone.bold ? 700 : 400,
            }}>
              {alert.text}
            </span>
            <Mono style={{ fontSize: 11, color: D_TOK.mute, marginLeft: 4 }}>
              {alert.time}
            </Mono>
          </div>
        );
      })}
    </div>
  );
}
