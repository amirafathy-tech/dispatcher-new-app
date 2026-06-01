const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
  const { Drivers, Orders, Assignments } = cds.entities('dispatcher');

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function incrementStops(driverId, delta) {
    const [driver] = await SELECT.from(Drivers).where({ driverId });
    if (!driver) return;
    await UPDATE(Drivers)
      .where({ driverId })
      .set({ stops: Math.max(0, (driver.stops || 0) + delta) });
  }

  async function reopenOrderIfUnassigned(orderId) {
    const remaining = await SELECT.from(Assignments).where({
      orderId,
      status: { in: ['assigned', 'pushed'] },
    });
    if (remaining.length === 0) {
      await UPDATE(Orders).where({ orderId }).set({ status: 'open' });
    }
  }

  // ── CREATE Assignment ────────────────────────────────────────────────────
  srv.on('CREATE', 'Assignments', async (req) => {
    const data = req.data;
    const entry = {
      assignmentId: data.assignmentId || cds.utils.uuid(),
      orderId:      data.orderId,
      driverId:     data.driverId,
      assignedAt:   data.assignedAt || new Date().toISOString(),
      pushedAt:     data.pushedAt   || null,
      pushedBy:     data.pushedBy   || null,
      status:       data.status     || 'assigned',
    };

    await INSERT.into(Assignments).entries(entry);

    // Update order → assigned
    await UPDATE(Orders).where({ orderId: entry.orderId }).set({ status: 'assigned' });

    // Driver gets one more stop
    await incrementStops(entry.driverId, +1);

    console.log(`[Assign] ${entry.orderId} → ${entry.driverId}  stops++`);
    return entry;
  });

  // ── DELETE Assignment ────────────────────────────────────────────────────
  srv.on('DELETE', 'Assignments', async (req) => {
    const keyVal   = req.params[0];
    const assignmentId = (typeof keyVal === 'object' ? keyVal.assignmentId : keyVal);

    const [assignment] = await SELECT.from(Assignments).where({ assignmentId });
    if (!assignment) return req.reject(404, `Assignment ${assignmentId} not found`);

    await DELETE.from(Assignments).where({ assignmentId });

    // Driver loses one stop
    await incrementStops(assignment.driverId, -1);

    // Reopen order if no other active assignments remain
    await reopenOrderIfUnassigned(assignment.orderId);

    console.log(`[Unassign] ${assignment.orderId} ← ${assignment.driverId}  stops--`);
  });

  // ── AutoAssign ───────────────────────────────────────────────────────────
  srv.on('AutoAssign', async (req) => {
    const allActive    = await SELECT.from(Assignments).where({ status: { in: ['assigned', 'pushed'] } });
    const takenOrderIds = new Set(allActive.map(a => a.orderId));

    const unassigned = (await SELECT.from(Orders).where({ status: 'open' }))
      .filter(o => !takenOrderIds.has(o.orderId));

    if (unassigned.length === 0) return [];

    const priorityRank = { 'P-A': 0, 'P-B': 1, 'P-C': 2 };
    unassigned.sort((a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9));

    const available = await SELECT.from(Drivers).where({
      status: { in: ['on-route', 'idle', 'break'] },
    });
    if (available.length === 0) return req.error(400, 'No available drivers');

    // Build assignment records and count stops per driver
    const newStopsPerDriver = {};
    const created = [];

    for (let i = 0; i < unassigned.length; i++) {
      const driver = available[i % available.length];
      const entry = {
        assignmentId: cds.utils.uuid(),
        orderId:      unassigned[i].orderId,
        driverId:     driver.driverId,
        assignedAt:   new Date().toISOString(),
        pushedAt:     null,
        pushedBy:     null,
        status:       'assigned',
      };
      await INSERT.into(Assignments).entries(entry);
      created.push(entry);
      newStopsPerDriver[driver.driverId] = (newStopsPerDriver[driver.driverId] || 0) + 1;
    }

    // Mark all newly assigned orders
    const newOrderIds = created.map(a => a.orderId);
    await UPDATE(Orders).where({ orderId: { in: newOrderIds } }).set({ status: 'assigned' });

    // Update stops for each affected driver
    for (const [driverId, count] of Object.entries(newStopsPerDriver)) {
      await incrementStops(driverId, count);
    }

    console.log(`[AutoAssign] ${created.length} assignments across ${available.length} drivers`);
    return created;
  });

  // ── MarkDelivered ────────────────────────────────────────────────────────
  srv.on('MarkDelivered', async (req) => {
    const { assignmentId } = req.data;

    const [assignment] = await SELECT.from(Assignments).where({ assignmentId });
    if (!assignment) return req.reject(404, `Assignment ${assignmentId} not found`);
    if (assignment.status === 'delivered') return true;

    await UPDATE(Assignments).where({ assignmentId }).set({ status: 'delivered' });

    const { Drivers, Orders } = cds.entities('dispatcher');
    const [order]  = await SELECT.from(Orders).where({ orderId: assignment.orderId });
    const [driver] = await SELECT.from(Drivers).where({ driverId: assignment.driverId });

    if (driver) {
      const newDone = Math.min((driver.done || 0) + 1, driver.stops || 0);
      const allDone = newDone >= (driver.stops || 0);
      await UPDATE(Drivers).where({ driverId: assignment.driverId }).set({
        done:   newDone,
        sales:  (Number(driver.sales) || 0) + Number(order?.value || 0),
        ...(allDone ? { status: 'idle' } : {}),
      });
    }

    console.log(`[Deliver] ${assignment.orderId} ← ${assignment.driverId}  done++  sales+=`);
    return true;
  });

  // ── UpdatePositions ──────────────────────────────────────────────────────
  // Simulates GPS tick: nudges on-route/late drivers along plausible paths.
  srv.on('UpdatePositions', async (req) => {
    const { Drivers } = cds.entities('dispatcher');
    const active = await SELECT.from(Drivers).where({ status: { in: ['on-route', 'late'] } });
    if (active.length === 0) return [];

    const now  = new Date();
    const ping = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const results = [];
    for (const d of active) {
      const speed = d.status === 'on-route' ? 0.012 : 0.007;
      // Random heading change with drift — keeps movement looking directional
      const angle = Math.random() * 2 * Math.PI;
      const dLat  = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
      const dLng  = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);

      const newLat = Math.max(0.04, Math.min(0.96, Number(d.lat) + dLat));
      const newLng = Math.max(0.04, Math.min(0.96, Number(d.lng) + dLng));

      await UPDATE(Drivers).where({ driverId: d.driverId }).set({
        lat: newLat, lng: newLng, lastPing: ping,
      });

      results.push({ driverId: d.driverId, lat: newLat, lng: newLng, lastPing: ping, speed });
    }

    console.log(`[Track] ${results.length} drivers updated @ ${ping}`);
    return results;
  });

  // ── PushRoute ────────────────────────────────────────────────────────────
  srv.on('PushRoute', async (req) => {
    const { driverId } = req.data;

    const pending = await SELECT.from(Assignments).where({ driverId, status: 'assigned' });
    if (pending.length === 0) {
      console.log(`[PushRoute] No pending assignments for ${driverId}`);
      return false;
    }

    const pushedAt = new Date().toISOString();
    await UPDATE(Assignments)
      .where({ driverId, status: 'assigned' })
      .set({ pushedAt, pushedBy: 'dispatcher', status: 'pushed' });

    // Driver is now dispatched
    await UPDATE(Drivers)
      .where({ driverId })
      .set({ status: 'on-route', lastPing: 'now' });

    console.log(`[PushRoute] ${pending.length} stops pushed to ${driverId} → on-route`);
    return true;
  });
});
