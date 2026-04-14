import { WeatherIcons, FIELD_CONFIG } from './WeatherIcons'

const WIND_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"]

function windLabel(deg) {
  if (deg == null) return '—'
  return WIND_DIRS[Math.round(deg / 22.5) % 16]
}

const LIGHT_LEVELS = [
  { max: 0.5, label: 'Oscuro',         color: '#9AA0A6' },
  { max: 1.0, label: 'Muy tenue',      color: '#7B5EA7' },
  { max: 1.7, label: 'Tenue',          color: '#C84B11' },
  { max: 2.4, label: 'Moderado',       color: '#E8941A' },
  { max: 3.0, label: 'Brillante',      color: '#F9AB00' },
  { max: 3.5, label: 'Muy brillante',  color: '#FF8F00' },
]

function UVBar({ voltage }) {
  if (voltage === null || voltage === undefined) return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
      <span style={{
        fontSize: 32, fontWeight: 300, lineHeight: 1, color: '#DADCE0',
        fontFamily: "'Familjen Grotesk', sans-serif", letterSpacing: '-0.02em',
      }}>—</span>
    </div>
  )

  const MAX_V = 3.5
  const pct   = Math.min(100, Math.max(0, (voltage / MAX_V) * 100))
  const level = LIGHT_LEVELS.find(l => voltage <= l.max) || LIGHT_LEVELS[LIGHT_LEVELS.length - 1]

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Voltaje */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 10 }}>
        <span style={{
          fontSize: 32, fontWeight: 300, lineHeight: 1, color: '#202124',
          fontFamily: "'Familjen Grotesk', sans-serif", letterSpacing: '-0.02em',
        }}>
          {Number(voltage).toFixed(2)}
        </span>
        <span style={{ fontSize: 12, color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif" }}>V</span>
      </div>

      {/* Barra degradada */}
      <div style={{ position: 'relative', height: 8, borderRadius: 4, marginBottom: 5 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 4,
          background: 'linear-gradient(to right, #0A0A0A 0%, #1C0A3C 18%, #6B2D8B 35%, #C84B11 52%, #F9AB00 72%, #FFF9C4 88%, #FFFFFF 100%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
        }}/>
        {/* Marcador */}
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: '#FFFFFF',
          border: '2px solid #5F6368',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          zIndex: 1,
        }}/>
      </div>

      {/* Etiquetas extremos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 8, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>0</span>
        <span style={{ fontSize: 8, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>3.5 V</span>
      </div>

      {/* Badge nivel actual */}
      <div style={{
        display: 'inline-block',
        padding: '2px 8px', borderRadius: 10,
        background: level.color + '22',
        border: `1px solid ${level.color}55`,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 500, color: level.color,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {level.label}
        </span>
      </div>
    </div>
  )
}

export function SensorCard({ field, data, onClick, active }) {
  const cfg = FIELD_CONFIG[field]
  if (!cfg) return null

  const Icon = WeatherIcons[cfg.icon]
  const raw = data?.[field] ?? null
  const value = raw !== null
    ? (cfg.transform ? cfg.transform(raw) : Number(raw).toFixed(cfg.decimals))
    : '—'

  const ts = data?._ts
    ? new Date(data._ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <button
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${active ? cfg.color : '#F1F3F4'}`,
        borderRadius: 20,
        padding: '22px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        boxShadow: active ? `0 4px 24px ${cfg.color}1A` : '0 1px 4px rgba(60,64,67,0.05)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = active
          ? `0 6px 28px ${cfg.color}22`
          : '0 4px 16px rgba(60,64,67,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = active
          ? `0 4px 24px ${cfg.color}1A`
          : '0 1px 4px rgba(60,64,67,0.05)'
      }}
    >
      {/* Fondo tint sutil */}
      <div style={{
        position: 'absolute', right: -20, top: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: cfg.bgTint, opacity: active ? 0.8 : 0.5,
        transition: 'opacity 0.2s',
      }}/>

      {/* Icono */}
      <div style={{ marginBottom: 14, position: 'relative' }}>
        {cfg.icon === 'winddir' && raw !== null
          ? <WeatherIcons.winddir size={34} color={cfg.color} deg={raw}/>
          : Icon ? <Icon size={34} color={cfg.color}/> : null
        }
      </div>

      {/* Label */}
      <p style={{
        margin: '0 0 3px 0',
        fontSize: 10, fontWeight: 500,
        letterSpacing: '0.09em', textTransform: 'uppercase',
        color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif",
      }}>
        {cfg.label}
      </p>

      {/* Valor */}
      {field === 'light_v'
        ? <UVBar voltage={raw} />
        : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
            <span style={{
              fontSize: 32, fontWeight: 300, lineHeight: 1,
              color: raw !== null ? '#202124' : '#DADCE0',
              fontFamily: "'Familjen Grotesk', sans-serif",
              letterSpacing: '-0.02em',
            }}>
              {value}
            </span>
            <span style={{ fontSize: 12, color: '#9AA0A6', fontFamily: "'DM Sans', sans-serif" }}>
              {cfg.unit}
            </span>
            {/* Rosa de viento */}
            {field === 'winddir_deg' && raw !== null && (
              <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500, marginLeft: 2 }}>
                {windLabel(raw)}
              </span>
            )}
          </div>
        )
      }

      <p style={{ margin: 0, fontSize: 10, color: '#BDC1C6', fontFamily: "'DM Sans', sans-serif" }}>
        {ts ? ts : 'Sin datos'}
      </p>

      {active && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 6, height: 6, borderRadius: '50%',
          background: cfg.color,
        }}/>
      )}
    </button>
  )
}
