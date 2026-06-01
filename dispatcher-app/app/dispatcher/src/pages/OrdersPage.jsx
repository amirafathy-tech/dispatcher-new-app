import { useState } from 'react';
import { D_TOK, PRI_TONE } from '../tokens.js';
import { Pill, Mono } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export default function OrdersPage({ orders, assignmentMap, drivers, onAssign }) {
  const [search, setSearch]       = useState('');
  const [priFilter, setPri]       = useState('All');
  const [statusFilter, setStatus] = useState('All');
  const { isMobile } = useBreakpoint();

  const filtered = orders.filter(o => {
    const isAssigned = !!(assignmentMap[o.orderId]?.length);
    if (priFilter !== 'All' && o.priority !== priFilter) return false;
    if (statusFilter === 'Open' && isAssigned) return false;
    if (statusFilter === 'Assigned' && !isAssigned) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.orderId.includes(search)) return false;
    return true;
  });

  const unassignedCount = orders.filter(o => !assignmentMap[o.orderId]?.length).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isMobile ? 12 : 24, background: D_TOK.sand }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between', gap: isMobile ? 10 : 0, marginBottom: isMobile ? 10 : 16,
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: D_TOK.ink, margin: 0 }}>Order Management</h2>
            <p style={{ fontSize: 13, color: D_TOK.mute, marginTop: 2 }}>
              {orders.length} orders · <span style={{ color: D_TOK.warn, fontWeight: 600 }}>{unassignedCount} unassigned</span>
            </p>
          </div>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
            background: '#fff', border: `1px solid ${D_TOK.line}`, borderRadius: 8,
            width: isMobile ? '100%' : undefined,
          }}>
            <Ico name="search" size={14} color={D_TOK.mute} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders, customers…"
              style={{ border: 'none', outline: 'none', fontSize: 13, color: D_TOK.ink, fontFamily: 'Inter, sans-serif', width: isMobile ? '100%' : 200 }}
            />
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: D_TOK.mute, fontWeight: 600, marginRight: 2 }}>Priority:</span>
          {['All', 'P-A', 'P-B', 'P-C'].map(f => (
            <button key={f} onClick={() => setPri(f)} style={{
              padding: '5px 10px', borderRadius: 7, border: `1px solid ${priFilter === f ? D_TOK.accent : D_TOK.line}`,
              background: priFilter === f ? D_TOK.accentBg : '#fff',
              color: priFilter === f ? D_TOK.accent : D_TOK.ink2,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {f}
            </button>
          ))}
          <span style={{ fontSize: 11, color: D_TOK.mute, fontWeight: 600, marginLeft: 6, marginRight: 2 }}>Status:</span>
          {['All', 'Open', 'Assigned'].map(f => (
            <button key={f} onClick={() => setStatus(f)} style={{
              padding: '5px 10px', borderRadius: 7, border: `1px solid ${statusFilter === f ? D_TOK.ink : D_TOK.line}`,
              background: statusFilter === f ? D_TOK.ink : '#fff',
              color: statusFilter === f ? '#fff' : D_TOK.ink2,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: D_TOK.sand, position: 'sticky', top: 0 }}>
              {['Order ID', 'Customer', 'City', 'Priority', 'Window', 'Distance', 'Value (SAR)', 'Items', 'Status', ''].map(h => (
                <th key={h} style={{
                  padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                  color: D_TOK.mute, textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: `1px solid ${D_TOK.line}`, whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const priTone = PRI_TONE[o.priority] ?? PRI_TONE['P-C'];
              const assignment = assignmentMap[o.orderId]?.[0];
              const isAssigned = !!assignment;
              const assignedDriver = isAssigned ? drivers.find(d => d.driverId === assignment.driverId) : null;
              return (
                <tr key={o.orderId}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${D_TOK.line}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = D_TOK.sand}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <Mono style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink }}>{o.orderId}</Mono>
                    <Mono style={{ fontSize: 11, color: D_TOK.mute, display: 'block' }}>{o.code}</Mono>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: D_TOK.ink }}>{o.customer}</td>
                  <td style={{ padding: '11px 14px', color: D_TOK.ink2 }}>{o.city}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Pill label={o.priority} bg={priTone.bg} color={priTone.text} />
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.ink2 }}>{o.window}</Mono>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.ink2 }}>{Number(o.km).toFixed(1)} km</Mono>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Mono style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>
                      {Number(o.value).toLocaleString('en-SA', { minimumFractionDigits: 2 })}
                    </Mono>
                  </td>
                  <td style={{ padding: '11px 14px', color: D_TOK.ink2 }}>{o.items}</td>
                  <td style={{ padding: '11px 14px' }}>
                    {isAssigned ? (
                      <span style={{ fontSize: 12, color: D_TOK.good, fontWeight: 600 }}>
                        ✓ {assignedDriver?.name ?? assignment.driverId}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: D_TOK.warn, fontWeight: 600 }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {!isAssigned && (
                      <button
                        onClick={() => onAssign && onAssign(o.orderId)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, border: `1px solid ${D_TOK.accent}`,
                          background: D_TOK.accentBg, color: D_TOK.accent,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
