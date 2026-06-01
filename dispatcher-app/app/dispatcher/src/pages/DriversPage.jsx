import { useState } from 'react';
import { D_TOK, STATUS_TONE } from '../tokens.js';
import { Pill, Btn, Avatar, Mono, Progress } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { createDriver, updateDriver } from '../api.js';

function stockColor(pct) {
  if (pct > 50) return D_TOK.good;
  if (pct >= 25) return D_TOK.warn;
  return D_TOK.bad;
}

const STATUS_OPTIONS = ['idle', 'on-route', 'late', 'break', 'depot'];

const FIELD = {
  label: { fontSize: 11, fontWeight: 700, color: D_TOK.ink2, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', padding: '8px 10px', border: `1px solid ${D_TOK.line}`, borderRadius: 8,
    fontSize: 13, color: D_TOK.ink, fontFamily: 'Inter, sans-serif', outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  },
};

function DriverFormDrawer({ driver, onClose, onSaved, isMobile }) {
  const isNew = !driver?.driverId;
  const [form, setForm] = useState({
    driverId: driver?.driverId ?? '',
    name:     driver?.name    ?? '',
    van:      driver?.van     ?? '',
    shift:    driver?.shift   ?? '07:00–16:00',
    status:   driver?.status  ?? 'idle',
    route:    driver?.route   ?? '',
    phone:    driver?.phone   ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.van.trim())  { setError('Van is required');  return; }
    if (isNew && !form.driverId.trim()) { setError('Driver ID is required'); return; }

    setSaving(true);
    setError(null);
    try {
      const initials = form.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
      if (isNew) {
        await createDriver({
          driverId:  form.driverId.trim().toUpperCase(),
          name:      form.name.trim(),
          initials,
          van:       form.van.trim(),
          shift:     form.shift.trim(),
          status:    form.status,
          route:     form.route.trim() || null,
          phone:     form.phone.trim() || null,
          lat:       24.7741,
          lng:       46.7384,
          stockPct:  100,
          stops:     0,
          done:      0,
          sales:     0,
          lastPing:  'Now',
        });
      } else {
        await updateDriver(driver.driverId, {
          name:    form.name.trim(),
          initials,
          van:     form.van.trim(),
          shift:   form.shift.trim(),
          status:  form.status,
          route:   form.route.trim() || null,
          phone:   form.phone.trim() || null,
        });
      }
      await onSaved();
      onClose();
    } catch (e) {
      setError(e.message || 'Save failed. Please try again.');
      setSaving(false);
    }
  };

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
        width: isMobile ? '100%' : 420,
        background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(11,18,32,0.12)',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 12px', borderBottom: `1px solid ${D_TOK.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: D_TOK.ink }}>
              {isNew ? 'Add Driver' : `Edit Driver`}
            </div>
            {!isNew && (
              <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{driver.driverId}</Mono>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: D_TOK.mute, padding: 4,
          }}>
            <Ico name="x" size={18} color="currentColor" />
          </button>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {isNew && (
              <div>
                <label style={FIELD.label}>Driver ID</label>
                <input
                  value={form.driverId}
                  onChange={e => set('driverId', e.target.value)}
                  placeholder="e.g. D010"
                  style={FIELD.input}
                />
              </div>
            )}

            <div>
              <label style={FIELD.label}>Full Name</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Ahmed Al-Rashidi"
                style={FIELD.input}
              />
            </div>

            <div>
              <label style={FIELD.label}>Van / Plate</label>
              <input
                value={form.van}
                onChange={e => set('van', e.target.value)}
                placeholder="e.g. V-010"
                style={FIELD.input}
              />
            </div>

            <div>
              <label style={FIELD.label}>Shift</label>
              <input
                value={form.shift}
                onChange={e => set('shift', e.target.value)}
                placeholder="e.g. 07:00–16:00"
                style={FIELD.input}
              />
            </div>

            <div>
              <label style={FIELD.label}>Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                style={{ ...FIELD.input, cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_TONE[s]?.label ?? s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={FIELD.label}>Route (optional)</label>
              <input
                value={form.route}
                onChange={e => set('route', e.target.value)}
                placeholder="e.g. R-North-A"
                style={FIELD.input}
              />
            </div>

            <div>
              <label style={FIELD.label}>Phone (optional)</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="e.g. +966 50 000 0000"
                style={FIELD.input}
              />
            </div>

            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8, background: '#FEE2E2',
                color: D_TOK.bad, fontSize: 12, fontWeight: 600,
              }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${D_TOK.line}`, display: 'flex', gap: 8 }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, justifyContent: 'center', padding: '10px', fontSize: 14 }}
          >
            {saving ? 'Saving…' : isNew ? 'Add Driver' : 'Save Changes'}
          </Btn>
        </div>
      </div>
    </>
  );
}

export default function DriversPage({ drivers, onReload }) {
  const [search,     setSearch]     = useState('');
  const [formDriver, setFormDriver] = useState(null);
  const { isMobile } = useBreakpoint();

  const filtered = drivers.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.driverId.toLowerCase().includes(search.toLowerCase()) ||
    d.van.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isMobile ? 12 : 24, background: D_TOK.sand }}>
      {/* Page header */}
      <div style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: isMobile ? 10 : 0, marginBottom: 16,
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: D_TOK.ink, margin: 0 }}>Fleet Drivers</h2>
          <p style={{ fontSize: 13, color: D_TOK.mute, marginTop: 2 }}>{drivers.length} drivers · Riyadh-North Depot</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
            background: '#fff', border: `1px solid ${D_TOK.line}`, borderRadius: 8,
            flex: isMobile ? 1 : undefined,
          }}>
            <Ico name="search" size={14} color={D_TOK.mute} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search drivers…"
              style={{ border: 'none', outline: 'none', fontSize: 13, color: D_TOK.ink, fontFamily: 'Inter, sans-serif', width: isMobile ? '100%' : 180 }}
            />
          </div>
          {!isMobile && (
            <button
              onClick={() => setFormDriver({})}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: D_TOK.accent, color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Ico name="plus" size={14} color="#fff" /> Add Driver
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 12,
        border: `1px solid ${D_TOK.line}`, overflow: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: D_TOK.sand, position: 'sticky', top: 0 }}>
              {['Driver', 'VAN · Route', 'Status', 'Shift', 'Stops', 'Stock %', 'Sales (SAR)', 'Last Ping', ''].map(h => (
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
            {filtered.map((d, i) => {
              const tone = STATUS_TONE[d.status] ?? STATUS_TONE.idle;
              return (
                <tr key={d.driverId} style={{
                  borderBottom: i < filtered.length - 1 ? `1px solid ${D_TOK.line}` : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = D_TOK.sand}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={d.initials} status={d.status} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, color: D_TOK.ink }}>{d.name}</div>
                        <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{d.driverId}</Mono>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.ink2 }}>{d.van}</Mono>
                    {d.route && <Mono style={{ fontSize: 11, color: D_TOK.mute, display: 'block' }}>{d.route}</Mono>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Pill label={tone.label} bg={tone.bg} color={tone.text} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.ink2 }}>{d.shift}</Mono>
                  </td>
                  <td style={{ padding: '12px 14px', minWidth: 100 }}>
                    {d.stops > 0 ? (
                      <>
                        <div style={{ fontSize: 12, color: D_TOK.ink2, marginBottom: 4 }}>{d.done}/{d.stops}</div>
                        <Progress done={d.done} total={d.stops} style={{ width: 80 }} />
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: D_TOK.mute }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 13, fontWeight: 700, color: stockColor(d.stockPct) }}>{d.stockPct}%</Mono>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 13, fontWeight: 600, color: D_TOK.ink }}>
                      {Number(d.sales).toLocaleString('en-SA', { minimumFractionDigits: 2 })}
                    </Mono>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Mono style={{ fontSize: 12, color: D_TOK.mute }}>{d.lastPing}</Mono>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => setFormDriver(d)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: `1px solid ${D_TOK.line}`,
                        background: '#fff', fontSize: 12, fontWeight: 600, color: D_TOK.ink2, cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formDriver !== null && (
        <DriverFormDrawer
          driver={Object.keys(formDriver).length === 0 ? null : formDriver}
          onClose={() => setFormDriver(null)}
          onSaved={onReload}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
