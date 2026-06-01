const BASE = '/dispatcher';

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  const j = await r.json();
  return j.value ?? j;
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.status === 204 ? null : r.json();
}

async function patch(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status}`);
  return r.status === 204 ? null : r.json();
}

async function del(path) {
  const r = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  return r.ok;
}

export const fetchDrivers     = () => get('/Drivers');
export const fetchOrders      = () => get('/Orders');
export const fetchAssignments = () => get('/Assignments');
export const fetchAlerts      = () => get('/Alerts?$orderby=alertId');
export const fetchOrderItems  = (orderId) => get(`/OrderItems?$filter=orderId eq '${orderId}'`);

export const createAssignment = (orderId, driverId) =>
  post('/Assignments', {
    orderId,
    driverId,
    assignedAt: new Date().toISOString(),
    status: 'assigned',
  });

export const deleteAssignment = (assignmentId) =>
  del(`/Assignments(${assignmentId})`);

export const autoAssign = () => post('/AutoAssign', {});

export const pushRoute = (driverId) => post('/PushRoute', { driverId });

export const markDelivered    = (assignmentId) => post('/MarkDelivered', { assignmentId });

export const updatePositions  = () => post('/UpdatePositions', {});

export const createDriver = (data) => post('/Drivers', data);
export const updateDriver = (driverId, data) => patch(`/Drivers('${driverId}')`, data);
