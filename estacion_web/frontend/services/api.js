const BASE = import.meta.env.VITE_API_URL || '/api'
const WS   = import.meta.env.VITE_WS_URL  || `ws://${window.location.host}/api/ws`

export const api = {
  getLatest:  ()                        => fetch(`${BASE}/latest`).then(r => r.json()),
  getHistory: (field, hours=24, limit=300) =>
    fetch(`${BASE}/history?field=${field}&hours=${hours}&limit=${limit}`).then(r => r.json()),
  getStats:   (field, hours=24)         =>
    fetch(`${BASE}/stats?field=${field}&hours=${hours}`).then(r => r.json()),
  getFields:     ()                        => fetch(`${BASE}/fields`).then(r => r.json()),
  getRainToday:  ()                        => fetch(`${BASE}/rain_today`).then(r => r.json()),
  getPing:       ()                        => fetch(`${BASE}/ping`).then(r => r.json()),
}

export { WS as WS_URL }
