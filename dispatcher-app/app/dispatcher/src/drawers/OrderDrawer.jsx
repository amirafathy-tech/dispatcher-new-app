import { useEffect, useState } from 'react';
import { D_TOK, PRI_TONE, STATUS_TONE } from '../tokens.js';
import { Pill, Btn, Mini, Avatar, Mono, Divider } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';
import { fetchOrderItems } from '../api.js';

export default function OrderDrawer({
  order, assignment, drivers, onClose, onAssign, onUnassign, isMobile,
}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!order) return;
    setItems([]);
    fetchOrderItems(order.orderId)
      .then(setItems)
      .catch(() => setItems([]));
  }, [order?.orderId]);

  if (!order) return null;

  const priTone = PRI_TONE[order.priority] ?? PRI_TONE['P-C'];
  const assignedDriver = assignment ? drivers.find(d => d.driverId === assignment.driverId) : null;
  const availableDrivers = drivers
    .filter(d => ['on-route', 'idle', 'break'].includes(d.status))
    .slice(0, 4);

  const total = items.reduce((s, i) => s + Number(i.lineTotal || 0), 0) || Number(order.value);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.3)',
        zIndex: 200, animation: 'fadeIn 0.2s ease',
      }} />

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
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: D_TOK.accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Ico name="cart" size={18} color={D_TOK.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: D_TOK.ink }}>{order.customer}</div>
            <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{order.orderId}</Mono>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: D_TOK.mute, padding: 4,
          }}>
            <Ico name="x" size={18} color="currentColor" />
          </button>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${D_TOK.line}` }}>
          <Mini label="Priority" value={
            <Pill label={order.priority} bg={priTone.bg} color={priTone.text} />
          } />
          <Mini label="Window" value={order.window} />
          <Mini label="Distance" value={`${Number(order.km).toFixed(1)} km`} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {/* Line items */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Line Items
            </div>
            <div style={{ border: `1px solid ${D_TOK.line}`, borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: D_TOK.sand }}>
                    {['SKU', 'Name', 'Qty', 'Total'].map(h => (
                      <th key={h} style={{
                        padding: '6px 10px', textAlign: 'left', fontSize: 11,
                        color: D_TOK.mute, fontWeight: 600, borderBottom: `1px solid ${D_TOK.line}`,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${D_TOK.line}` : 'none' }}>
                      <td style={{ padding: '7px 10px' }}>
                        <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{item.sku}</Mono>
                      </td>
                      <td style={{ padding: '7px 10px', color: D_TOK.ink }}>{item.name}</td>
                      <td style={{ padding: '7px 10px', color: D_TOK.ink2 }}>{item.qty}</td>
                      <td style={{ padding: '7px 10px' }}>
                        <Mono style={{ fontWeight: 600, color: D_TOK.ink }}>
                          {Number(item.lineTotal).toFixed(2)}
                        </Mono>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px 10px', color: D_TOK.mute, textAlign: 'center' }}>
                        {order.items} items — no detail loaded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', borderRadius: '0 0 8px 8px', background: D_TOK.sand,
              marginTop: 2, border: `1px solid ${D_TOK.line}`, borderTop: 'none',
            }}>
              <span style={{ fontSize: 12, color: D_TOK.mute }}>{order.items} items total</span>
              <Mono style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink }}>
                SAR {total.toFixed(2)}
              </Mono>
            </div>
          </div>

          <Divider style={{ marginBottom: 16 }} />

          {/* Assign section */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {assignment ? 'Assigned Driver' : 'Assign to Driver'}
            </div>

            {assignedDriver ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                border: `1.5px solid ${D_TOK.good}`, borderRadius: 10, background: '#F0FDF4',
              }}>
                <Avatar initials={assignedDriver.initials} status={assignedDriver.status} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>{assignedDriver.name}</div>
                  <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{assignedDriver.van} · {assignedDriver.route}</Mono>
                </div>
                <Btn size="sm" variant="danger" onClick={() => onUnassign(assignment.assignmentId)}>
                  Unassign
                </Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {availableDrivers.map(d => {
                  const tone = STATUS_TONE[d.status] ?? STATUS_TONE.idle;
                  return (
                    <div
                      key={d.driverId}
                      onClick={() => onAssign(order.orderId, d.driverId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        border: `1.5px solid ${D_TOK.line}`, borderRadius: 10,
                        cursor: 'pointer', background: '#fff', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = D_TOK.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = D_TOK.line}
                    >
                      <Avatar initials={d.initials} status={d.status} size={30} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: D_TOK.ink }}>{d.name}</div>
                        <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{d.van}</Mono>
                      </div>
                      <Pill label={tone.label} bg={tone.bg} color={tone.text} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
