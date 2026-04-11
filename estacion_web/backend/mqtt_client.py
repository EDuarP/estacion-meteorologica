import json
import logging
import os
import asyncio
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from database import AsyncSessionLocal
from models import WeatherReading, MQTT_TOPIC

logger = logging.getLogger("mqtt_client")

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", 1883))

_message_queue: asyncio.Queue = None
_loop: asyncio.AbstractEventLoop = None

# Último paquete completo recibido
latest: dict = {}
_ws_callbacks: list = []


def register_ws_callback(cb):
    _ws_callbacks.append(cb)

def unregister_ws_callback(cb):
    if cb in _ws_callbacks:
        _ws_callbacks.remove(cb)


def _on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info(f"✅ Conectado a Mosquitto {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe(MQTT_TOPIC)
        logger.info(f"📡 Suscrito a '{MQTT_TOPIC}'")
    else:
        logger.error(f"❌ Error MQTT rc={rc}")


def _on_message(client, userdata, msg):
    global _message_queue, _loop
    try:
        data = json.loads(msg.payload.decode("utf-8"))
        if _loop and _message_queue:
            asyncio.run_coroutine_threadsafe(_message_queue.put(data), _loop)
    except Exception as e:
        logger.warning(f"Payload inválido: {e}")


async def _process_messages():
    global _message_queue
    while True:
        try:
            data = await asyncio.wait_for(_message_queue.get(), timeout=1.0)

            # Guardar en DB
            async with AsyncSessionLocal() as db:
                # pressure_pa → hPa para comodidad de lectura se guarda en Pa
                row = WeatherReading(
                    timestamp     = datetime.now(timezone.utc),
                    winddir_deg   = data.get("winddir_deg"),
                    winddir_adc   = data.get("winddir_adc"),
                    wind_clicks   = data.get("wind_clicks"),
                    wind_kph      = data.get("wind_kph"),
                    rain_tips     = data.get("rain_tips"),
                    rain_mm_h     = data.get("rain_mm_h"),
                    rain_total_mm = data.get("rain_total_mm"),
                    humidity_rh   = data.get("humidity_rh"),
                    temp_c        = data.get("temp_c"),
                    pressure_pa   = data.get("pressure_pa"),
                    battery_v     = data.get("battery_v"),
                    light_v       = data.get("light_v"),
                    sample_ms     = data.get("sample_ms"),
                    millis        = data.get("millis"),
                )
                db.add(row)
                await db.commit()

            # Actualizar estado en memoria — convertir pressure_pa → hPa al vuelo
            payload = dict(data)
            if payload.get("pressure_pa"):
                payload["pressure_hpa"] = round(payload["pressure_pa"] / 100, 2)

            latest.clear()
            latest.update(payload)
            latest["_ts"] = datetime.now(timezone.utc).isoformat()

            logger.info(f"💾 {data.get('temp_c')}°C  {data.get('humidity_rh')}%  "
                        f"{data.get('wind_kph')} km/h  {data.get('rain_mm_h')} mm/h")

            # Broadcast WS
            broadcast = json.dumps({"type": "update", "data": latest})
            for cb in list(_ws_callbacks):
                try:
                    asyncio.ensure_future(cb(broadcast))
                except Exception:
                    pass

        except asyncio.TimeoutError:
            continue
        except Exception as e:
            logger.error(f"Error procesando: {e}")


def start_mqtt_client(loop: asyncio.AbstractEventLoop):
    global _message_queue, _loop
    _loop = loop
    _message_queue = asyncio.Queue()

    client = mqtt.Client()
    client.on_connect = _on_connect
    client.on_message = _on_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        client.loop_start()
    except Exception as e:
        logger.error(f"No se pudo conectar al broker: {e}")

    asyncio.ensure_future(_process_messages())
    return client
