import { useState, useEffect } from 'react';
import { D_TOK, STATUS_TONE, PRI_TONE } from '../tokens.js';

const W = 600, H = 540;

function toSvg(lat, lng) {
  return { x: lat * W, y: lng * H };
}

function DriverPin({ driver, isSelected, onClick }) {
  const { x, y } = toSvg(driver.lat, driver.lng);
  const tone = STATUS_TONE[driver.status] ?? STATUS_TONE.idle;
  return (
    // key on parent is set by caller — re-mount triggers pinPop animation
    <g onClick={() => onClick(driver.driverId)} style={{ cursor: 'pointer' }}>
      {isSelected && (
        <circle cx={x} cy={y} r={22} fill="none" stroke={D_TOK.accent} strokeWidth={2} opacity={0.5}>
          <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Pill background */}
      <rect x={x - 34} y={y - 14} width={68} height={28} rx={14} fill={D_TOK.ink}
        style={{ animation: 'pinPop 0.35s ease' }} />
      {/* Initials circle */}
      <circle cx={x - 20} cy={y} r={10} fill="#fff" opacity={0.15} />
      <text x={x - 20} y={y + 4} textAnchor="middle" fontSize={9} fontWeight="700" fill="#fff"
        fontFamily="Inter, sans-serif">
        {driver.initials}
      </text>
      {/* VAN text */}
      <text x={x + 2} y={y + 4} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)"
        fontFamily="JetBrains Mono, monospace">
        {driver.van.replace('VAN-', '')}
      </text>
      {/* Status dot */}
      <circle cx={x + 26} cy={y} r={5} fill={tone.dot} />
      {/* Speed trail — small line showing recent movement direction */}
      {driver._dx !== undefined && (
        <line
          x1={x - driver._dx * 20} y1={y - driver._dy * 20}
          x2={x} y2={y}
          stroke={tone.dot} strokeWidth={1.5} strokeDasharray="2 2" opacity={0.4}
        />
      )}
    </g>
  );
}

function OrderPin({ order, isAssigned, onClick }) {
  const { x, y } = toSvg(order.lat, order.lng);
  const bg = isAssigned ? D_TOK.accent : '#fff';
  const textColor = isAssigned ? '#fff' : D_TOK.ink;
  const priTone = PRI_TONE[order.priority] ?? PRI_TONE['P-C'];
  return (
    <g onClick={() => onClick(order.orderId)} style={{ cursor: 'pointer' }}>
      <rect x={x - 38} y={y - 24} width={76} height={32} rx={6}
        fill={bg} stroke={isAssigned ? D_TOK.accent : D_TOK.line} strokeWidth={1} />
      <text x={x} y={y - 10} textAnchor="middle" fontSize={9} fontWeight="600" fill={textColor}
        fontFamily="Inter, sans-serif">
        {order.orderId}
      </text>
      <text x={x} y={y + 2} textAnchor="middle" fontSize={8} fill={isAssigned ? 'rgba(255,255,255,0.8)' : D_TOK.mute}
        fontFamily="JetBrains Mono, monospace">
        {Number(order.value).toFixed(0)} SAR
      </text>
      <polygon
        points={`${x},${y + 14} ${x - 5},${y + 8} ${x + 5},${y + 8}`}
        fill={bg} stroke={isAssigned ? D_TOK.accent : D_TOK.line} strokeWidth={1}
      />
      <circle cx={x + 34} cy={y - 20} r={4} fill={priTone.bg} stroke={priTone.text} strokeWidth={1} />
    </g>
  );
}

function AssignmentLine({ driver, order }) {
  const from = toSvg(driver.lat, driver.lng);
  const to   = toSvg(order.lat, order.lng);
  return (
    <line
      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
      stroke={D_TOK.accent} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6}
    />
  );
}

const LEGEND = [
  { dot: '#16A34A', label: 'On Route' },
  { dot: '#DC2626', label: 'Late' },
  { dot: '#D97706', label: 'On Break' },
  { dot: '#9CA3AF', label: 'Customer open' },
];

function LiveOverlay({ isTracking, lastTrackTs, onToggle }) {
  const [age, setAge] = useState(0);

  useEffect(() => {
    if (!lastTrackTs) return;
    const tick = () => setAge(Math.floor((Date.now() - lastTrackTs) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastTrackTs]);

  return (
    <div style={{
      position: 'absolute', top: 16, left: 16,
      background: 'rgba(255,255,255,0.94)', borderRadius: 10,
      padding: '8px 12px', border: `1px solid ${D_TOK.line}`,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <span style={{
        width: 9, height: 9, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
        background: isTracking ? '#16A34A' : '#9CA3AF',
        animation: isTracking ? 'livePulse 2s infinite' : 'none',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, color: isTracking ? '#15803D' : D_TOK.mute,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {isTracking ? 'Live Tracking' : 'Tracking Paused'}
        </span>
        {lastTrackTs && (
          <span style={{ fontSize: 10, color: D_TOK.mute }}>
            {age < 2 ? 'Updated just now' : `Updated ${age}s ago`}
          </span>
        )}
        {!lastTrackTs && isTracking && (
          <span style={{ fontSize: 10, color: D_TOK.mute }}>Waiting for first tick…</span>
        )}
      </div>
      <button
        onClick={onToggle}
        title={isTracking ? 'Pause tracking' : 'Resume tracking'}
        style={{
          background: isTracking ? '#F0FDF4' : D_TOK.sand,
          border: `1px solid ${isTracking ? '#BBF7D0' : D_TOK.line}`,
          borderRadius: 6, cursor: 'pointer', padding: '3px 8px',
          fontSize: 12, color: isTracking ? '#15803D' : D_TOK.mute,
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        {isTracking ? '⏸ Pause' : '▶ Resume'}
      </button>
    </div>
  );
}

export default function MapPanel({
  drivers, orders, assignments, selectedDriverId,
  onSelectDriver, onSelectOrder,
  isTracking, lastTrackTs, onToggleTracking,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });

  const assignedOrderIds = new Set(assignments.map(a => a.orderId));
  const visibleDrivers = drivers.filter(d => ['on-route', 'late', 'break'].includes(d.status));

  function handleZoom(dir) {
    if (dir === 'reset') { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    setZoom(z => Math.min(3, Math.max(0.5, z + (dir === '+' ? 0.25 : -0.25))));
  }

  return (
    <div style={{
      flex: 1, minWidth: 0, height: '100%', background: '#F0EDE8', position: 'relative',
      overflow: 'hidden',
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, transformOrigin: 'center', transition: 'transform 0.2s' }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E3E0D8" strokeWidth="0.8" />
          </pattern>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#D9D5CE" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Hatched zones */}
        <rect x={20}  y={30}  width={220} height={160} rx={6} fill="url(#hatch)" opacity={0.35} />
        <rect x={360} y={300} width={200} height={160} rx={6} fill="url(#hatch)" opacity={0.35} />

        {/* Roads */}
        <path d="M 80 480 Q 200 300 480 80" stroke="#fff" strokeWidth={8} fill="none" />
        <path d="M 80 480 Q 200 300 480 80" stroke="#D9D5CE" strokeWidth={1.5} fill="none" strokeDasharray="8 5" />
        <path d="M 380 50 L 540 380" stroke="#fff" strokeWidth={6} fill="none" />
        <path d="M 380 50 L 540 380" stroke="#D9D5CE" strokeWidth={1.5} fill="none" strokeDasharray="8 5" />
        <path d="M 40 180 L 200 450" stroke="#fff" strokeWidth={6} fill="none" />
        <path d="M 40 180 L 200 450" stroke="#D9D5CE" strokeWidth={1.5} fill="none" strokeDasharray="8 5" />

        {/* Depot */}
        <rect x={20} y={475} width={32} height={32} rx={4} fill={D_TOK.ink} />
        <text x={36} y={496} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff"
          fontFamily="Inter, sans-serif">DC</text>

        {/* Assignment lines */}
        {assignments.map(a => {
          const driver = drivers.find(d => d.driverId === a.driverId);
          const order  = orders.find(o => o.orderId  === a.orderId);
          if (!driver || !order) return null;
          return <AssignmentLine key={a.assignmentId} driver={driver} order={order} />;
        })}

        {/* Order pins */}
        {orders.map(o => (
          <OrderPin
            key={o.orderId}
            order={o}
            isAssigned={assignedOrderIds.has(o.orderId)}
            onClick={onSelectOrder}
          />
        ))}

        {/* Driver pins — key includes position hash so React re-mounts on movement, triggering pinPop */}
        {visibleDrivers.map(d => (
          <DriverPin
            key={`${d.driverId}-${Math.round(d.lat * 500)}-${Math.round(d.lng * 500)}`}
            driver={d}
            isSelected={d.driverId === selectedDriverId}
            onClick={onSelectDriver}
          />
        ))}
      </svg>

      {/* Live tracking overlay */}
      <LiveOverlay
        isTracking={isTracking}
        lastTrackTs={lastTrackTs}
        onToggle={onToggleTracking}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '8px 12px',
        border: `1px solid ${D_TOK.line}`, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: D_TOK.ink2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot, display: 'inline-block' }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[{ sym: '+', dir: '+' }, { sym: '−', dir: '-' }, { sym: '⊙', dir: 'reset' }].map(({ sym, dir }) => (
          <button key={sym} onClick={() => handleZoom(dir)} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${D_TOK.line}`,
            background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            color: D_TOK.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {sym}
          </button>
        ))}
        {zoom !== 1 && (
          <div style={{ fontSize: 10, textAlign: 'center', color: D_TOK.mute, fontWeight: 600 }}>
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}
