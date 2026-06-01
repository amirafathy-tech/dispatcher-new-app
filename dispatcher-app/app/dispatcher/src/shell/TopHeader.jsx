import { useMemo } from 'react';
import { D_TOK } from '../tokens.js';
import { KPI, Mono } from './atoms.jsx';
import Ico from './Ico.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

function fmtRevenue(n) {
  return `SAR ${Number(n).toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function TopHeader({ drivers, orders, assignmentMap, search, onSearch, isTracking, onToggleTracking }) {
  const { isMobile } = useBreakpoint();

  const kpis = useMemo(() => ({
    onRoute:    drivers.filter(d => d.status === 'on-route').length,
    idle:       drivers.filter(d => d.status === 'idle').length,
    late:       drivers.filter(d => d.status === 'late').length,
    unassigned: orders.filter(o => !(assignmentMap[o.orderId]?.length)).length,
    revenue:    drivers.reduce((s, d) => s + Number(d.sales || 0), 0),
  }), [drivers, orders, assignmentMap]);

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-SA', { weekday: undefined, day: 'numeric', month: 'long', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' AST';
  }, []);

  const trackingBtn = (
    <button
      onClick={onToggleTracking}
      title={isTracking ? 'Pause live tracking' : 'Resume live tracking'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 8, flexShrink: 0,
        border: `1px solid ${isTracking ? '#BBF7D0' : D_TOK.line}`,
        background: isTracking ? '#F0FDF4' : '#fff',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
        background: isTracking ? '#16A34A' : '#9CA3AF',
        animation: isTracking ? 'livePulse 2s infinite' : 'none',
      }} />
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        color: isTracking ? '#15803D' : D_TOK.mute,
        textTransform: 'uppercase',
      }}>
        {isTracking ? 'Live' : 'Paused'}
      </span>
    </button>
  );

  const searchBox = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: D_TOK.sand, borderRadius: 8, padding: '6px 10px',
      border: `1px solid ${D_TOK.line}`, flex: isMobile ? 1 : undefined,
      width: isMobile ? undefined : 220,
    }}>
      <Ico name="search" size={14} color={D_TOK.mute} />
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder={isMobile ? 'Search…' : 'Search drivers, orders…'}
        style={{
          flex: 1, border: 'none', background: 'transparent', fontSize: 12,
          color: D_TOK.ink, outline: 'none', fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
  );

  const bellBtn = (
    <button style={{
      position: 'relative', background: 'transparent', border: 'none',
      cursor: 'pointer', padding: 8, borderRadius: 8, color: D_TOK.ink2, flexShrink: 0,
    }}>
      <Ico name="bell" size={18} color="currentColor" />
      <span style={{
        position: 'absolute', top: 6, right: 6, width: 8, height: 8,
        borderRadius: '50%', background: D_TOK.bad, border: '1.5px solid #fff',
      }} />
    </button>
  );

  if (isMobile) {
    return (
      <div style={{
        background: '#fff', borderBottom: `1px solid ${D_TOK.line}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        padding: '8px 12px', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>Riyadh-North Depot</div>
            <Mono style={{ fontSize: 10, color: D_TOK.mute }}>{now}</Mono>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {trackingBtn}
            {bellBtn}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>{searchBox}</div>
      </div>
    );
  }

  return (
    <div style={{
      height: 60, background: '#fff', borderBottom: `1px solid ${D_TOK.line}`,
      display: 'flex', alignItems: 'center', gap: 10, paddingInline: 16,
      flexShrink: 0,
    }}>
      {/* Depot + Date */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>Riyadh-North Depot</div>
        <Mono style={{ fontSize: 11, color: D_TOK.mute }}>Today, {now}</Mono>
      </div>

      <div style={{ width: 1, height: 32, background: D_TOK.line, marginInline: 2 }} />

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 8, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <KPI label="On Route"     value={kpis.onRoute}    dot="#16A34A" />
        <KPI label="Idle"         value={kpis.idle}        dot="#9CA3AF" />
        <KPI label="Late"         value={kpis.late}        dot="#DC2626" />
        <KPI label="Unassigned"   value={kpis.unassigned}  dot="#D97706" />
        <KPI label="Revenue Today" value={fmtRevenue(kpis.revenue)} large />
      </div>

      {/* Live tracking toggle */}
      {trackingBtn}

      {/* Search */}
      {searchBox}

      {/* Bell */}
      {bellBtn}
    </div>
  );
}
