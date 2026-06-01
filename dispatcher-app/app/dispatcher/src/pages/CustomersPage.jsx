import { useMemo, useState } from 'react';
import { D_TOK, PRI_TONE } from '../tokens.js';
import { Mono, Mini } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

function CustomerOrdersDrawer({ customer, onClose, isMobile }) {
  if (!customer) return null;
  const avgKm = customer.orders.reduce((s, o) => s + Number(o.km), 0) / customer.orders.length;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.3)',
          zIndex: 200, animation: 'fadeIn 0.2s ease',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : 480,
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
            width: 36, height: 36, borderRadius: 8, background: D_TOK.accentBg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ico name="users" size={18} color={D_TOK.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: D_TOK.ink }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: D_TOK.mute }}>{customer.city}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: D_TOK.mute, padding: 4,
          }}>
            <Ico name="x" size={18} color="currentColor" />
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${D_TOK.line}` }}>
          <Mini label="Orders Today" value={customer.orders.length} />
          <Mini label="Total Value" value={`SAR ${customer.totalValue.toLocaleString('en-SA', { minimumFractionDigits: 0 })}`} />
          <Mini label="Avg Distance" value={`${avgKm.toFixed(1)} km`} />
        </div>

        {/* Orders list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: D_TOK.ink2, marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Today's Orders
          </div>
          {customer.orders.map(o => {
            const priTone = PRI_TONE[o.priority] ?? PRI_TONE['P-C'];
            return (
              <div key={o.orderId} style={{
                border: `1px solid ${D_TOK.line}`, borderRadius: 10,
                padding: '12px', marginBottom: 8, background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Mono style={{ fontSize: 12, fontWeight: 700, color: D_TOK.ink }}>{o.orderId}</Mono>
                  <span style={{
                    padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                    background: priTone.bg, color: priTone.text,
                  }}>
                    {o.priority}
                  </span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                    color: o.status === 'assigned' ? D_TOK.good : D_TOK.mute,
                    textTransform: 'capitalize',
                  }}>
                    {o.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: D_TOK.mute }}>Window: {o.window}</span>
                  <Mono style={{ fontWeight: 700, color: D_TOK.ink }}>SAR {Number(o.value).toFixed(2)}</Mono>
                </div>
                <div style={{ fontSize: 11, color: D_TOK.mute, marginTop: 4 }}>
                  {Number(o.km).toFixed(1)} km · {o.items} item{o.items !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function CustomersPage({ orders }) {
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const { isMobile } = useBreakpoint();

  const customers = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!map[o.customer]) {
        map[o.customer] = { name: o.customer, city: o.city, orders: [], totalValue: 0 };
      }
      map[o.customer].orders.push(o);
      map[o.customer].totalValue += Number(o.value);
    });
    return Object.values(map).sort((a, b) => b.totalValue - a.totalValue);
  }, [orders]);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isMobile ? 12 : 24, background: D_TOK.sand }}>
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: isMobile ? 10 : 0, marginBottom: 16,
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: D_TOK.ink, margin: 0 }}>Customers</h2>
          <p style={{ fontSize: 13, color: D_TOK.mute, marginTop: 2 }}>{customers.length} active customers · Riyadh area</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
          background: '#fff', border: `1px solid ${D_TOK.line}`, borderRadius: 8,
          width: isMobile ? '100%' : undefined,
        }}>
          <Ico name="search" size={14} color={D_TOK.mute} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search customers…"
            style={{ border: 'none', outline: 'none', fontSize: 13, color: D_TOK.ink, fontFamily: 'Inter, sans-serif', width: isMobile ? '100%' : 200 }}
          />
        </div>
      </div>

      <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: D_TOK.sand, position: 'sticky', top: 0 }}>
              {['Customer', 'City', 'Orders Today', 'Priorities', 'Total Value (SAR)', 'Avg Distance', ''].map(h => (
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
            {filtered.map((c, i) => {
              const avgKm = c.orders.reduce((s, o) => s + Number(o.km), 0) / c.orders.length;
              const priorities = [...new Set(c.orders.map(o => o.priority))].sort();
              return (
                <tr key={c.name}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${D_TOK.line}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = D_TOK.sand}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: D_TOK.ink }}>{c.name}</td>
                  <td style={{ padding: '12px 14px', color: D_TOK.ink2 }}>{c.city}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%', background: D_TOK.accentBg,
                      color: D_TOK.accent, fontWeight: 700, fontSize: 12,
                    }}>
                      {c.orders.length}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {priorities.map(p => {
                        const t = PRI_TONE[p];
                        return <span key={p} style={{
                          padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                          background: t.bg, color: t.text,
                        }}>{p}</span>;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontWeight: 700, fontSize: 13, color: D_TOK.ink }}>
                      {c.totalValue.toLocaleString('en-SA', { minimumFractionDigits: 2 })}
                    </Mono>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.ink2 }}>{avgKm.toFixed(1)} km</Mono>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => setViewCustomer(c)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: `1px solid ${D_TOK.line}`,
                        background: '#fff', fontSize: 12, fontWeight: 600, color: D_TOK.ink2,
                        cursor: 'pointer',
                      }}
                    >
                      View Orders
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CustomerOrdersDrawer
        customer={viewCustomer}
        onClose={() => setViewCustomer(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
