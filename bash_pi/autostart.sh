#!/bin/bash

SCRIPT_DIR="$HOME/Desktop/estacion-meteorologica"
SCRIPT="$SCRIPT_DIR/main_mqtt.py"
LOGFILE="$SCRIPT_DIR/estacion.log"
MQTT_HOST="192.168.40.104"

cd "$SCRIPT_DIR" || exit 1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

log "==============================="
log "Iniciando autostart"
log "Directorio: $SCRIPT_DIR"
log "Script: $SCRIPT"
log "Broker MQTT: $MQTT_HOST"
log "==============================="

log "Esperando conexión con el broker..."

while ! ping -c 1 -W 2 "$MQTT_HOST" >/dev/null 2>&1; do
    log "Broker no disponible todavía. Reintentando en 5s..."
    sleep 5
done

log "Red disponible / broker alcanzable"

while true; do
    log "Lanzando Python..."
    python3 -u "$SCRIPT" 2>&1 | tee -a "$LOGFILE"
    EXIT_CODE=${PIPESTATUS[0]}
    log "Python terminó con código: $EXIT_CODE"
    log "Reiniciando en 10s..."
    sleep 10
done
