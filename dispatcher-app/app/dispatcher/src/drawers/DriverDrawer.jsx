import { D_TOK, STATUS_TONE } from '../tokens.js';
import { Avatar, Mini, Btn, Mono, Divider } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';

function generateTimeline(driver) {
  const stops = [];
  for (let i = 0; i < driver.stops; i++) {
    const mins = 7 * 60 + i * 45;
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    const status = i < driver.done ? 'done' : i === driver.done ? 'next' : 'pending';
    stops.push({ label: `Customer Stop ${i + 1}`, eta: `${h}:${m}`, status });
  }
  return stops;
}

const DOT_COLOR = { done: '#16A34A', next: '#0A6ED1', pending: '#9CA3AF' };

export default function DriverDrawer({
  driver, assignments, orders, onClose, onUnassign, onPushRoute, onMarkDelivered, onToast, isMobile,
}) {
  if (!driver) return null;

  const tone = STATUS_TONE[driver.status] ?? STATUS_TONE.idle;
  const timeline = generateTimeline(driver);
  const pendingAssignments   = assignments.filter(a => a.driverId === driver.driverId && a.status === 'assigned');
  const pushedAssignments    = assignments.filter(a => a.driverId === driver.driverId && a.status === 'pushed');
  const deliveredAssignments = assignments.filter(a => a.driverId === driver.driverId && a.status === 'delivered');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.3)',
          zIndex: 200, animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 440,
        background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(11,18,32,0.12)',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 12px', borderBottom: `1px solid ${D_TOK.line}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <Avatar initials={driver.initials} status={driver.status} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: D_TOK.ink }}>{driver.name}</div>
            <div style={{ fontSize: 12, color: D_TOK.mute, marginTop: 2 }}>
              <Mono>{driver.driverId}</Mono> · {driver.van} · {driver.shift}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: D_TOK.mute, padding: 4,
          }}>
            <Ico name="x" size={18} color="currentColor" />
          </button>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${D_TOK.line}` }}>
          <Mini label="Status" value={tone.label} dot={tone.dot} />
          <Mini label="Stock" value={`${driver.stockPct}%`} />
          <Mini label="Sales" value={`SAR ${Number(driver.sales).toLocaleString('en-SA')}`} />
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {/* Route timeline */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Today's Route
            </div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{
                position: 'absolute', left: 7, top: 0, bottom: 0, width: 2,
                background: D_TOK.line,
              }} />
              {timeline.map((stop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -21, width: 12, height: 12, borderRadius: '50%',
                    background: DOT_COLOR[stop.status], border: '2px solid #fff',
                    boxShadow: `0 0 0 1px ${DOT_COLOR[stop.status]}`,
                  }} />
                  <Mono style={{ fontSize: 11, color: D_TOK.mute, width: 42, flexShrink: 0 }}>{stop.eta}</Mono>
                  <span style={{
                    fontSize: 12, color: stop.status === 'done' ? D_TOK.mute : D_TOK.ink,
                    fontWeight: stop.status === 'next' ? 700 : 400,
                    textDecoration: stop.status === 'done' ? 'line-through' : 'none',
                  }}>
                    {stop.label}
                  </span>
                  {stop.status === 'next' && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: D_TOK.accent }}>NEXT</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ marginBottom: 16 }} />

          {/* Pending push */}
          {pendingAssignments.length > 0 && (
            <div style={{
              background: D_TOK.accentBg, borderRadius: 10, padding: '10px 12px', marginBottom: 16,
              border: `1px solid ${D_TOK.accent}20`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.accent, marginBottom: 8 }}>
                Pending Push · {pendingAssignments.length} order{pendingAssignments.length > 1 ? 's' : ''}
              </div>
              {pendingAssignments.map(a => {
                const order = orders.find(o => o.orderId === a.orderId);
                if (!order) return null;
                return (
                  <div key={a.assignmentId} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderBottom: `1px solid ${D_TOK.accent}20`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: D_TOK.ink }}>{order.customer}</div>
                      <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{order.orderId} · SAR {Number(order.value).toFixed(2)}</Mono>
                    </div>
                    <button onClick={() => onUnassign(a.assignmentId)} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer', color: D_TOK.mute, padding: 4,
                    }}>
                      <Ico name="x" size={14} color="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pushed assignments */}
          {pushedAssignments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.good, marginBottom: 6 }}>
                On Route · {pushedAssignments.length} order{pushedAssignments.length > 1 ? 's' : ''}
              </div>
              {pushedAssignments.map(a => {
                const order = orders.find(o => o.orderId === a.orderId);
                if (!order) return null;
                return (
                  <div key={a.assignmentId} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', borderBottom: `1px solid ${D_TOK.line}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: D_TOK.ink }}>{order.customer}</div>
                      <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{order.orderId} · SAR {Number(order.value).toFixed(2)}</Mono>
                    </div>
                    <button
                      onClick={() => onMarkDelivered(a.assignmentId)}
                      style={{
                        background: D_TOK.good, border: 'none', cursor: 'pointer',
                        color: '#fff', padding: '4px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      Delivered
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivered assignments */}
          {deliveredAssignments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.mute, marginBottom: 6 }}>
                Delivered · {deliveredAssignments.length} order{deliveredAssignments.length > 1 ? 's' : ''}
              </div>
              {deliveredAssignments.map(a => {
                const order = orders.find(o => o.orderId === a.orderId);
                if (!order) return null;
                return (
                  <div key={a.assignmentId} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 0', borderBottom: `1px solid ${D_TOK.line}`,
                    opacity: 0.6,
                  }}>
                    <Ico name="check" size={11} color={D_TOK.good} />
                    <span style={{ fontSize: 12, color: D_TOK.mute, textDecoration: 'line-through' }}>
                      {order.customer} — {order.orderId}
                    </span>
                    <Mono style={{ marginLeft: 'auto', fontSize: 11, color: D_TOK.mute }}>
                      SAR {Number(order.value).toFixed(2)}
                    </Mono>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: 'phone',      label: 'Call',     msg: `Calling ${driver.name} at ${driver.phone}…` },
              { icon: 'message',    label: 'Message',  msg: `Message sent to ${driver.name}` },
              { icon: 'navigation', label: 'Re-route', msg: `Re-routing ${driver.van}…` },
              { icon: 'rotateCcw', label: 'Recall',   msg: `Recall request sent to ${driver.name}` },
            ].map(action => (
              <Btn key={action.label} variant="outline"
                onClick={() => onToast?.(action.msg)}
                style={{ justifyContent: 'center', padding: '10px' }}>
                <Ico name={action.icon} size={14} color={D_TOK.ink2} />
                {action.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Footer push button */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${D_TOK.line}` }}>
          <Btn
            variant="primary"
            onClick={() => onPushRoute(driver.driverId)}
            disabled={pendingAssignments.length === 0}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
          >
            <Ico name="navigation" size={16} color="#fff" />
            Push route to driver phone{pendingAssignments.length > 0 ? ` (${pendingAssignments.length})` : ''}
          </Btn>
        </div>
      </div>
    </>
  );
}
