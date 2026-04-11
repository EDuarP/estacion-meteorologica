#!/bin/bash
# ─────────────────────────────────────────────
#  Estación Meteorológica — Autostart
#  Archivo: ~/Desktop/estacion-meteorologica/autostart.sh
# ─────────────────────────────────────────────

SCRIPT_DIR="$HOME/Desktop/estacion-meteorologica"
SCRIPT="$SCRIPT_DIR/main_mqtt.py"
LOGFILE="$SCRIPT_DIR/estacion.log"

cd "$SCRIPT_DIR"

echo "===============================" >> "$LOGFILE"
echo " Iniciando: $(date)" >> "$LOGFILE"
echo "===============================" >> "$LOGFILE"

python3 "$SCRIPT" 2>&1 | tee -a "$LOGFILE"
