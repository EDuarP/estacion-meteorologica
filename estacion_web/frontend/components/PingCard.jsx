// ─── ¿Dónde cambio la IP / host que se mide? ──────────────────────────────────
//   La tarjeta mide el tiempo de respuesta del backend (la Raspberry Pi).
//   Cambia la URL destino en docker-compose.yml:
//     VITE_API_URL=http://<ip-de-la-raspberry>:8000/api
//   O en un archivo frontend/.env.local:
//     VITE_API_URL=http://192.168.1.100:8000/api
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { api } from '../services/api'

const MAX_HISTORY = 30
const POLL_MS = 2000

function pingColor(ms) {
  if (ms === null) return '#9AA0A6'
  if (ms < 50)    return '#34A853'
  if (ms < 150)   return '#F9AB00'
  return '#EA4335'
}

function Sparkline({ data, color }) {
  if (data.length < 3) return null
  const W = 116, H = 34, PAD = 2
  const vals = data.filter(v => v !== null)
  if (vals.length < 2) return null

  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = v === null
      ? H - PAD
      : PAD + (1 - (v - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.75}
      />
      {/* Punto actual */}
      {(() => {
        const last = data[data.length - 1]
        if (last === null) return null
        const x = W - PAD
        const y = PAD + (1 - (last - min) / range) * (H - PAD * 2)
        return <circle cx={x} cy={y} r={2.5} fill={color} />
      })()}
    </svg>
  )
}

export function PingCard() {
  const [ping,    setPing]    = useState(null)
  const [history, setHistory] = useState([])
  const [status,  setStatus]  = useState('idle')

  useEffect(() => {
    let timer

    async function measure() {
      const t0 = performance.now()
      try {
        await api.getPing()
        const ms = Math.round(performance.now() - t0)
        setPing(ms)
        setStatus('ok')
        setHistory(h => [...h.slice(-(MAX_HISTORY - 1)), ms])
      } catch {
        setStatus('timeout')
        setPing(null)
        setHistory(h => [...h.slice(-(MAX_HISTORY - 1)), null])
      }
      timer = setTimeout(measure, POLL_MS)
    }

    measure()
    return () => clearTimeout(timer)
  }, [])

  const color    = pingColor(ping)
  const valid    = history.filter(v => v !== null)
  const minMs    = valid.length ? Math.min(...valid) : null
  const maxMs    = valid.length ? Math.max(...valid) : null
  const bgTint   = color + '18'

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1.5px solid #F1F3F4',
      borderRadius: 20,
      padding: '22px 20px',
      boxShadow: '0 1px 4px rgba(60,64,67,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Fondo tint dinámico */}
      <div style={{
        position: 'absolute', right: -20, top: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: bgTint,
        transition: 'background 0.5s',
      }}/>

      {/* Icono de red / señal */}
      <div style={{ marginBottom: 14, position: 'relative' }}>
        <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="20" r="1.8" fill={color} style={{ transition: 'fill 0.4s' }}/>
          <path d="M8.8 16.8C9.7 15.9 10.8 15.3 12 15.3s2.3.6 3.2 1.5"
            stroke={color} strokeWidth="1.6" strokeLinecap="round"
            style={{ transition: 'stroke 0.4s' }}/>
          <path d="M5.8 13.5C7.4 11.9 9.6 11 12 11s4.6.9 6.2 2.5"
            stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.55"
            style={{ transition: 'stroke 0.4s' }}/>
          <path d="M2.8 10.2C5.1 7.9 8.4 6.5 12 6.5s6.9 1.4 9.2 3.7"
            stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.25"
            style={{ transition: 'stroke 0.4s' }}/>
        </svg>
      </div>

      {/* Label */}
      <p style={{
        margin: '0 0 3px 0',
        fontSize: 10, fontWeight: 500,
        letterSpacing: '0.09em', textTransform: 'uppercase',
        color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif",
      }}>
        Ping
      </p>

      {/* Valor principal */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
        <span style={{
          fontSize: 32, fontWeight: 300, lineHeight: 1,
          color: ping !== null ? color : '#DADCE0',
          fontFamily: "'Familjen Grotesk', sans-serif",
          letterSpacing: '-0.02em',
          transition: 'color 0.4s',
        }}>
          {ping !== null ? ping : (status === 'timeout' ? '—' : '…')}
        </span>
        <span style={{ fontSize: 12, color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif" }}>ms</span>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: 6, opacity: history.length >= 3 ? 1 : 0, transition: 'opacity 0.6s' }}>
        <Sparkline data={history} color={color} />
      </div>

      {/* Min / Max */}
      {minMs !== null ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 9, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>
            min <span style={{ color: '#34A853', fontWeight: 600 }}>{minMs}ms</span>
          </span>
          <span style={{ fontSize: 9, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>
            max <span style={{ color: '#EA4335', fontWeight: 600 }}>{maxMs}ms</span>
          </span>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 10, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>
          Midiendo…
        </p>
      )}
    </div>
  )
}
