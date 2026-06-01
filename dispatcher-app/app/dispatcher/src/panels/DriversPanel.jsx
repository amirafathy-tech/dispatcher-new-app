import { useState } from 'react';
import { D_TOK, STATUS_TONE } from '../tokens.js';
import { Pill, Avatar, Progress, Mono } from '../shell/atoms.jsx';

function stockColor(pct) {
  if (pct > 50) return D_TOK.good;
  if (pct >= 25) return D_TOK.warn;
  return D_TOK.bad;
}

function DriverCard({ driver, isSelected, isDragOver, pendingCount, isTracked, onSelect, onDragOver, onDragLeave, onDrop }) {
  const tone = STATUS_TONE[driver.status] ?? STATUS_TONE.idle;
  const fresh = pingFreshness(driver.lastPing);
  const freshColor = FRESH_COLOR[fresh];
  return (
    <div
      onClick={() => onSelect(driver.driverId)}
      onDragOver={e => { e.preventDefault(); onDragOver(driver.driverId); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(driver.driverId); }}
      style={{
        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
        background: isDragOver ? '#E4EEFA' : isSelected ? D_TOK.sand : '#fff',
        border: `1.5px solid ${isDragOver ? D_TOK.accent : isTracked ? '#86EFAC' : isSelected ? D_TOK.ink2 : D_TOK.line}`,
        transition: 'all 0.2s', marginBottom: 6,
        boxShadow: isTracked ? '0 0 0 2px #BBF7D0' : 'none',
      }}
    >
      {/* Row 1: Avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Avatar initials={driver.initials} status={driver.status} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {driver.name}
          </div>
          <Pill label={tone.label} bg={tone.bg} color={tone.text} style={{ marginTop: 2 }} />
        </div>
      </div>

      {/* Row 2: VAN · route · ping */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{driver.van}</Mono>
        {driver.route && <><span style={{ color: D_TOK.line, fontSize: 11 }}>·</span>
          <Mono style={{ fontSize: 11, color: D_TOK.mute }}>{driver.route}</Mono></>}
        <span style={{ color: D_TOK.line, fontSize: 11 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: freshColor, display: 'inline-block', flexShrink: 0 }} />
          <Mono style={{ fontSize: 11, color: freshColor, fontWeight: fresh === 'fresh' ? 700 : 400 }}>{driver.lastPing}</Mono>
        </span>
      </div>

      {/* Progress */}
      {driver.stops > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: D_TOK.mute }}>Stops</span>
            <Mono style={{ fontSize: 11, color: D_TOK.ink2 }}>{driver.done}/{driver.stops}</Mono>
          </div>
          <Progress done={driver.done} total={driver.stops} />
        </div>
      )}

      {/* Stock % */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: D_TOK.mute }}>Stock</span>
        <Mono style={{ fontSize: 12, fontWeight: 700, color: stockColor(driver.stockPct) }}>
          {driver.stockPct}%
        </Mono>
      </div>

      {/* Pending push badge */}
      {pendingCount > 0 && (
        <div style={{
          marginTop: 6, fontSize: 11, fontWeight: 600, color: D_TOK.accent,
          background: D_TOK.accentBg, borderRadius: 6, padding: '3px 8px',
        }}>
          + {pendingCount} new order{pendingCount > 1 ? 's' : ''} pending push
        </div>
      )}

      {isDragOver && (
        <div style={{
          marginTop: 6, fontSize: 11, fontWeight: 600, color: D_TOK.accent,
          textAlign: 'center',
        }}>
          Drop to assign
        </div>
      )}
    </div>
  );
}

const FILTERS = ['All', 'Active', 'Available'];

function pingFreshness(lastPing) {
  if (!lastPing || lastPing === 'now') return 'fresh';
  const match = lastPing.match(/^(\d{2}):(\d{2})$/);
  if (!match) return 'fresh';
  const now = new Date();
  const pingDate = new Date();
  pingDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
  const diffMin = (now - pingDate) / 60000;
  if (diffMin < 2) return 'fresh';
  if (diffMin < 10) return 'recent';
  return 'stale';
}

const FRESH_COLOR = { fresh: '#16A34A', recent: '#D97706', stale: '#9CA3AF' };

export default function DriversPanel({
  drivers, selectedDriverId, draggingOrderId, dragOverDriverId,
  pendingMap, onSelectDriver, onDragOver, onDragLeave, onDrop, onToast,
  isMobile, isTablet, trackedIds,
}) {
  const [filter, setFilter] = useState('All');

  const filtered = drivers.filter(d => {
    if (filter === 'Active') return ['on-route', 'late', 'break'].includes(d.status);
    if (filter === 'Available') return ['idle', 'break'].includes(d.status);
    return true;
  });

  const counts = {
    All: drivers.length,
    Active: drivers.filter(d => ['on-route', 'late', 'break'].includes(d.status)).length,
    Available: drivers.filter(d => ['idle', 'break'].includes(d.status)).length,
  };

  const panelWidth = isMobile ? '100%' : isTablet ? 260 : 360;
  const panelMinWidth = isMobile ? undefined : isTablet ? 220 : 360;

  return (
    <div style={{
      width: panelWidth,
      ...(panelMinWidth != null ? { minWidth: panelMinWidth } : {}),
      height: '100%', background: D_TOK.sand,
      borderRight: `1px solid ${D_TOK.line}`, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${D_TOK.line}` }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink }}>
            Fleet · Drivers · {drivers.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: filter === f ? D_TOK.ink : 'transparent',
                color: filter === f ? '#fff' : D_TOK.mute,
              }}
            >
              {f} {counts[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Drop hint */}
      {draggingOrderId && (
        <div style={{
          margin: '8px 12px 0', padding: '6px 10px', borderRadius: 8,
          background: D_TOK.accentBg, border: `1px dashed ${D_TOK.accent}`,
          fontSize: 12, color: D_TOK.accent, fontWeight: 600, textAlign: 'center',
        }}>
          Drop on a driver to assign
        </div>
      )}

      {/* Driver list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {filtered.map(d => (
          <DriverCard
            key={d.driverId}
            driver={d}
            isSelected={d.driverId === selectedDriverId}
            isDragOver={d.driverId === dragOverDriverId}
            isTracked={trackedIds?.has(d.driverId) ?? false}
            pendingCount={pendingMap[d.driverId] || 0}
            onSelect={onSelectDriver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  );
}
