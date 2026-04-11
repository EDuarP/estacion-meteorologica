import json
import serial
import time
import paho.mqtt.client as mqtt

SERIAL_PORT = "/dev/ttyUSB0"
BAUD = 115200

MQTT_BROKER = "192.168.40.104"
MQTT_PORT = 1883
MQTT_TOPIC = "weather/station1"

def main():
    ser = serial.Serial(SERIAL_PORT, BAUD, timeout=2)
    time.sleep(2)

    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue

        try:
            data = json.loads(line)
            payload = json.dumps(data)
            client.publish(MQTT_TOPIC, payload, qos=0, retain=False)
            print("Publicado:", payload)
        except json.JSONDecodeError:
            print("Línea inválida:", line)

if __name__ == "__main__":
    main()
