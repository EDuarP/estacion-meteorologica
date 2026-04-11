#!/bin/bash
# ══════════════════════════════════════════════════════════
#  INSTALADOR — Estación Meteorológica Autostart
#  Ejecuta este script UNA SOLA VEZ en la Raspberry Pi:
#
#      bash ~/Desktop/estacion-meteorologica/instalar_autostart.sh
#
# ══════════════════════════════════════════════════════════

SCRIPT_DIR="$HOME/Desktop/estacion-meteorologica"
AUTOSTART_DIR="$HOME/.config/autostart"
DESKTOP_FILE="$AUTOSTART_DIR/estacion-meteorologica.desktop"
RUNNER="$SCRIPT_DIR/autostart.sh"

echo ""
echo "🌤  Instalando autostart — Estación Meteorológica"
echo "──────────────────────────────────────────────────"

# 1. Dar permisos de ejecución al script runner
chmod +x "$RUNNER"
echo "✅  Permisos aplicados a autostart.sh"

# 2. Crear carpeta autostart si no existe
mkdir -p "$AUTOSTART_DIR"

# 3. Crear el archivo .desktop
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Type=Application
Name=Estación Meteorológica
Comment=Inicia main_mqtt.py al arrancar la Raspberry Pi
Exec=lxterminal --title="Estación Meteorológica" -e "bash $RUNNER; bash"
Terminal=false
X-GNOME-Autostart-enabled=true
EOF

echo "✅  Archivo .desktop creado en: $DESKTOP_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Listo. Al reiniciar la Raspberry Pi:"
echo "  → Se abrirá una terminal con el script corriendo"
echo "  → Los logs se guardan en: $SCRIPT_DIR/estacion.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Para probar SIN reiniciar:"
echo "  bash $RUNNER"
echo ""
