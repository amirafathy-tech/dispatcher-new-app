# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend (CAP/Node.js) — run from repo root:**
```bash
npm run dev        # cds watch — hot-reload dev server on port 4004
npm start          # cds-serve — production server
```

**Frontend (React/Vite) — run from repo root:**
```bash
npm run ui         # Vite dev server on port 5173 (proxies /dispatcher → localhost:4004)
npm run build:ui   # Production build → app/dispatcher/dist/
```

Both servers must run simultaneously for full-stack local development.

**Cloud build (SAP BTP):**
```bash
npm ci && npx cds build --production
```

## Architecture

This is a **SAP CAP** (Cloud Application Programming) full-stack app — a delivery dispatch console for managing drivers, orders, and route assignments.

### Backend (`/srv`, `/db`)

- **`db/schema.cds`** — Five CDS entities: `Drivers`, `Orders`, `Assignments`, `Alerts`, `OrderItems`. Sample data seeded from CSVs in `db/data/`.
- **`srv/dispatcher-service.cds`** — Exposes all entities via OData v4 plus two custom actions:
  - `AutoAssign()` — round-robin distributes unassigned open orders to available drivers by priority (P-A → P-B → P-C).
  - `PushRoute(driverId)` — marks all pending assignments for a driver as "pushed" (sent to driver app).
- **`srv/dispatcher-service.js`** — Implements the custom actions; standard CRUD comes from CAP auto-handling.
- **`.cdsrc.json`** — Dev uses SQLite in-memory; production uses SAP HANA via `@cap-js/hana`.
- **`mta.yaml`** — Deployment descriptor for SAP BTP Cloud Foundry with HDI container.

### Frontend (`/app/dispatcher`)

React 18 + Vite SPA. The Vite dev proxy rewrites `/dispatcher/*` → `http://localhost:4004/dispatcher/*`.

**State & data flow:**
- `App.jsx` owns all global state (drivers, orders, assignments, alerts) and loads everything in parallel on mount via `src/api.js`.
- User interactions (drag-and-drop assignment, auto-assign, push route) call the API and trigger a full data reload. There is no client-side cache or state library — every mutation reloads from the server.

**Key source files:**
| File | Role |
|------|------|
| `src/App.jsx` | Root component; global state, data loading, drag-drop logic |
| `src/api.js` | All HTTP calls to `/dispatcher` endpoints (fetch helpers + named exports) |
| `src/tokens.js` | Design-system tokens: colors, status/priority/severity palettes |
| `src/shell/atoms.jsx` | Shared UI primitives: `Pill`, `Button`, `Avatar`, `Progress`, `Mono` |
| `src/shell/Ico.jsx` | Icon renderer |

**UI structure:**
- `src/pages/` — Full-page views navigated via sidebar: `DriversPage`, `OrdersPage`, `RoutesPage`, `CustomersPage`, `ReportsPage`.
- `src/panels/` — The main dispatch view (default page): `DriversPanel` (left), `MapPanel` (center), `OrdersPool` (right).
- `src/drawers/` — Slide-in detail views: `DriverDrawer`, `OrderDrawer`.
- `src/AlertsStrip.jsx` — Persistent alert banner at top.

**Styling:** Inline styles only, using values from `tokens.js`. No CSS framework or external stylesheet.

### Data Model Summary

| Entity | Key field | Notable fields |
|--------|-----------|----------------|
| Drivers | `driverId` | `status`, `route`, `stops`/`done`, `lat`/`lng`, `stockPct`, `lastPing` |
| Orders | `orderId` | `priority` (P-A/P-B/P-C), `status` (open/assigned), delivery window, location |
| Assignments | `assignmentId` (UUID) | `orderId`, `driverId`, `status` (assigned/pushed/delivered), timestamps |
| Alerts | `alertId` (auto-inc) | `severity` (high/med/low), `resolved` flag |
| OrderItems | `itemId` | `orderId` FK, sku, qty, unitPrice, lineTotal |
