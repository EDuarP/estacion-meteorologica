"""
Simula la estación publicando el mismo JSON que tu Arduino/ESP.
Uso: python test_mqtt_publisher.py
"""
import json, time, math, random
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT   = 1883
TOPIC  = "weather/station1"

def main():
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    print(f"📡 Publicando en {BROKER}:{PORT} → {TOPIC}\nCtrl+C para detener\n")
    t = 0
    rain_total = 0.0
    while True:
        rain_h = max(0, 0.5 * math.sin(t * 0.05) + random.uniform(-0.1, 0.3))
        rain_total += rain_h * (3 / 3600)
        data = {
            "winddir_deg":   round((180 + 90 * math.sin(t * 0.03)) % 360, 0),
            "winddir_adc":   random.randint(300, 1000),
            "wind_clicks":   random.randint(0, 5),
            "wind_kph":      round(max(0, 10 + 8 * math.sin(t * 0.07) + random.uniform(-1, 1)), 2),
            "sample_ms":     1000,
            "rain_tips":     random.randint(0, 1),
            "rain_mm_h":     round(rain_h, 3),
            "rain_total_mm": round(rain_total, 3),
            "humidity_rh":   round(65 + 10 * math.sin(t * 0.04) + random.uniform(-1, 1), 2),
            "temp_c":        round(22 + 4 * math.sin(t * 0.06) + random.uniform(-0.2, 0.2), 2),
            "pressure_pa":   round(100845 + 200 * math.sin(t * 0.02) + random.uniform(-10, 10), 2),
            "battery_v":     round(4.1 + random.uniform(-0.05, 0.05), 2),
            "light_v":       round(max(0, 1.5 + 0.8 * math.sin(t * 0.1)), 2),
            "millis":        t * 3000,
        }
        client.publish(TOPIC, json.dumps(data))
        print(f"  {data['temp_c']}°C  {data['humidity_rh']}%  "
              f"{data['wind_kph']} km/h  {data['winddir_deg']}°  {data['rain_mm_h']} mm/h")
        t += 1
        time.sleep(3)

if __name__ == "__main__":
    main()
