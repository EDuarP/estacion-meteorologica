import { useState, useCallback, useEffect } from 'react'
import { SensorCard } from './components/SensorCard'
import { SensorChart } from './components/SensorChart'
import { WeatherIcons, FIELD_CONFIG, PRIMARY_FIELDS, SECONDARY_FIELDS } from './components/WeatherIcons'
import { useWebSocket } from './hooks/useWebSocket'
import { api } from './services/api'

const WIND_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"]
const windLabel = deg => deg != null ? WIND_DIRS[Math.round(deg / 22.5) % 16] : '—'

export default function App() {
  const [data, setData]           = useState({})
  const [activeField, setActive]  = useState('temp_c')
  const [time, setTime]           = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    api.getLatest().then(d => { if (d && typeof d === 'object') setData(d) }).catch(() => {})
  }, [])

  const onMessage = useCallback((msg) => {
    if (msg.type === 'init' || msg.type === 'update') setData(msg.data || {})
  }, [])
  const connected = useWebSocket(onMessage)

  const temp   = data.temp_c    != null ? Number(data.temp_c).toFixed(1)    : null
  const hum    = data.humidity_rh != null ? Number(data.humidity_rh).toFixed(0) : null
  const wind   = data.wind_kph  != null ? Number(data.wind_kph).toFixed(1)  : null
  const wdir   = data.winddir_deg
  const bat    = data.battery_v != null ? Number(data.battery_v).toFixed(2) : null
  const batPct = bat ? Math.min(100, Math.max(0, ((bat - 3.0) / (4.2 - 3.0)) * 100)) : 0

  const hasData = Object.keys(data).length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        background: '#FFF', borderBottom: '1px solid #F1F3F4',
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: '#202124',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WeatherIcons.temperatura size={16} color="#FFF"/>
          </div>
          <span style={{
            fontSize: 14, fontWeight: 500, color: '#202124',
            fontFamily: "'Familjen Grotesk', sans-serif", letterSpacing: '-0.01em',
          }}>
            Estación Meteorológica
          </span>
          <span style={{ fontSize: 11, color: '#BDC1C6', marginLeft: 4 }}>weather/station1</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 300, color: '#202124', fontFamily: "'Familjen Grotesk', sans-serif", letterSpacing: '-0.01em' }}>
              {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#BDC1C6', textTransform: 'capitalize' }}>
              {time.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 20,
            background: connected ? '#E6F4EA' : '#FCE8E6',
          }}>
            {connected ? <WeatherIcons.connected size={8}/> : <WeatherIcons.disconnected size={8}/>}
            <span style={{ fontSize: 10, fontWeight: 500, color: connected ? '#34A853' : '#EA4335' }}>
              {connected ? 'MQTT en línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 40px' }}>

        {/* ── Hero ── */}
        <div style={{
          background: '#FFF', border: '1px solid #F1F3F4',
          borderRadius: 24, padding: '28px 36px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 6px rgba(60,64,67,0.06)',
        }}>
          <div>
            <p style={{ margin: '0 0 2px 0', fontSize: 10, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Temperatura exterior
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontSize: 68, fontWeight: 300, color: temp ? '#202124' : '#DADCE0',
                fontFamily: "'Familjen Grotesk', sans-serif", letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                {temp ?? '—'}
              </span>
              <span style={{ fontSize: 26, color: '#9AA0A6', fontWeight: 300 }}>°C</span>
            </div>

            {/* Sub-stats */}
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              {[
                { icon: <WeatherIcons.humedad size={14} color="#4285F4"/>, val: hum ? `${hum}%` : '—', label: 'Humedad' },
                { icon: <WeatherIcons.viento size={14} color="#34A853"/>, val: wind ? `${wind} km/h` : '—', label: 'Viento' },
                { icon: <WeatherIcons.winddir size={14} color="#34A853" deg={wdir ?? 0}/>, val: wdir != null ? `${wdir}° ${windLabel(wdir)}` : '—', label: 'Dirección' },
                { icon: <WeatherIcons.bateria size={14} color="#137333" pct={batPct}/>, val: bat ? `${bat} V` : '—', label: 'Batería' },
              ].map(({ icon, val, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {icon}
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#5F6368' }}>{val}</p>
                    <p style={{ margin: 0, fontSize: 9, color: '#BDC1C6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ilustración grande */}
          <div style={{ opacity: 0.08 }}>
            <WeatherIcons.temperatura size={110} color="#FA7B17"/>
          </div>
        </div>

        {/* ── Grid principal ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          gap: 10, marginBottom: 10,
        }}>
          {PRIMARY_FIELDS.map(f => (
            <SensorCard key={f} field={f} data={data}
              active={activeField === f}
              onClick={() => setActive(p => p === f ? null : f)}
            />
          ))}
        </div>

        {/* ── Grid secundaria ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
          gap: 10, marginBottom: 20,
        }}>
          {SECONDARY_FIELDS.map(f => (
            <SensorCard key={f} field={f} data={data}
              active={activeField === f}
              onClick={() => setActive(p => p === f ? null : f)}
            />
          ))}

          {/* Tarjeta info millis/sample */}
          {hasData && (
            <div style={{
              background: '#FFF', border: '1.5px solid #F1F3F4',
              borderRadius: 20, padding: '22px 20px',
              boxShadow: '0 1px 4px rgba(60,64,67,0.04)',
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: 10, fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9AA0A6' }}>
                Sistema
              </p>
              {[
                ['sample_ms', 'ms', 'Sample'],
                ['millis',    'ms', 'Uptime'],
                ['wind_clicks', '', 'Clicks'],
                ['rain_tips',   '', 'Rain tips'],
              ].map(([k, u, lbl]) => (
                data[k] != null && (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#9AA0A6' }}>{lbl}</span>
                    <span style={{ fontSize: 10, color: '#5F6368', fontFamily: "'Familjen Grotesk', sans-serif" }}>
                      {data[k]} {u}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* ── Chart ── */}
        <div style={{
          background: '#FFF', border: '1px solid #F1F3F4',
          borderRadius: 24, padding: '28px 28px',
          boxShadow: '0 1px 6px rgba(60,64,67,0.05)',
        }}>
          <SensorChart field={activeField}/>
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: '#E0E0E0' }}>
          MQTT · FastAPI · React · Mosquitto · SQLite
        </p>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
