from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from database import Base


class WeatherReading(Base):
    __tablename__ = "weather_readings"

    id            = Column(Integer, primary_key=True, index=True)
    timestamp     = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    winddir_deg   = Column(Float, nullable=True)
    winddir_adc   = Column(Float, nullable=True)
    wind_clicks   = Column(Float, nullable=True)
    wind_kph      = Column(Float, nullable=True)

    rain_tips     = Column(Float, nullable=True)
    rain_mm_h     = Column(Float, nullable=True)
    rain_total_mm = Column(Float, nullable=True)

    humidity_rh   = Column(Float, nullable=True)
    temp_c        = Column(Float, nullable=True)
    pressure_pa   = Column(Float, nullable=True)

    battery_v     = Column(Float, nullable=True)
    light_v       = Column(Float, nullable=True)
    sample_ms     = Column(Float, nullable=True)
    millis        = Column(Float, nullable=True)

    raw_topic     = Column(String, default="weather/station1")


MQTT_TOPIC = "weather/station1"

FIELD_META = {
    "temp_c":        {"label": "Temperatura",  "unit": "°C",   "icon": "temperatura", "color": "#FA7B17", "decimals": 1},
    "humidity_rh":   {"label": "Humedad",       "unit": "%",    "icon": "humedad",     "color": "#4285F4", "decimals": 1},
    "pressure_pa":   {"label": "Presión",       "unit": "hPa",  "icon": "presion",     "color": "#5F6368", "decimals": 0},
    "wind_kph":      {"label": "Viento",        "unit": "km/h", "icon": "viento",      "color": "#34A853", "decimals": 1},
    "winddir_deg":   {"label": "Dir. Viento",   "unit": "°",    "icon": "winddir",     "color": "#34A853", "decimals": 0},
    "rain_mm_h":     {"label": "Lluvia/hora",   "unit": "mm/h", "icon": "lluvia",      "color": "#1A73E8", "decimals": 2},
    "rain_total_mm": {"label": "Lluvia hoy",    "unit": "mm",   "icon": "lluvia",      "color": "#1A73E8", "decimals": 2},
    "light_v":       {"label": "Luz",           "unit": "V",    "icon": "luz",         "color": "#F9AB00", "decimals": 2},
    "battery_v":     {"label": "Batería",       "unit": "V",    "icon": "bateria",     "color": "#137333", "decimals": 2},
}
