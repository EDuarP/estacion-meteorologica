import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { api } from '../services/api'
import { FIELD_CONFIG } from './WeatherIcons'

const RANGES = [
  { label: '1h',  hours: 1 },
  { label: '6h',  hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d',  hours: 168 },
]

const Tip = ({ active, payload, label, cfg }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#FFF', border: '1px solid #F1F3F4',
      borderRadius: 12, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(60,64,67,0.1)',
    }}>
      <p style={{ margin: '0 0 3px 0', fontSize: 10, color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#202124', fontFamily: "'Familjen Grotesk', sans-serif" }}>
        {Number(payload[0].value).toFixed(cfg?.decimals ?? 1)}
        <span style={{ fontSize: 11, color: '#9AA0A6', marginLeft: 3 }}>{cfg?.unit}</span>
      </p>
    </div>
  )
}

export function SensorChart({ field, lastUpdate }) {
  const [data, setData]   = useState([])
  const [stats, setStats] = useState(null)
  const [range, setRange] = useState(RANGES[2])
  const [loading, setLoading] = useState(false)
  const lastFetchRef = useRef(0)
  const cfg = FIELD_CONFIG[field] || { color: '#4285F4', unit: '', decimals: 1, label: field }

  const doFetch = useCallback(() => {
    if (!field) return
    setLoading(true)
    lastFetchRef.current = Date.now()
    Promise.all([
      api.getHistory(field, range.hours),
      api.getStats(field, range.hours),
    ]).then(([hist, st]) => {
      setData(hist.map(r => ({
        ...r,
        label: format(parseISO(r.timestamp), range.hours <= 6 ? 'HH:mm' : range.hours <= 24 ? 'HH:mm' : 'dd/MM'),
      })))
      setStats(st)
    }).finally(() => setLoading(false))
  }, [field, range])

  // Fetch inicial y cuando cambia el campo o el rango
  useEffect(() => {
    lastFetchRef.current = 0 // resetea throttle al cambiar campo/rango
    doFetch()
  }, [doFetch])

  // Refresca al llegar datos nuevos por WebSocket (throttle: 1 vez cada 15 s)
  useEffect(() => {
    if (!lastUpdate) return
    if (Date.now() - lastFetchRef.current < 15_000) return
    doFetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdate])

  if (!field) return (
    <div style={{ height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M8 36L20 20l8 8 8-12 8 8" stroke="#DADCE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p style={{ color: '#C4C7CC', fontSize: 12, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
        Selecciona una tarjeta para ver el historial
      </p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ margin: '0 0 2px 0', fontSize: 10, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif" }}>
            {cfg.label}
          </p>
          {stats && (
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              {[['Mín', stats.min], ['Máx', stats.max], ['Prom', stats.avg]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ margin: 0, fontSize: 9, color: '#BDC1C6', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>{l}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#5F6368', fontFamily: "'Familjen Grotesk', sans-serif" }}>
                    {v ?? '—'} <span style={{ fontSize: 10, color: '#BDC1C6' }}>{cfg.unit}</span>
                  </p>
                </div>
              ))}
              <div>
                <p style={{ margin: 0, fontSize: 9, color: '#BDC1C6', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>Lecturas</p>
                <p style={{ margin: 0, fontSize: 13, color: '#5F6368', fontFamily: "'Familjen Grotesk', sans-serif" }}>{stats.count}</p>
              </div>
            </div>
          )}
        </div>

        {/* Range pills */}
        <div style={{ display: 'flex', gap: 2, background: '#F8F9FA', borderRadius: 10, padding: 3 }}>
          {RANGES.map(r => (
            <button key={r.label} onClick={() => setRange(r)} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none',
              background: range.label === r.label ? '#FFF' : 'transparent',
              color: range.label === r.label ? '#202124' : '#9AA0A6',
              fontSize: 11, fontWeight: range.label === r.label ? 500 : 400,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: range.label === r.label ? '0 1px 3px rgba(60,64,67,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 18, height: 18, border: `2px solid ${cfg.color}30`, borderTopColor: cfg.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#BDC1C6', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Sin datos en este período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`g-${field}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.color} stopOpacity={0.14}/>
                <stop offset="100%" stopColor={cfg.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" vertical={false}/>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
            <YAxis tick={{ fontSize: 10, fill: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} width={40}/>
            <Tooltip content={<Tip cfg={cfg}/>}/>
            <Area type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={1.5} fill={`url(#g-${field})`} dot={false}
              activeDot={{ r: 4, fill: cfg.color, stroke: '#FFF', strokeWidth: 2 }}/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
