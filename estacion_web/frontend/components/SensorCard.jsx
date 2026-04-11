import { WeatherIcons, FIELD_CONFIG } from './WeatherIcons'

const WIND_DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"]

function windLabel(deg) {
  if (deg == null) return '—'
  return WIND_DIRS[Math.round(deg / 22.5) % 16]
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
