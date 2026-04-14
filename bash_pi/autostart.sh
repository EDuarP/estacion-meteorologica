#!/bin/bash
# ─────────────────────────────────────────────
#  Estación Meteorológica — Autostart
#  Archivo: ~/Desktop/estacion-meteorologica/autostart.sh
# ─────────────────────────────────────────────

SCRIPT_DIR="$HOME/Desktop/estacion-meteorologica"
SCRIPT="$SCRIPT_DIR/main_mqtt.py"
LOGFILE="$SCRIPT_DIR/estacion.log"
MQTT_HOST="192.168.40.104"

cd "$SCRIPT_DIR"

echo "===============================" >> "$LOGFILE"
echo " Iniciando: $(date)" >> "$LOGFILE"
echo "===============================" >> "$LOGFILE"

# Esperar red: ciclo infinito hasta que el broker MQTT sea alcanzable
echo " Esperando conexión de red..." >> "$LOGFILE"
while ! ping -c 1 -W 2 "$MQTT_HOST" &>/dev/null; do
    echo " Sin red ($(date '+%H:%M:%S')), reintentando en 5s..." >> "$LOGFILE"
    sleep 5
done
echo " Red disponible: $(date)" >> "$LOGFILE"

# Ciclo de reinicio: si el script Python falla, se reinicia automáticamente
while true; do
    python3 "$SCRIPT" 2>&1 | tee -a "$LOGFILE"
    echo " Script terminó ($(date)). Reiniciando en 10s..." >> "$LOGFILE"
    sleep 10
done
