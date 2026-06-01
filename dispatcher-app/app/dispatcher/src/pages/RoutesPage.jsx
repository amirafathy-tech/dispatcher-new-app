import { D_TOK, STATUS_TONE } from '../tokens.js';
import { Avatar, Pill, Mono, Progress } from '../shell/atoms.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export default function RoutesPage({ drivers, assignments, orders }) {
  const { isMobile } = useBreakpoint();
  const activeDrivers = drivers.filter(d => ['on-route', 'late', 'break'].includes(d.status));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isMobile ? 12 : 24, background: D_TOK.sand }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: D_TOK.ink, margin: 0 }}>Route Planning</h2>
        <p style={{ fontSize: 13, color: D_TOK.mute, marginTop: 2 }}>
          {activeDrivers.length} active routes · {drivers.filter(d => d.status === 'idle').length} drivers available
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeDrivers.map(d => {
          const tone = STATUS_TONE[d.status] ?? STATUS_TONE.idle;
          const driverAssignments = assignments.filter(a => a.driverId === d.driverId);
          const assignedOrders = driverAssignments.map(a => orders.find(o => o.orderId === a.orderId)).filter(Boolean);

          return (
            <div key={d.driverId} style={{
              background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`,
              padding: isMobile ? '12px 14px' : '16px 20px',
            }}>
              {/* Driver header */}
              <div style={{
                display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                gap: 12, marginBottom: 14, flexWrap: 'wrap',
              }}>
                <Avatar initials={d.initials} status={d.status} size={38} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: D_TOK.ink }}>{d.name}</div>
                  <Mono style={{ fontSize: 12, color: D_TOK.mute }}>{d.van} · {d.route || 'No route'} · {d.shift}</Mono>
                </div>
                <Pill label={tone.label} bg={tone.bg} color={tone.text} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: D_TOK.mute }}>Stops</div>
                  <Mono style={{ fontWeight: 700, color: D_TOK.ink }}>{d.done}/{d.stops}</Mono>
                </div>
                <div style={{ width: isMobile ? '100%' : 100 }}>
                  <Progress done={d.done} total={d.stops} />
                </div>
              </div>

              {/* Assigned orders */}
              {assignedOrders.length > 0 ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8,
                }}>
                  {assignedOrders.map(o => (
                    <div key={o.orderId} style={{
                      padding: '8px 12px', borderRadius: 8, background: D_TOK.accentBg,
                      border: `1px solid ${D_TOK.accent}30`,
                    }}>
                      <Mono style={{ fontSize: 11, color: D_TOK.accent, fontWeight: 700 }}>{o.orderId}</Mono>
                      <div style={{ fontSize: 12, color: D_TOK.ink, marginTop: 2, fontWeight: 600 }}>{o.customer}</div>
                      <div style={{ fontSize: 11, color: D_TOK.mute }}>{o.window} · {Number(o.km).toFixed(1)} km</div>
                      <Mono style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink, marginTop: 2 }}>
                        SAR {Number(o.value).toLocaleString('en-SA', { minimumFractionDigits: 2 })}
                      </Mono>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: D_TOK.mute, fontStyle: 'italic' }}>
                  No orders assigned to this route yet
                </div>
              )}
            </div>
          );
        })}

        {/* Available drivers section */}
        {drivers.filter(d => d.status === 'idle').length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`, padding: isMobile ? '12px 14px' : '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink2, marginBottom: 12 }}>
              Available — Not Yet Dispatched
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {drivers.filter(d => d.status === 'idle').map(d => (
                <div key={d.driverId} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  border: `1px solid ${D_TOK.line}`, borderRadius: 8,
                }}>
                  <Avatar initials={d.initials} status={d.status} size={28} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D_TOK.ink }}>{d.name}</div>
                    <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{d.van}</Mono>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
