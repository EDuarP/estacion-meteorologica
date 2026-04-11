# Estación Meteorológica — Dashboard Web

Dashboard minimalista para visualizar datos meteorológicos vía MQTT.

## Stack
| Capa | Tecnología |
|------|-----------|
| Broker MQTT | Eclipse Mosquitto 2.0 |
| Backend | FastAPI + paho-mqtt + SQLAlchemy |
| Frontend | React + Vite + Recharts |
| DB | SQLite (embebida) |

## Estructura
```
estacion-meteorologica-web/
├── docker-compose.yml
├── mosquitto/
│   └── config/mosquitto.conf
├── backend/
│   ├── main.py           ← FastAPI app
│   ├── mqtt_client.py    ← Suscriptor MQTT
│   ├── models.py         ← Modelos SQLAlchemy
│   ├── database.py       ← Configuración DB
│   └── routers/
│       └── sensors.py    ← Endpoints REST + WS
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── WeatherIcons.jsx  ← SVG estilo Google Stitch
        │   ├── SensorCard.jsx
        │   └── SensorChart.jsx
        ├── hooks/useWebSocket.js
        └── services/api.js
```

## Levantar con Docker

```bash
# Construir e iniciar todo
docker-compose up --build

# Acceder a:
# Dashboard:   http://localhost:5173
# API docs:    http://localhost:8000/docs
# MQTT broker: localhost:1883
```

## Topics MQTT esperados

El broker escucha `estacion/#`. Tu ESP8266 / Wemos D1 Mini debe publicar en:

```
estacion/temperatura   → 23.5
estacion/humedad       → 67
estacion/presion       → 1013.2
estacion/lluvia        → 0.0
estacion/viento        → 12.4
estacion/uv            → 3
estacion/luz           → 8500
```

El payload puede ser un número plano o JSON:
```json
{"value": 23.5}
```

## Publicar datos de prueba

```bash
# Instalar cliente MQTT
pip install paho-mqtt

# O con mosquitto_pub desde terminal
mosquitto_pub -h localhost -t "estacion/temperatura" -m "24.3"
mosquitto_pub -h localhost -t "estacion/humedad" -m "72"
mosquitto_pub -h localhost -t "estacion/presion" -m "1015.8"
```

## API REST

| Endpoint | Descripción |
|---------|-------------|
| `GET /api/readings/latest` | Último valor de cada sensor |
| `GET /api/readings/history?sensor_type=temperatura&hours=24` | Historial |
| `GET /api/readings/stats?sensor_type=temperatura&hours=24` | Min/Max/Avg |
| `GET /api/sensors` | Lista de sensores registrados |
| `WS  /api/ws` | WebSocket en tiempo real |

## Desarrollo local (sin Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```
