# Audit Note — AISmartBuildingManager

## Original audit recommendations (batch_07.md §32)

**Missing AI endpoints:** `/occupancy-optimization`, `/predictive-maintenance`, `/energy-forecast`, `/comfort-optimization`, `/security-anomaly-detection`, `/water-usage-optimization`.

**Missing non-AI features:** real-time dashboard, IoT device integration, occupant mobile app, tenant submetering, emergency response workflows, vendor management.

**Custom suggestions:** whole-building energy optimization, thermal comfort prediction, predictive maintenance engine, security anomaly detection, occupancy-driven demand response, water/waste optimization.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/occupancy-optimization` — HVAC/lighting setpoint and schedule recommendations.
2. `POST /api/ai/predictive-maintenance` — failure-window predictions + PM schedule + parts-to-stage.
3. `POST /api/ai/security-anomaly-detection` — off-hours / tailgating / badge-clone / unusual-path detection.

All three reuse `callOpenRouter`, `parseAIJson`, `persistAIResult`, `aiRateLimiter`. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/energy-forecast` (mechanical follow-up).
2. `POST /api/ai/comfort-optimization` (mechanical follow-up).
3. `POST /api/ai/water-usage-optimization` (mechanical follow-up).
4. IoT device integration (NEEDS-CREDS — BACnet, Modbus gateways).
5. Tenant submetering data model (mechanical CRUD).

## Apply pass 3 (frontend)

- **Stack:** Vite + React + react-router-dom, Tailwind (dark theme), JWT Bearer via `apiPost`/`apiGet` helpers in `src/api.js` (`localStorage.getItem('token')`).
- **Action:** UPDATED-FE — pass-2 page components existed but were not registered.
- **Files:** `frontend/src/App.jsx` (3 imports + 3 `<Route>`s added), `frontend/src/pages/Dashboard.jsx` (3 feature tiles added).
- **Notes:** Pages `OccupancyOptimizationPage.jsx`, `PredictiveMaintenanceAIPage.jsx`, `SecurityAnomalyPage.jsx` were already created in a prior pass and call `apiPost('/ai/...')` correctly, but were not reachable. Registered routes `/occupancy-optimization`, `/predictive-maintenance-ai`, `/security-anomaly` and added matching feature tiles on the Dashboard so they are discoverable. Existing styling (dark-950 / dark-800 / lucide-react icons / Toaster) reused. Backend returns 503 on missing `OPENROUTER_API_KEY`; the existing `apiPost` `throw new Error(await res.text())` surfaces the message via toast. Syntax-checked with esbuild jsx loader.

## Apply pass 4 (mechanical backlog)

- **Action:** LEFT-AS-IS — all three mechanical backlog items were already implemented in a prior pass-4 sweep.
- **Mechanical features verified present (BE + FE):**
  1. `POST /api/ai/energy-forecast` — `backend/routes/ai.js`; FE `frontend/src/pages/EnergyForecastPage.jsx` (route `/energy-forecast`).
  2. `POST /api/ai/comfort-optimization` — `backend/routes/ai.js`; FE `frontend/src/pages/ComfortOptimizationPage.jsx` (route `/comfort-optimization`).
  3. `POST /api/ai/water-usage-optimization` — `backend/routes/ai.js`; FE `frontend/src/pages/WaterUsageOptimizationPage.jsx` (route `/water-usage-optimization`).
- **Helper pattern:** `aiRateLimiter` + the existing OpenRouter helper (503 on missing key). FE uses shared `apiPost` from `src/api.js` (JWT bearer via `localStorage.getItem('token')`); error text surfaced through toast.
- **Backlog deferred:** IoT BACnet/Modbus gateways → NEEDS-CREDS; Tenant submetering CRUD + emergency-response workflows → NEEDS-PRODUCT-DECISION; occupant mobile app → TOO-RISKY.
- **Smoke test:** `node --check backend/routes/ai.js` PASS; live HTTP skipped (Postgres not provisioned).
- **Idempotence rule applied** — no duplicate routes, no new deps, no `npm install`.
