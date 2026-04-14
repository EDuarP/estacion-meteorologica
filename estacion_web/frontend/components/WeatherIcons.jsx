// Iconos SVG estilo Google Stitch

export const WeatherIcons = {
  temperatura: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="34" r="7" stroke={color} strokeWidth="2"/>
      <circle cx="24" cy="34" r="3.5" fill={color}/>
      <rect x="21.5" y="10" width="5" height="20" rx="2.5" stroke={color} strokeWidth="2"/>
      <rect x="23" y="14" width="2" height="14" rx="1" fill={color} opacity="0.25"/>
      <line x1="27" y1="15" x2="31" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="27" y1="20" x2="31" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="27" y1="25" x2="31" y2="25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  humedad: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 8C24 8 13 22 13 30c0 6.627 4.925 12 11 12s11-5.373 11-12c0-8-11-22-11-22z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 14c0 0-7 10-7 16 0 3.866 3.134 7 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  presion: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="26" r="14" stroke={color} strokeWidth="2"/>
      <path d="M13 26A11 11 0 0135 26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="26" x2="31" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="26" r="2" fill={color}/>
      <line x1="14" y1="26" x2="12" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="26" x2="36" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="14" x2="24" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  lluvia: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M34 22c0-4.971-3.582-9-8-9-1.673 0-3.225.547-4.5 1.474C20.225 11.345 17.238 9 13.5 9 8.806 9 5 12.806 5 17.5S8.806 26 13.5 26H34c3.314 0 6-2.686 6-6s-2.686-6-6-6c0 0 0 8 0 8z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="16" y1="32" x2="14" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="32" x2="22" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="32" y1="32" x2="30" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="36" x2="18" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="36" x2="26" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  viento: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8 20h22c3.314 0 6-2.686 6-6s-2.686-6-6-6c-2.761 0-5 2.239-5 5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 27h26c3.314 0 6 2.686 6 6s-2.686 6-6 6c-2.761 0-5-2.239-5-5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="24" x2="28" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  winddir: ({ size = 48, color = "#202124", deg = 0 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="2"/>
      <g transform={`rotate(${deg} 24 24)`}>
        <polygon points="24,10 28,28 24,25 20,28" fill={color} opacity="0.9"/>
      </g>
      <circle cx="24" cy="24" r="2.5" fill={color}/>
    </svg>
  ),
  luz: ({ size = 48, color = "#202124" }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="2"/>
      <line x1="24" y1="6"  x2="24" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="36" x2="24" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="6"  y1="24" x2="12" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="24" x2="42" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="9.5"  y1="9.5"  x2="13.8" y2="13.8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="34.2" y1="34.2" x2="38.5" y2="38.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="38.5" y1="9.5"  x2="34.2" y2="13.8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="13.8" y1="34.2" x2="9.5"  y2="38.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  bateria: ({ size = 48, color = "#202124", pct = 100 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="15" width="34" height="18" rx="3" stroke={color} strokeWidth="2"/>
      <rect x="8" y="17" width={Math.max(1, pct * 0.3)} height="14" rx="2" fill={color} opacity="0.6"/>
      <path d="M40 20v8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  connected: ({ size = 10, color = "#34A853" }) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="3" fill={color}/>
      <circle cx="5" cy="5" r="4.5" stroke={color} strokeWidth="1" fill="none" opacity="0.3"/>
    </svg>
  ),
  disconnected: ({ size = 10, color = "#EA4335" }) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="3" fill={color} opacity="0.4"/>
    </svg>
  ),
}

// Configuración visual de cada campo del JSON
export const FIELD_CONFIG = {
  temp_c:        { label: "Temperatura",   unit: "°C",   icon: "temperatura", color: "#FA7B17", decimals: 1, bgTint: "#FFF3E0" },
  humidity_rh:   { label: "Humedad",        unit: "%",    icon: "humedad",     color: "#4285F4", decimals: 1, bgTint: "#E8F0FE" },
  pressure_pa:   { label: "Presión",        unit: "hPa",  icon: "presion",     color: "#5F6368", decimals: 0, bgTint: "#F1F3F4", transform: v => +(v/100).toFixed(0) },
  wind_kph:      { label: "Viento",         unit: "km/h", icon: "viento",      color: "#34A853", decimals: 1, bgTint: "#E6F4EA" },
  winddir_deg:   { label: "Dirección",      unit: "°",    icon: "winddir",     color: "#34A853", decimals: 0, bgTint: "#E6F4EA" },
  rain_mm_h:     { label: "Lluvia/hora",    unit: "mm/h", icon: "lluvia",      color: "#1A73E8", decimals: 2, bgTint: "#E8F0FE" },
  rain_total_mm: { label: "Lluvia hoy",     unit: "mm",   icon: "lluvia",      color: "#1A73E8", decimals: 2, bgTint: "#E8F0FE" },
  light_v:       { label: "Luz",            unit: "V",    icon: "luz",         color: "#F9AB00", decimals: 2, bgTint: "#FEF9E0" },
  battery_v:     { label: "Batería",        unit: "V",    icon: "bateria",     color: "#137333", decimals: 2, bgTint: "#E6F4EA" },
}

// Orden de aparición en la grid principal
export const PRIMARY_FIELDS  = ["temp_c", "humidity_rh", "pressure_pa", "wind_kph", "winddir_deg", "rain_mm_h"]
export const SECONDARY_FIELDS = ["rain_total_mm", "light_v", "battery_v"]
