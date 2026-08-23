# ERROR 404 — Operations & Troubleshooting Guide

---

## 1. Database Connection Failure

- **Symptom**: System Health indicates `PostgreSQL: DEGRADED`.
- **Cause**: Local PostgreSQL daemon is stopped or port 5432 is blocked.
- **Check**: Run `npm run preflight` to inspect DB connectivity.
- **Fix**: The backend automatically falls back to an in-memory spatial store with zero crash. To restore PostgreSQL:
  ```bash
  brew services start postgresql@16
  npm run prisma:migrate
  ```

---

## 2. ML Nowcasting Microservice Offline (Port 8000)

- **Symptom**: `Nowcasting Microservice: DEGRADED` or `/health` timeout.
- **Cause**: FastAPI Python server on port 8000 terminated.
- **Check**: Check `curl http://localhost:8000/health`.
- **Fix**: Restart the Python ML microservice:
  ```bash
  PYTHONPATH=. /opt/anaconda3/bin/python3 -m uvicorn ml.api:app --host 0.0.0.0 --port 8000 --reload
  ```

---

## 3. Stale Weather Data Warning (`>30 min`)

- **Symptom**: Risk score reports `RISK_UNAVAILABLE` or `DATA QUALITY: STALE`.
- **Cause**: Upstream Open-Meteo or WMO GTS sync has not refreshed in &gt;1800 seconds.
- **Check**: Inspect `/admin/data-quality` table for feed telemetry age.
- **Fix**: Click **Refresh Feeds** in `/admin/data-quality` or `/api/weather/current?refresh=true` to force a new sync.

---

## 4. Port 5001 or Port 3000 Already in Use

- **Symptom**: `EADDRINUSE: address already in use :::5001`.
- **Cause**: An orphaned Node.js or Vite process is holding the port.
- **Check**: `lsof -i :5001` or `lsof -i :3000`.
- **Fix**:
  ```bash
  kill -9 $(lsof -t -i:5001)
  kill -9 $(lsof -t -i:3000)
  npm run dev
  ```

---

## 5. Notification Dispatch Errors in Queue

- **Symptom**: Queue metrics show `notificationsFailed > 0`.
- **Cause**: Invalid Web Push endpoint or unreachable SMTP host.
- **Check**: Inspect `/alerts` admin telemetry panel for provider statuses.
- **Fix**: Failed dispatches are automatically retried with exponential backoff up to 3 times before transitioning to `DEAD_LETTER`.
