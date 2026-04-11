import json
import serial
import time

SERIAL_PORT = "/dev/ttyACM0"   # o /dev/ttyUSB0
BAUD = 115200

def main():
    ser = serial.Serial(SERIAL_PORT, BAUD, timeout=2)
    time.sleep(2)

    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue

        try:
            data = json.loads(line)
            print("Dato recibido:")
            print(data)
        except json.JSONDecodeError:
            print("No JSON:", line)

if __name__ == "__main__":
    main()
