import { useMemo } from 'react';
import { D_TOK, STATUS_TONE } from '../tokens.js';
import { Avatar, Mono } from '../shell/atoms.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`,
      padding: '16px 20px', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: D_TOK.mute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? D_TOK.ink, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: D_TOK.mute, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, max, color, sub }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, flexWrap: 'wrap', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: D_TOK.ink }}>{label}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {sub && <span style={{ fontSize: 12, color: D_TOK.mute }}>{sub}</span>}
          <Mono style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>
            SAR {Number(value).toLocaleString('en-SA', { minimumFractionDigits: 0 })}
          </Mono>
        </div>
      </div>
      <div style={{ height: 8, background: D_TOK.line, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color ?? D_TOK.accent,
          borderRadius: 4, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

export default function ReportsPage({ drivers, orders, assignments }) {
  const { isMobile } = useBreakpoint();

  const stats = useMemo(() => {
    const totalRevenue   = drivers.reduce((s, d) => s + Number(d.sales || 0), 0);
    const onRoute        = drivers.filter(d => d.status === 'on-route').length;
    const totalStops     = drivers.reduce((s, d) => s + d.stops, 0);
    const completedStops = drivers.reduce((s, d) => s + d.done, 0);
    const completionPct  = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
    const assigned       = assignments.length;
    const maxSales       = Math.max(...drivers.map(d => Number(d.sales)));

    const driverRows = [...drivers]
      .sort((a, b) => Number(b.sales) - Number(a.sales))
      .map(d => ({
        ...d,
        pendingCount: assignments.filter(a => a.driverId === d.driverId && a.status === 'assigned').length,
      }));

    return { totalRevenue, onRoute, completionPct, completedStops, totalStops, assigned, maxSales, driverRows };
  }, [drivers, orders, assignments]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isMobile ? 12 : 24, background: D_TOK.sand }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: D_TOK.ink, margin: 0 }}>Daily Reports</h2>
        <p style={{ fontSize: 13, color: D_TOK.mute, marginTop: 2 }}>Riyadh-North Depot · Today's performance</p>
      </div>

      {/* KPI row — wraps on small screens */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <KpiCard
          label="Total Revenue"
          value={`SAR ${stats.totalRevenue.toLocaleString('en-SA')}`}
          sub="All drivers combined"
          color={D_TOK.ink}
        />
        <KpiCard
          label="Route Completion"
          value={`${stats.completionPct}%`}
          sub={`${stats.completedStops} of ${stats.totalStops} stops done`}
          color={stats.completionPct >= 60 ? D_TOK.good : D_TOK.warn}
        />
        <KpiCard
          label="Assignments Made"
          value={stats.assigned}
          sub={`of ${orders.length} total orders`}
          color={D_TOK.accent}
        />
        <KpiCard
          label="Drivers Active"
          value={stats.onRoute}
          sub={`of ${drivers.length} total drivers`}
          color={D_TOK.good}
        />
      </div>

      {/* Revenue by driver */}
      <div style={{
        background: '#fff', borderRadius: 12, border: `1px solid ${D_TOK.line}`,
        padding: isMobile ? '14px 16px' : '20px 24px', flex: 1, overflow: 'auto',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink, marginBottom: 20 }}>
          Revenue by Driver · Today
        </div>
        {stats.driverRows.map(d => {
          const tone = STATUS_TONE[d.status] ?? STATUS_TONE.idle;
          const barColor = d.status === 'late' ? D_TOK.bad : d.status === 'depot' ? D_TOK.mute : D_TOK.accent;
          return (
            <div key={d.driverId} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Avatar initials={d.initials} status={d.status} size={32} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <BarRow
                  label={d.name}
                  value={d.sales}
                  max={stats.maxSales}
                  color={barColor}
                  sub={`${d.done}/${d.stops} stops · Stock ${d.stockPct}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
