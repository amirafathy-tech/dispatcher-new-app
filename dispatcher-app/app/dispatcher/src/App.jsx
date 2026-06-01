import { useState, useEffect, useMemo, useCallback } from 'react';
import { D_TOK } from './tokens.js';
import Sidebar from './shell/Sidebar.jsx';
import TopHeader from './shell/TopHeader.jsx';
import DriversPanel from './panels/DriversPanel.jsx';
import MapPanel from './panels/MapPanel.jsx';
import OrdersPool from './panels/OrdersPool.jsx';
import DriverDrawer from './drawers/DriverDrawer.jsx';
import OrderDrawer from './drawers/OrderDrawer.jsx';
import AlertsStrip from './AlertsStrip.jsx';
import DriversPage   from './pages/DriversPage.jsx';
import OrdersPage    from './pages/OrdersPage.jsx';
import RoutesPage    from './pages/RoutesPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import ReportsPage   from './pages/ReportsPage.jsx';
import { useBreakpoint } from './hooks/useBreakpoint.js';
import {
  fetchDrivers, fetchOrders, fetchAssignments, fetchAlerts,
  createAssignment, deleteAssignment, autoAssign, pushRoute, markDelivered,
  updatePositions,
} from './api.js';

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
      background: D_TOK.ink, color: '#fff', padding: '10px 20px', borderRadius: 8,
      fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  );
}

const DISPATCH_TABS = [
  { id: 'drivers', label: 'Drivers' },
  { id: 'map',     label: 'Map'     },
  { id: 'orders',  label: 'Orders'  },
];

export default function App() {
  const [drivers,     setDrivers]     = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [activeNav,        setActiveNav]        = useState('dispatch');
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedOrderId,  setSelectedOrderId]  = useState(null);
  const [draggingOrderId,  setDraggingOrderId]  = useState(null);
  const [dragOverDriverId, setDragOverDriverId] = useState(null);
  const [search,           setSearch]           = useState('');
  const [toast,            setToast]            = useState(null);
  const [mobilePanel,      setMobilePanel]      = useState('map');
  const [isTracking,       setIsTracking]       = useState(true);
  const [lastTrackTs,      setLastTrackTs]      = useState(null);
  const [trackedIds,       setTrackedIds]       = useState(new Set());

  const { isMobile, isTablet } = useBreakpoint();

  const showToast = useCallback((msg) => setToast(msg), []);

  const loadData = useCallback(async () => {
    try {
      const [d, o, a, al] = await Promise.all([
        fetchDrivers(), fetchOrders(), fetchAssignments(), fetchAlerts(),
      ]);
      setDrivers(d);
      setOrders(o);
      setAssignments(a);
      setAlerts(al);
    } catch (e) {
      console.error('Load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Live position polling — only runs on dispatch tab while tracking is active
  const refreshPositions = useCallback(async () => {
    try {
      const positions = await updatePositions();
      if (!positions?.length) return;
      const ids = new Set(positions.map(p => p.driverId));
      setDrivers(prev => prev.map(d => {
        const upd = positions.find(p => p.driverId === d.driverId);
        return upd ? { ...d, lat: upd.lat, lng: upd.lng, lastPing: upd.lastPing } : d;
      }));
      setLastTrackTs(Date.now());
      setTrackedIds(ids);
      // Clear "just updated" highlight after one cycle
      setTimeout(() => setTrackedIds(new Set()), 4000);
    } catch (e) {
      console.error('Tracking error', e);
    }
  }, []);

  useEffect(() => {
    if (!isTracking || activeNav !== 'dispatch') return;
    const id = setInterval(refreshPositions, 6000);
    return () => clearInterval(id);
  }, [isTracking, activeNav, refreshPositions]);

  useEffect(() => {
    if (activeNav !== 'dispatch') {
      setSelectedDriverId(null);
      setSelectedOrderId(null);
    }
  }, [activeNav]);

  const assignmentMap = useMemo(() => {
    const map = {};
    assignments.forEach(a => {
      if (!map[a.orderId]) map[a.orderId] = [];
      map[a.orderId].push(a);
    });
    return map;
  }, [assignments]);

  const driverPendingMap = useMemo(() => {
    const map = {};
    assignments.forEach(a => {
      if (a.status === 'assigned') map[a.driverId] = (map[a.driverId] || 0) + 1;
    });
    return map;
  }, [assignments]);

  const handleDragStart  = useCallback((orderId)  => setDraggingOrderId(orderId),  []);
  const handleDragEnd    = useCallback(() => { setDraggingOrderId(null); setDragOverDriverId(null); }, []);
  const handleDragOver   = useCallback((driverId) => setDragOverDriverId(driverId), []);
  const handleDragLeave  = useCallback(() => setDragOverDriverId(null), []);

  const handleDrop = useCallback(async (driverId) => {
    setDragOverDriverId(null);
    if (!draggingOrderId) return;
    const orderId = draggingOrderId;
    setDraggingOrderId(null);
    if (assignmentMap[orderId]?.length) return;
    try {
      await createAssignment(orderId, driverId);
      await loadData();
      setToast(`Assigned ${orderId} to ${driverId}`);
    } catch (e) {
      console.error('Assignment error', e);
    }
  }, [draggingOrderId, assignmentMap, loadData]);

  const handleAssignFromDrawer = useCallback(async (orderId, driverId) => {
    try {
      await createAssignment(orderId, driverId);
      await loadData();
      setSelectedOrderId(null);
      setToast(`Assigned ${orderId} to ${driverId}`);
    } catch (e) {
      console.error('Assign error', e);
    }
  }, [loadData]);

  const handleUnassign = useCallback(async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
      await loadData();
      setToast('Order unassigned');
    } catch (e) {
      console.error('Unassign error', e);
    }
  }, [loadData]);

  const handleAutoAssign = useCallback(async () => {
    try {
      await autoAssign();
      await loadData();
      setToast('Auto-assign complete — all orders distributed');
    } catch (e) {
      console.error('AutoAssign error', e);
    }
  }, [loadData]);

  const handlePushRoute = useCallback(async (driverId) => {
    try {
      await pushRoute(driverId);
      await loadData();
      setToast(`Route pushed to ${driverId}`);
    } catch (e) {
      console.error('PushRoute error', e);
    }
  }, [loadData]);

  const handleMarkDelivered = useCallback(async (assignmentId) => {
    try {
      await markDelivered(assignmentId);
      await loadData();
      setToast('Order marked as delivered');
    } catch (e) {
      console.error('MarkDelivered error', e);
    }
  }, [loadData]);

  const selectedDriver = drivers.find(d => d.driverId === selectedDriverId) ?? null;
  const selectedOrder  = orders.find(o => o.orderId  === selectedOrderId)  ?? null;
  const selectedOrderAssignment = selectedOrderId ? assignmentMap[selectedOrderId]?.[0] ?? null : null;
  const driverAssignments = assignments.filter(a => a.driverId === selectedDriverId);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: D_TOK.sand, fontSize: 16, color: D_TOK.mute,
      }}>
        Loading Dispatcher Console…
      </div>
    );
  }

  const driversPanelProps = {
    drivers, selectedDriverId, draggingOrderId, dragOverDriverId,
    pendingMap: driverPendingMap,
    onSelectDriver: id => { setSelectedDriverId(id); setSelectedOrderId(null); },
    onDragOver: handleDragOver, onDragLeave: handleDragLeave,
    onDrop: handleDrop, onToast: showToast,
    trackedIds,
  };

  const mapPanelProps = {
    drivers, orders, assignments, selectedDriverId,
    onSelectDriver: id => { setSelectedDriverId(id); setSelectedOrderId(null); },
    onSelectOrder:  id => { setSelectedOrderId(id); setSelectedDriverId(null); },
    isTracking, lastTrackTs,
    onToggleTracking: () => setIsTracking(v => !v),
  };

  const ordersPoolProps = {
    orders, assignmentMap, draggingOrderId,
    onDragStart: handleDragStart, onDragEnd: handleDragEnd,
    onSelectOrder: id => { setSelectedOrderId(id); setSelectedDriverId(null); },
    onAutoAssign: handleAutoAssign,
  };

  function renderMain() {
    switch (activeNav) {
      case 'dispatch':
        if (isMobile) {
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Panel tab bar */}
              <div style={{
                display: 'flex', background: '#fff',
                borderBottom: `1px solid ${D_TOK.line}`, flexShrink: 0,
              }}>
                {DISPATCH_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setMobilePanel(id)}
                    style={{
                      flex: 1, height: 40, border: 'none', background: 'transparent',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      color: mobilePanel === id ? D_TOK.accent : D_TOK.mute,
                      borderBottom: `2px solid ${mobilePanel === id ? D_TOK.accent : 'transparent'}`,
                      transition: 'color 0.15s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Active panel — fills remaining space */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {mobilePanel === 'drivers' && <DriversPanel isMobile {...driversPanelProps} />}
                {mobilePanel === 'map'     && <MapPanel     {...mapPanelProps} />}
                {mobilePanel === 'orders'  && <OrdersPool   isMobile {...ordersPoolProps} />}
              </div>
            </div>
          );
        }
        return (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <DriversPanel isTablet={isTablet} {...driversPanelProps} />
            <MapPanel     {...mapPanelProps} />
            <OrdersPool   isTablet={isTablet} {...ordersPoolProps} />
          </div>
        );
      case 'drivers':
        return <DriversPage drivers={drivers} onReload={loadData} />;
      case 'orders':
        return (
          <OrdersPage
            orders={orders}
            assignmentMap={assignmentMap}
            drivers={drivers}
            onAssign={orderId => { setActiveNav('dispatch'); setSelectedOrderId(orderId); }}
          />
        );
      case 'routes':
        return <RoutesPage drivers={drivers} assignments={assignments} orders={orders} />;
      case 'customers':
        return <CustomersPage orders={orders} />;
      case 'reports':
        return <ReportsPage drivers={drivers} orders={orders} assignments={assignments} />;
      default:
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D_TOK.mute }}>
            {activeNav}
          </div>
        );
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: D_TOK.sand }}>
      <Sidebar active={activeNav} onNav={setActiveNav} isMobile={isMobile} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden',
        paddingBottom: isMobile ? 56 : 0,
      }}>
        <TopHeader
          drivers={drivers}
          orders={orders}
          assignmentMap={assignmentMap}
          search={search}
          onSearch={setSearch}
          isTracking={isTracking}
          onToggleTracking={() => setIsTracking(v => !v)}
        />

        {renderMain()}

        <AlertsStrip alerts={alerts} />
      </div>

      {activeNav === 'dispatch' && selectedDriver && (
        <DriverDrawer
          isMobile={isMobile}
          driver={selectedDriver}
          assignments={driverAssignments}
          orders={orders}
          onClose={() => setSelectedDriverId(null)}
          onUnassign={handleUnassign}
          onPushRoute={handlePushRoute}
          onMarkDelivered={handleMarkDelivered}
          onToast={showToast}
        />
      )}
      {activeNav === 'dispatch' && selectedOrder && (
        <OrderDrawer
          isMobile={isMobile}
          order={selectedOrder}
          assignment={selectedOrderAssignment}
          drivers={drivers}
          onClose={() => setSelectedOrderId(null)}
          onAssign={handleAssignFromDrawer}
          onUnassign={handleUnassign}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
