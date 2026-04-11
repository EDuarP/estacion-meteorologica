# Estación Meteorológica IoT

Sistema completo de monitoreo meteorológico con sensores SparkFun, comunicación serial, broker MQTT y dashboard web en tiempo real.

---

## Hardware

### Componentes principales

| Componente | Descripción | SKU |
|---|---|---|
| **Arduino Uno R3** | Microcontrolador principal | — |
| **SparkFun Weather Shield** | Shield con conectores RJ11 para sensores meteorológicos + I²C | DEV-13956 |
| **SparkFun Weather Meter Kit** | Anemómetro, veleta y pluviómetro | [SEN-15901](https://www.sparkfun.com/weather-meter-kit.html) |

### Sensores en el Weather Shield

| Sensor | Chip | Librería Arduino | Mide |
|---|---|---|---|
| Temperatura y Humedad | **HTU21D** | `SparkFunHTU21D.h` | Temperatura (°C), Humedad relativa (%) |
| Presión atmosférica | **MPL3115A2** | `SparkFunMPL3115A2.h` | Presión (Pa), Altitud (m) |

### Sensores del Weather Meter Kit

| Sensor | Principio | Resolución |
|---|---|---|
| **Anemómetro** | Reed switch magnético | 1 pulso/rot = 1.492 MPH (2.4 km/h) |
| **Veleta** | Divisor resistivo (8 posiciones) | 16 direcciones posibles, 8 confiables |
| **Pluviómetro** | Cubeta basculante | 1 tip = 0.2794 mm de lluvia |

Los tres sensores del kit se conectan al Weather Shield mediante **cables RJ11** incluidos en el kit.

---

## Arquitectura general

```
┌──────────────────────────────────┐        USB Serial         ┌──────────────────────────────┐
│         Arduino Uno R3           │ ────────────────────────► │       Raspberry Pi           │
│                                  │      /dev/ttyACM0          │                              │
│  ┌─────────────────────────────┐ │      115200 baud           │  main_mqtt.py                │
│  │   SparkFun Weather Shield   │ │                            │  ├─ Lee serial               │
│  │                             │ │                            │  ├─ Parsea JSON              │
│  │  HTU21D  ── I²C ──────────► │ │   JSON cada ~1s           │  └─ Publica MQTT             │
│  │  MPL3115A2 ─ I²C ─────────► │ │ ◄────────────────────────  │                              │
│  │                             │ │                            │  Mosquitto :1883             │
│  │  RJ11 ─── Anemómetro        │ │                            │                              │
│  │  RJ11 ─── Veleta            │ │                            │  FastAPI Backend :8000       │
│  │  RJ11 ─── Pluviómetro       │ │                            │  ├─ Suscriptor MQTT          │
│  └─────────────────────────────┘ │                            │  ├─ SQLite DB                │
└──────────────────────────────────┘                            │  └─ REST API + WebSocket     │
                                                                │                              │
                                                                │  Dashboard React :3000       │
                                                                └──────────────────────────────┘
```

---

## Estructura del repositorio

```
estacion-meteorologica/
│
├── estacion_meteorologica.ino    ← Sketch Arduino (cargar en el Uno R3)
├── main_mqtt.py                  ← Script Raspberry Pi: serial → MQTT
│
├── autostart.sh                  ← Arranca main_mqtt.py con terminal visible
├── instalar_autostart.sh         ← Instala el autostart (correr una sola vez)
│
└── estacion-meteorologica-web/   ← Dashboard web completo
    ├── docker-compose.yml
    ├── mosquitto/config/
    ├── backend/                  ← FastAPI + SQLite
    └── frontend/                 ← React + Recharts
```

---

## 1. Configurar el Arduino

### 1.1 Instalar las librerías requeridas

Abre el **Arduino IDE** y ve a `Herramientas → Administrar bibliotecas...`

Busca e instala las siguientes librerías:

| Librería | Autor | Buscar como |
|---|---|---|
| `SparkFunMPL3115A2` | SparkFun Electronics | `MPL3115A2` |
| `SparkFunHTU21D` | SparkFun Electronics | `HTU21D` |

O instálalas manualmente desde GitHub:

```
https://github.com/sparkfun/SparkFun_MPL3115A2_Breakout_Arduino_Library
https://github.com/sparkfun/SparkFun_HTU21D_Breakout_Arduino_Library
```

**Pasos para instalar desde ZIP:**
1. Descargar el ZIP desde GitHub (`Code → Download ZIP`)
2. En Arduino IDE: `Sketch → Incluir Librería → Añadir biblioteca .ZIP`
3. Seleccionar el archivo descargado
4. Repetir para la segunda librería

### 1.2 Cargar el sketch

1. Conecta el Arduino Uno R3 al computador por USB
2. Abre `estacion_meteorologica.ino` en Arduino IDE
3. Selecciona la placa: `Herramientas → Placa → Arduino AVR Boards → Arduino Uno`
4. Selecciona el puerto: `Herramientas → Puerto → COMx` (Windows) o `/dev/ttyACM0` (Linux/Mac)
5. Clic en **Subir** (→)

### 1.3 Verificar la salida serial

Abre el **Monitor Serial** (`Herramientas → Monitor Serial`) a **115200 baudios**. Deberías ver JSON como este cada segundo:

```json
{"winddir_deg":270,"winddir_adc":985,"wind_clicks":3,"wind_kph":7.202,"sample_ms":1000,"rain_tips":0,"rain_mm_h":0.000,"rain_total_mm":1.118,"humidity_rh":71.20,"temp_c":25.34,"pressure_pa":100845.22,"battery_v":4.82,"light_v":1.73,"millis":123456}
```

---

## 2. Formato de datos

El Arduino publica un JSON completo por el puerto serial. `main_mqtt.py` lo lee y lo reenvía al topic MQTT sin modificar.

**Topic MQTT:** `weather/station1`

| Campo | Unidad | Sensor origen | Descripción |
|---|---|---|---|
| `winddir_deg` | ° | Veleta (MPL3115A2 ADC) | Dirección del viento (0–360°) |
| `winddir_adc` | raw | Veleta | Lectura ADC cruda del divisor resistivo |
| `wind_clicks` | pulsos | Anemómetro | Pulsos del reed switch en el período |
| `wind_kph` | km/h | Anemómetro | Velocidad calculada (pulsos × factor) |
| `sample_ms` | ms | Arduino | Duración del período de muestreo |
| `rain_tips` | pulsos | Pluviómetro | Tips de la cubeta en el período |
| `rain_mm_h` | mm/h | Pluviómetro | Tasa de lluvia instantánea |
| `rain_total_mm` | mm | Pluviómetro | Acumulado total (0.2794 mm/tip) |
| `humidity_rh` | % | **HTU21D** | Humedad relativa |
| `temp_c` | °C | **HTU21D** | Temperatura ambiente |
| `pressure_pa` | Pa | **MPL3115A2** | Presión atmosférica (backend convierte a hPa) |
| `battery_v` | V | Weather Shield | Tensión de la batería de respaldo |
| `light_v` | V | Weather Shield | Sensor de luz ambiente (fotodiodo) |
| `millis` | ms | Arduino | Tiempo de uptime del Arduino |

---

## 3. Montar en la Raspberry Pi

### 3.1 Requisitos

- Raspberry Pi 3B+ / 4 con Raspberry Pi OS
- Python 3.8+
- Docker + Docker Compose

### 3.2 Clonar el repositorio

```bash
cd ~/Desktop
git clone https://github.com/EDuarP/estacion-meteorologica.git
cd estacion-meteorologica
```

### 3.3 Instalar dependencias Python

```bash
pip3 install pyserial paho-mqtt
```

### 3.4 Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para aplicar el grupo
newgrp docker
```

### 3.5 Verificar el puerto serial del Arduino

```bash
# Conecta el Arduino y ejecuta:
ls /dev/tty*
# Normalmente: /dev/ttyUSB0
```

Si es diferente, edita `main_mqtt.py`:
```python
SERIAL_PORT = "/dev/ttyUSB0"  # ← cambiar aquí
```

### 3.6 Levantar el stack web

```bash
cd ~/Desktop/estacion-meteorologica/estacion-meteorologica-web
docker-compose up --build -d
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| 🌐 Dashboard | http://localhost:3000 |
| ⚙️ API + documentación | http://localhost:8000/docs |
| 📡 MQTT Broker | localhost:1883 |

### 3.7 Iniciar main_mqtt.py

```bash
cd ~/Desktop/estacion-meteorologica
python3 main_mqtt.py
```

Salida esperada:
```
Publicado: {"winddir_deg": 270, "temp_c": 25.34, "humidity_rh": 71.2, ...}
```

---

## 4. Autostart al encender la Raspberry Pi

Para que `main_mqtt.py` arranque automáticamente con una terminal visible:

```bash
# Solo necesitas correr esto UNA VEZ
bash ~/Desktop/estacion-meteorologica/instalar_autostart.sh
```

Reinicia la Raspberry Pi. Al arrancar el escritorio, se abrirá automáticamente una terminal con el script corriendo.

Los logs se guardan en:
```
~/Desktop/estacion-meteorologica/estacion.log
```

Para ver los logs en tiempo real:
```bash
tail -f ~/Desktop/estacion-meteorologica/estacion.log
```

---

## 5. Conexión física del Weather Meter Kit

Los tres sensores se conectan al **SparkFun Weather Shield** mediante los conectores RJ11:

```
Weather Shield
├── RJ11 (Wind)   ──── Anemómetro  (cable negro del kit)
├── RJ11 (Wind)   ──── Veleta      (cable amarillo del kit)
└── RJ11 (Rain)   ──── Pluviómetro (cable verde del kit)
```

> ⚠️ El Weather Shield se monta directamente sobre el Arduino Uno R3 encajando los headers. No se requiere cableado adicional para los sensores I²C (HTU21D y MPL3115A2) ya que están soldados en el shield.

---

## 6. API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/latest` | Último paquete completo |
| `GET` | `/api/history?field=temp_c&hours=24` | Historial de un campo |
| `GET` | `/api/stats?field=temp_c&hours=24` | Min / Max / Promedio |
| `GET` | `/api/fields` | Metadatos de todos los campos |
| `WS` | `/api/ws` | WebSocket tiempo real |

Campos válidos: `temp_c`, `humidity_rh`, `pressure_pa`, `wind_kph`, `winddir_deg`, `rain_mm_h`, `rain_total_mm`, `light_v`, `battery_v`

```bash
curl http://localhost:8000/api/latest
curl "http://localhost:8000/api/history?field=temp_c&hours=6"
curl "http://localhost:8000/api/stats?field=humidity_rh&hours=24"
```

---

## 7. Solución de problemas

**Puerto serial `/dev/ttyACM0` con permiso denegado:**
```bash
sudo usermod -aG dialout $USER
# Cerrar sesión y volver a entrar
```

**Arduino no aparece en los puertos:**
```bash
# Verificar que el sistema reconoce el dispositivo
dmesg | grep tty
```

**El sketch no compila — error de librería:**
- Verificar que `SparkFunMPL3115A2` y `SparkFunHTU21D` están instaladas en `Herramientas → Administrar bibliotecas`
- Asegurarse de que las líneas `#include` están al inicio del sketch:
```cpp
#include "SparkFunMPL3115A2.h"
#include "SparkFunHTU21D.h"
```

**El dashboard no muestra datos:**
```bash
docker logs estacion_backend -f    # Ver logs del backend
docker logs estacion_mosquitto -f  # Ver logs del broker MQTT
```

**Docker no arranca:**
```bash
sudo systemctl start docker
sudo systemctl enable docker  # Para que inicie con la Raspberry Pi
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Microcontrolador | Arduino Uno R3 |
| Shield meteorológico | SparkFun Weather Shield |
| Sensores ambientales | HTU21D (temp/hum) + MPL3115A2 (presión) |
| Sensores mecánicos | SparkFun Weather Meter Kit SEN-15901 |
| Bridge serial → MQTT | Python 3 + pyserial + paho-mqtt |
| Broker MQTT | Eclipse Mosquitto 2.0 |
| Base de datos | SQLite + aiosqlite |
| Backend | FastAPI + SQLAlchemy |
| Frontend | React 18 + Vite + Recharts |
| Orquestación | Docker Compose |

---

## Referencias

- [SparkFun Weather Meter Kit — Hookup Guide](https://learn.sparkfun.com/tutorials/weather-meter-hookup-guide)
- [SparkFun Weather Shield — Hookup Guide](https://learn.sparkfun.com/tutorials/weather-shield-hookup-guide-v11)
- [Librería MPL3115A2](https://github.com/sparkfun/SparkFun_MPL3115A2_Breakout_Arduino_Library)
- [Librería HTU21D](https://github.com/sparkfun/SparkFun_HTU21D_Breakout_Arduino_Library)
- [Eclipse Mosquitto](https://mosquitto.org)

---

## Licencia

MIT — libre para uso educativo y personal.
