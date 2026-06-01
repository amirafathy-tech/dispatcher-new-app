import { useState } from 'react';
import { D_TOK, PRI_TONE } from '../tokens.js';
import { Pill, Btn, Mono } from '../shell/atoms.jsx';
import Ico from '../shell/Ico.jsx';

const PRI_FILTERS = ['All', 'P-A', 'P-B', 'P-C'];

function OrderCard({ order, assignment, onDragStart, onDragEnd, onClick }) {
  const isAssigned = !!assignment;
  const priTone = PRI_TONE[order.priority] ?? PRI_TONE['P-C'];

  return (
    <div
      draggable={!isAssigned}
      onDragStart={!isAssigned ? () => onDragStart(order.orderId) : undefined}
      onDragEnd={!isAssigned ? onDragEnd : undefined}
      onClick={() => onClick(order.orderId)}
      style={{
        padding: '10px 12px', borderRadius: 10, marginBottom: 6,
        background: isAssigned ? D_TOK.sand : '#fff',
        border: `1.5px solid ${D_TOK.line}`,
        opacity: isAssigned ? 0.65 : 1,
        cursor: isAssigned ? 'pointer' : 'grab',
        transition: 'opacity 0.2s',
      }}
    >
      {/* Row 1: drag handle + customer + drag handle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {!isAssigned && (
          <div style={{ color: D_TOK.mute, marginTop: 1, cursor: 'grab', flexShrink: 0 }}>
            <Ico name="grip" size={14} color={D_TOK.mute} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink, marginBottom: 2 }}>
            {order.customer}
          </div>
          <div style={{ fontSize: 11, color: D_TOK.mute, marginBottom: 6 }}>
            <Mono>{order.orderId}</Mono> · {order.code} · {order.city}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <Pill label={order.priority} bg={priTone.bg} color={priTone.text} />
            <Pill label={order.window} bg={D_TOK.accentBg} color={D_TOK.accent} />
            <Mono style={{ fontSize: 11, color: D_TOK.mute, marginLeft: 'auto' }}>
              {Number(order.km).toFixed(1)} km
            </Mono>
          </div>

          {/* Value + items */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
            <Mono style={{ fontSize: 13, fontWeight: 700, color: D_TOK.ink }}>
              SAR {Number(order.value).toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Mono>
            <span style={{ fontSize: 11, color: D_TOK.mute }}>{order.items} items</span>
          </div>
        </div>
      </div>

      {/* Assigned banner */}
      {isAssigned && (
        <div style={{
          marginTop: 8, paddingTop: 6, borderTop: `1px solid ${D_TOK.line}`,
          fontSize: 11, color: D_TOK.good, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Ico name="check" size={12} color={D_TOK.good} />
          Assigned to {assignment.driverId}
        </div>
      )}
    </div>
  );
}

export default function OrdersPool({
  orders, assignmentMap, draggingOrderId,
  onDragStart, onDragEnd, onSelectOrder, onAutoAssign,
  isMobile, isTablet,
}) {
  const [priFilter, setPriFilter] = useState('All');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const unassignedCount = orders.filter(o => !assignmentMap[o.orderId]?.length).length;

  const filtered = orders.filter(o => {
    if (priFilter !== 'All' && o.priority !== priFilter) return false;
    if (unassignedOnly && assignmentMap[o.orderId]?.length) return false;
    return true;
  });

  const panelWidth = isMobile ? '100%' : isTablet ? 300 : 380;
  const panelMinWidth = isMobile ? undefined : isTablet ? 240 : 380;

  return (
    <div style={{
      width: panelWidth,
      ...(panelMinWidth != null ? { minWidth: panelMinWidth } : {}),
      height: '100%', background: D_TOK.sand,
      borderLeft: `1px solid ${D_TOK.line}`, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${D_TOK.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: D_TOK.ink }}>
            Order Pool · {unassignedCount} open
          </span>
          <Btn size="sm" variant="primary" onClick={onAutoAssign}>
            <Ico name="bolt" size={12} color="#fff" /> Auto-assign
          </Btn>
        </div>

        {/* Priority filters */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {PRI_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setPriFilter(f)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: priFilter === f ? D_TOK.ink : 'transparent',
                color: priFilter === f ? '#fff' : D_TOK.mute,
              }}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setUnassignedOnly(v => !v)}
            style={{
              marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              border: `1px solid ${unassignedOnly ? D_TOK.accent : D_TOK.line}`,
              background: unassignedOnly ? D_TOK.accentBg : 'transparent',
              color: unassignedOnly ? D_TOK.accent : D_TOK.mute,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Ico name="filter" size={11} color="currentColor" />
            Open only
          </button>
        </div>
      </div>

      {/* Order list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: D_TOK.mute, fontSize: 13, marginTop: 40 }}>
            No open orders match this filter
          </div>
        ) : (
          filtered.map(o => (
            <OrderCard
              key={o.orderId}
              order={o}
              assignment={assignmentMap[o.orderId]?.[0]}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onSelectOrder}
            />
          ))
        )}
      </div>
    </div>
  );
}
